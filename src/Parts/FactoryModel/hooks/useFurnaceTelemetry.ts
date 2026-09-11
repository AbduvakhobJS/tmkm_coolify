import { useEffect, useRef, useState } from "react";

export interface FurnaceZoneState {
    temp: number | null;
    setpoint: number;
}

export interface FurnaceState {
    /** 1-based — matches the `{n}t_qobiq*` / `asosiy_chiroq{n}` node-name prefix in det.glb. */
    index: number;
    title: string;
    /** "Ishlamoqda" (В работе) — drives the qobiq tint and the asosiy_chiroq blink. */
    status: boolean;
    /** 5 shell segments per furnace, in `{n}t_qobiq1..5` order. */
    zones: FurnaceZoneState[];
}

interface ZoneConfig {
    tempKey: string;
    spKey: string;
    setpoint: number;
}

interface FurnaceConfig {
    index: number;
    title: string;
    deviceId: string;
    statusKey: string;
    zones: ZoneConfig[];
}

/*
 * Same ThingsBoard tenant/public dashboard the standalone index2.html SCADA
 * kiosk page talks to (6 furnaces × 5 zones, public login + REST latest + WS
 * live updates) — reused here so the pavilion's 3D furnace shells and lights
 * track the exact same "holat" (state) data instead of a second, divergent
 * source. Two hosts have been used to reach that ThingsBoard instance over
 * time (10.100.0.88:8080 the older LAN address, 45.9.231.133:5680 the
 * newer one); try the new one first and fall back to the old one, mirroring
 * the fallback added to index2.html itself.
 */
const TB_HOSTS = ["http://45.9.231.133:5680", "http://10.100.0.88:8080"];
const TB_PUBLIC_ID = "4cced610-ac54-11f1-b9c7-65253bedcd35";
const RECONNECT_MS = 5000;

const zoneConfig = (setpoints: number[]): ZoneConfig[] =>
    setpoints.map((setpoint, i) => ({
        tempKey: `temperature${i + 1}`,
        spKey: `temperature_sp${i + 1}`,
        setpoint,
    }));

// deviceIds/titles/setpoints ported straight from index2.html's TB_CONFIG.furnaces
// (Печь №41..46) — furnace 41 → det.glb's "1t_..." nodes, 42 → "2t_...", etc.
const FURNACES: FurnaceConfig[] = [
    { index: 1, title: "Печь №41", deviceId: "0f928e70-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
    { index: 2, title: "Печь №42", deviceId: "1f7b6eb0-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
    { index: 3, title: "Печь №43", deviceId: "270b0280-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
    { index: 4, title: "Печь №44", deviceId: "2e2c6b30-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
    { index: 5, title: "Печь №45", deviceId: "35e495a0-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
    { index: 6, title: "Печь №46", deviceId: "3edf5230-9ba8-11f1-af0b-75f6e13813c9", statusKey: "status", zones: zoneConfig([900, 950, 1000, 1000, 980]) },
];

const parseBool = (v: unknown): boolean => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    const s = String(v ?? "").trim().toLowerCase();
    if (!s) return false;
    const n = Number(s);
    if (Number.isFinite(n)) return n !== 0;
    return s === "true" || s === "on" || s === "работает" || s === "в работе" || s === "вработе";
};

const allKeysFor = (f: FurnaceConfig) =>
    [f.statusKey, ...f.zones.map((z) => z.tempKey), ...f.zones.map((z) => z.spKey)].filter(Boolean);

const initialState = (): FurnaceState[] =>
    FURNACES.map((f) => ({
        index: f.index,
        title: f.title,
        status: false,
        zones: f.zones.map((z) => ({ temp: null, setpoint: z.setpoint })),
    }));

/**
 * Mirrors index2.html's ThingsBoard polling for the pavilion walkthrough:
 * public login (tried against both known hosts), a REST "latest telemetry"
 * fetch per furnace, then a WS subscription for live updates. Returns the 6
 * furnaces' current status + 5-zone temp/setpoint, used to drive the qobiq
 * shell tint and the asosiy_chiroq blink in the 3D scene.
 *
 * Only runs while `enabled` (the pavilion modal is open) — no point polling
 * ThingsBoard while nobody can see the result.
 */
export const useFurnaceTelemetry = (enabled: boolean): FurnaceState[] => {
    const [furnaces, setFurnaces] = useState<FurnaceState[]>(initialState);
    const stateRef = useRef(furnaces);
    stateRef.current = furnaces;

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;
        let ws: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let jwt: string | null = null;
        let baseUrl: string | null = null;
        let cmdId = 1;
        const wsCmdMap: Record<number, string> = {};

        const applyPatch = (deviceId: string, patch: Partial<FurnaceState>) => {
            if (cancelled) return;
            setFurnaces((prev) =>
                prev.map((f) => {
                    const cfg = FURNACES.find((c) => c.index === f.index);
                    if (!cfg || cfg.deviceId !== deviceId) return f;
                    return { ...f, ...patch };
                })
            );
        };

        const applyLatestPayload = (f: FurnaceConfig, payload: Record<string, { value: unknown }[]>) => {
            const prev = stateRef.current.find((s) => s.index === f.index);
            const statusArr = payload[f.statusKey];
            const status = statusArr?.[0] ? parseBool(statusArr[0].value) : prev?.status ?? false;
            const zones = f.zones.map((z, i) => {
                const prevZone = prev?.zones[i];
                const tArr = payload[z.tempKey];
                const spArr = payload[z.spKey];
                const temp = tArr?.[0] ? Number(tArr[0].value) : prevZone?.temp ?? null;
                const spRaw = spArr?.[0] ? Number(spArr[0].value) : NaN;
                const setpoint = Number.isFinite(spRaw) ? spRaw : prevZone?.setpoint ?? z.setpoint;
                return { temp, setpoint };
            });
            applyPatch(f.deviceId, { status, zones });
        };

        const loginAgainst = async (host: string) => {
            const res = await fetch(`${host}/api/auth/login/public`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: TB_PUBLIC_ID }),
            });
            if (!res.ok) throw new Error(`login HTTP ${res.status}`);
            const data = await res.json();
            return data.token as string;
        };

        const login = async () => {
            let lastErr: unknown = null;
            for (const host of TB_HOSTS) {
                try {
                    jwt = await loginAgainst(host);
                    baseUrl = host;
                    return;
                } catch (e) {
                    lastErr = e;
                }
            }
            throw lastErr ?? new Error("no ThingsBoard host reachable");
        };

        const authHeaders = () => ({
            "Content-Type": "application/json",
            "X-Authorization": `Bearer ${jwt}`,
        });

        const fetchLatest = async (f: FurnaceConfig) => {
            const keys = allKeysFor(f).join(",");
            const url = `${baseUrl}/api/plugins/telemetry/DEVICE/${f.deviceId}/values/timeseries?keys=${encodeURIComponent(keys)}`;
            const res = await fetch(url, { headers: authHeaders() });
            if (!res.ok) throw new Error(`latest HTTP ${res.status}`);
            return res.json();
        };

        const refreshAll = async () => {
            for (const f of FURNACES) {
                try {
                    applyLatestPayload(f, await fetchLatest(f));
                } catch {
                    // one furnace failing to answer shouldn't block the rest
                }
            }
        };

        const connectWs = () => {
            if (!baseUrl || !jwt) return;
            const wsUrl = `${baseUrl.replace(/^http/, "ws")}/api/ws/plugins/telemetry?token=${encodeURIComponent(jwt)}`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                FURNACES.forEach((f) => {
                    const id = cmdId++;
                    wsCmdMap[id] = f.deviceId;
                    ws?.send(
                        JSON.stringify({
                            tsSubCmds: [{ entityType: "DEVICE", entityId: f.deviceId, scope: "LATEST_TELEMETRY", cmdId: id }],
                            historyCmds: [],
                            attrSubCmds: [],
                        })
                    );
                });
            };

            ws.onmessage = (ev) => {
                try {
                    const msg = JSON.parse(ev.data);
                    const deviceId: string | undefined =
                        msg.subscriptionId != null ? wsCmdMap[msg.subscriptionId] : msg.entityId?.id ?? msg.entityId;
                    if (!deviceId || !msg.data) return;
                    const f = FURNACES.find((c) => c.deviceId === deviceId);
                    if (!f) return;

                    const flat: Record<string, unknown> = {};
                    Object.keys(msg.data).forEach((k) => {
                        const v = msg.data[k];
                        if (Array.isArray(v) && v.length) {
                            const last = v[v.length - 1];
                            flat[k] = Array.isArray(last) ? last[1] : last.value;
                        }
                    });

                    const prev = stateRef.current.find((s) => s.index === f.index);
                    const status = f.statusKey in flat ? parseBool(flat[f.statusKey]) : prev?.status ?? false;
                    const zones = f.zones.map((z, i) => {
                        const prevZone = prev?.zones[i];
                        const temp = z.tempKey in flat ? Number(flat[z.tempKey]) : prevZone?.temp ?? null;
                        const spRaw = z.spKey in flat ? Number(flat[z.spKey]) : NaN;
                        const setpoint = Number.isFinite(spRaw) ? spRaw : prevZone?.setpoint ?? z.setpoint;
                        return { temp, setpoint };
                    });
                    applyPatch(f.deviceId, { status, zones });
                } catch {
                    // ignore malformed frames
                }
            };

            ws.onclose = () => {
                if (cancelled) return;
                reconnectTimer = setTimeout(() => {
                    if (jwt) connectWs();
                }, RECONNECT_MS);
            };
            ws.onerror = () => ws?.close();
        };

        (async () => {
            try {
                await login();
                if (cancelled) return;
                await refreshAll();
                if (cancelled) return;
                connectWs();
            } catch (e) {
                console.warn("[useFurnaceTelemetry] ThingsBoard unreachable — furnaces stay in default state", e);
            }
        })();

        return () => {
            cancelled = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, [enabled]);

    return furnaces;
};
