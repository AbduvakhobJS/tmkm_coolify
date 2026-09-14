import { useCallback, useEffect, useRef, useState } from "react";

export interface FurnaceHistoryPoint {
    ts: number;
    value: number;
}

export interface FurnaceZoneState {
    temp: number | null;
    setpoint: number;
    /** Oldest first — window/granularity set by the panel's day/week/month filter. */
    history: FurnaceHistoryPoint[];
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

export type HistoryRangeKey = "day" | "week" | "month";

export interface HistoryRangeConfig {
    label: string;
    spanMs: number;
    intervalMs: number;
    points: number;
}

// "kunlik / haftalik / oylik" — window + ThingsBoard AVG-bucket size per option.
// Point counts stay in a similar ballpark (~40-60) so the chart reads the same
// density regardless of which range is selected.
export const HISTORY_RANGES: Record<HistoryRangeKey, HistoryRangeConfig> = {
    day: { label: "Kunlik", spanMs: 24 * 60 * 60 * 1000, intervalMs: 30 * 60 * 1000, points: 48 },
    week: { label: "Haftalik", spanMs: 7 * 24 * 60 * 60 * 1000, intervalMs: 4 * 60 * 60 * 1000, points: 42 },
    month: { label: "Oylik", spanMs: 30 * 24 * 60 * 60 * 1000, intervalMs: 12 * 60 * 60 * 1000, points: 60 },
};
export const DEFAULT_HISTORY_RANGE: HistoryRangeKey = "day";

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
 * kiosk page talks to (6 furnaces × 5 zones, public login + REST latest +
 * REST history + WS live updates — API.md documents all four) — reused here
 * so the pavilion's 3D furnace shells and lights track the exact same
 * "holat" (state) data instead of a second, divergent source. Two hosts have
 * been used to reach that ThingsBoard instance over time (10.100.0.88:8080
 * the older LAN address, 45.9.231.133:5680 the newer one); try the new one
 * first and fall back to the old one, mirroring index2.html's own fallback.
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

// deviceIds/titles/setpoints — API.md, "Печь №41..46" → furnace 41 → det.glb's
// "1t_..." nodes, 42 → "2t_...", etc.
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

// Nothing known yet — every furnace renders as "To'xtagan" with "—" readouts
// until ThingsBoard actually answers. No fabricated numbers: a furnace with
// no data looks exactly like a furnace that is genuinely off.
const initialFurnaces = (): FurnaceState[] =>
    FURNACES.map((f) => ({
        index: f.index,
        title: f.title,
        status: false,
        zones: f.zones.map((z) => ({ temp: null, setpoint: z.setpoint, history: [] })),
    }));

/**
 * Mirrors index2.html's ThingsBoard polling for the pavilion walkthrough:
 * public login (tried against both known hosts), a REST "latest telemetry" +
 * "history" fetch per furnace, then a WS subscription for live updates.
 * Returns the 6 furnaces' current status + 5-zone temp/setpoint/history
 * (whichever day/week/month window was last picked for that furnace — see
 * `setHistoryRange`) — drives the qobiq shell tint, the asosiy_chiroq blink,
 * and FurnacePanels. Always real ThingsBoard data — a furnace ThingsBoard
 * hasn't answered for (yet, or ever) simply shows as stopped/no-data, the
 * same as a furnace that is genuinely switched off.
 *
 * Only runs while `enabled` (the pavilion modal is open) — no point polling
 * ThingsBoard while nobody can see the result.
 */
export const useFurnaceTelemetry = (
    enabled: boolean
): { furnaces: FurnaceState[]; setHistoryRange: (furnaceIndex: number, range: HistoryRangeKey) => void } => {
    const [furnaces, setFurnaces] = useState<FurnaceState[]>(initialFurnaces);
    const stateRef = useRef(furnaces);
    stateRef.current = furnaces;

    // Lets the exposed setHistoryRange (called from outside this effect, e.g.
    // when a panel's filter button is clicked) reach into whichever auth
    // session this effect run currently holds.
    const rangeFetcherRef = useRef<(furnaceIndex: number, range: HistoryRangeKey) => void>(() => {});

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
                return { temp, setpoint, history: prevZone?.history ?? [] };
            });
            applyPatch(f.deviceId, { status, zones });
        };

        const applyHistoryPayload = (
            furnaceIndex: number,
            zoneKeys: string[],
            payload: Record<string, { ts: number; value: unknown }[]>
        ) => {
            if (cancelled) return;
            setFurnaces((prev) =>
                prev.map((state) => {
                    if (state.index !== furnaceIndex) return state;
                    const zones = state.zones.map((zoneState, i) => {
                        const arr = payload[zoneKeys[i]];
                        if (!arr) return zoneState;
                        const history = arr
                            .map((p) => ({ ts: p.ts, value: Number(p.value) }))
                            .filter((p) => Number.isFinite(p.value))
                            .sort((a, b) => a.ts - b.ts);
                        return { ...zoneState, history };
                    });
                    return { ...state, zones };
                })
            );
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

        const fetchHistory = async (f: FurnaceConfig, range: HistoryRangeConfig) => {
            const keys = f.zones.map((z) => z.tempKey).join(",");
            const endTs = Date.now();
            const startTs = endTs - range.spanMs;
            const url =
                `${baseUrl}/api/plugins/telemetry/DEVICE/${f.deviceId}/values/timeseries` +
                `?keys=${encodeURIComponent(keys)}&startTs=${startTs}&endTs=${endTs}` +
                `&interval=${range.intervalMs}&agg=AVG&limit=500`;
            const res = await fetch(url, { headers: authHeaders() });
            if (!res.ok) throw new Error(`history HTTP ${res.status}`);
            return res.json();
        };

        // Re-fetch that furnace's history from ThingsBoard at the requested
        // granularity. If the request fails (host unreachable, furnace never
        // answered), whatever history is already showing is simply left alone.
        rangeFetcherRef.current = (furnaceIndex, rangeKey) => {
            const f = FURNACES.find((c) => c.index === furnaceIndex);
            if (!f || !jwt || !baseUrl) return;
            const range = HISTORY_RANGES[rangeKey];
            fetchHistory(f, range)
                .then((payload) => applyHistoryPayload(furnaceIndex, f.zones.map((z) => z.tempKey), payload))
                .catch(() => {
                    // keep whatever history is already showing
                });
        };

        const refreshAll = async () => {
            for (const f of FURNACES) {
                try {
                    applyLatestPayload(f, await fetchLatest(f));
                } catch {
                    // one furnace failing to answer shouldn't block the rest
                    continue;
                }
                try {
                    const payload = await fetchHistory(f, HISTORY_RANGES[DEFAULT_HISTORY_RANGE]);
                    applyHistoryPayload(f.index, f.zones.map((z) => z.tempKey), payload);
                } catch {
                    // current value without history is still useful — chart just stays empty
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
                        return { temp, setpoint, history: prevZone?.history ?? [] };
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
                console.warn("[useFurnaceTelemetry] ThingsBoard unreachable — furnaces stay in no-data state", e);
            }
        })();

        return () => {
            cancelled = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, [enabled]);

    const setHistoryRange = useCallback((furnaceIndex: number, range: HistoryRangeKey) => {
        rangeFetcherRef.current(furnaceIndex, range);
    }, []);

    return { furnaces, setHistoryRange };
};
