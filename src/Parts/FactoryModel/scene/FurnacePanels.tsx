import React, { useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
    DEFAULT_HISTORY_RANGE,
    FurnaceHistoryPoint,
    FurnaceState,
    HISTORY_RANGES,
    HistoryRangeKey,
} from "../hooks/useFurnaceTelemetry";

// Furnace panels read from much closer up than the app's other billboards
// (CameraMarker etc, which share MARKER_DISTANCE_FACTOR) — a big card needs a
// smaller factor of its own so neighbouring furnaces' panels don't grow into
// each other as the camera nears either one. Apparent size scales with
// (CSS px) / distanceFactor, so doubling the card's own CSS width (below)
// while holding this steady is what actually doubles it on screen.
const PANEL_DISTANCE_FACTOR = 5.4;

// drei's Html maps z-index linearly across the CAMERA's full near/far span
// (0.1–300 here), not across how far apart the 6 panels actually are — with
// a narrow range like [8,0] every panel's distance rounds to nearly the same
// 1-2 integers, so whichever rendered last in the DOM would win regardless of
// which one the camera actually stood closest to. A wide range gives enough
// resolution that the nearest panel reliably ends up on top.
const PANEL_Z_INDEX_RANGE: [number, number] = [100000, 0];

// Same 600–1200 °C window index2.html's charts use for this exact equipment —
// keeps chart height meaningful and lets the two dashboards read consistently.
const SCALE_MIN = 600;
const SCALE_MAX = 1200;

// Mirrors FurnaceVisuals' tiers, so a zone's colour here always matches its
// shell segment's tint on the furnace itself.
const ZONE_DIFF_YASHIL_MAX = 10;
const ZONE_DIFF_SARIQ_MAX = 20;

type Tier = "yashil" | "sariq" | "qizil" | "oq";

const clampPercent = (temp: number) => {
    const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, temp));
    return (clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
};

const zoneTier = (temp: number | null, setpoint: number, running: boolean): Tier => {
    if (!running || temp == null || !Number.isFinite(temp)) return "oq";
    const diff = Math.abs(temp - setpoint);
    if (diff <= ZONE_DIFF_YASHIL_MAX) return "yashil";
    if (diff <= ZONE_DIFF_SARIQ_MAX) return "sariq";
    return "qizil";
};

const worstTier = (tiers: Tier[]): Tier => {
    if (tiers.includes("qizil")) return "qizil";
    if (tiers.includes("sariq")) return "sariq";
    if (tiers.includes("yashil")) return "yashil";
    return "oq";
};

const TIER_HEX: Record<Exclude<Tier, "oq">, string> = {
    yashil: "#22c55e",
    sariq: "#f5c542",
    qizil: "#e5484d",
};

// viewBox units — scaled to whatever CSS size the chart element ends up at.
const CHART_W = 560;
const CHART_H = 150;

const buildLinePath = (history: FurnaceHistoryPoint[], now: number, spanMs: number): string => {
    if (history.length < 2) return "";
    const startTs = now - spanMs;
    return history
        .map((p, i) => {
            const x = Math.min(1, Math.max(0, (p.ts - startTs) / spanMs)) * CHART_W;
            const y = (1 - clampPercent(p.value)) * CHART_H;
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
};

const RANGE_ORDER: HistoryRangeKey[] = ["day", "week", "month"];
const RANGE_SHORT: Record<HistoryRangeKey, string> = { day: "Kun", week: "Hafta", month: "Oy" };

interface FurnacePanelsProps {
    /** furnaceIndex → the world position (model-local space, cube's own bounding-box centre) of its page_panel_N anchor. */
    anchors: Map<number, THREE.Vector3>;
    furnaces: FurnaceState[];
    onRangeChange: (furnaceIndex: number, range: HistoryRangeKey) => void;
}

/**
 * A large live instrument panel floating above each furnace, anchored at its
 * `page_panel_N` cube's centre (hidden geometry — see PavilionModelMesh): a
 * day/week/month trend chart (ThingsBoard history endpoint, one line per
 * zone) plus a per-zone current/setpoint/Δ readout. All 6 stay open for the
 * whole walkthrough — no click to reveal — face the camera like the app's
 * other billboards (`sprite`), and never intercept clicks/drag
 * (`pointer-events: none`).
 *
 * A furnace whose ThingsBoard device hasn't answered yet (or ever) shows
 * hand-tuned placeholder numbers instead of a blank "—" wall, flagged with
 * an amber border + "namuna" badge — the same demo-data convention already
 * used across the map dashboard's SubPanel/KpiTile (see Map3d.tsx).
 */
const FurnacePanels: React.FC<FurnacePanelsProps> = ({ anchors, furnaces, onRangeChange }) => {
    const byIndex = useMemo(() => {
        const map = new Map<number, FurnaceState>();
        furnaces.forEach((f) => map.set(f.index, f));
        return map;
    }, [furnaces]);

    const sortedAnchors = useMemo(
        () => Array.from(anchors.entries()).sort((a, b) => a[0] - b[0]),
        [anchors]
    );

    // Independent per furnace — an engineer comparing furnace 2's last month
    // against furnace 5's last hour shouldn't have one drag the other along.
    const [ranges, setRanges] = useState<Record<number, HistoryRangeKey>>({});

    const now = Date.now();

    return (
        <>
            {sortedAnchors.map(([index, pos]) => {
                const furnace = byIndex.get(index);
                if (!furnace) return null;

                const isDemo = furnace.source === "demo";
                const tiers = furnace.zones.map((z) => zoneTier(z.temp, z.setpoint, furnace.status));
                const tier = worstTier(tiers);
                const rangeKey = ranges[index] ?? DEFAULT_HISTORY_RANGE;
                const rangeConfig = HISTORY_RANGES[rangeKey];

                const handleRangeClick = (key: HistoryRangeKey) => {
                    setRanges((prev) => ({ ...prev, [index]: key }));
                    onRangeChange(index, key);
                };

                return (
                    <group key={index} position={pos.toArray()}>
                        <Html
                            center
                            sprite
                            distanceFactor={PANEL_DISTANCE_FACTOR}
                            zIndexRange={PANEL_Z_INDEX_RANGE}
                        >
                            <div className={`fm-furnace-panel${furnace.status ? "" : " fm-furnace-panel--off"}`}>
                                <div
                                    className={`fm-furnace-panel__body fm-furnace-panel__body--${
                                        isDemo ? "demo" : tier
                                    }`}
                                >
                                    <div className="fm-furnace-panel__head">

                                          <span className="fm-furnace-panel__dot" />
                                          <span className="fm-furnace-panel__title">Pech №{index}</span>
                                          <span className="fm-furnace-panel__status">
                                            {furnace.status ? "Ishlamoqda" : "To‘xtagan"}
                                        </span>
                                          {isDemo && <span className="fm-furnace-panel__demo-badge">namuna</span>}


                                         <div className="fm-furnace-panel__range" style={{ pointerEvents: "auto" }}>
                                             {RANGE_ORDER.map((key) => (
                                                 <button
                                                     key={key}
                                                     type="button"
                                                     className={`fm-furnace-panel__range-btn${
                                                         key === rangeKey ? " fm-furnace-panel__range-btn--active" : ""
                                                     }`}
                                                     onClick={() => handleRangeClick(key)}
                                                 >
                                                     {RANGE_SHORT[key]}
                                                 </button>
                                             ))}
                                         </div>

                                    </div>

                                    <div className="fm-furnace-panel__chart">
                                        <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
                                            <line x1={0} y1={CHART_H * (1 - clampPercent(800))} x2={CHART_W} y2={CHART_H * (1 - clampPercent(800))} className="fm-furnace-panel__grid" />
                                            <line x1={0} y1={CHART_H * (1 - clampPercent(1000))} x2={CHART_W} y2={CHART_H * (1 - clampPercent(1000))} className="fm-furnace-panel__grid" />
                                            {furnace.zones.map((zone, i) => (
                                                <path
                                                    key={i}
                                                    d={buildLinePath(zone.history, now, rangeConfig.spanMs)}
                                                    fill="none"
                                                    stroke={tiers[i] === "oq" ? "#3d5064" : TIER_HEX[tiers[i]]}
                                                    strokeWidth={2.4}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    opacity={furnace.status ? 0.95 : 0.35}
                                                />
                                            ))}
                                        </svg>
                                        <div className="fm-furnace-panel__chart-scale">
                                            <span>1000°</span>
                                            <span>800°</span>
                                        </div>
                                    </div>

                                    <div className="fm-furnace-panel__stats">
                                        {furnace.zones.map((zone, i) => {
                                            const hasTemp =
                                                furnace.status && zone.temp != null && Number.isFinite(zone.temp);
                                            const delta = hasTemp ? Math.round((zone.temp as number) - zone.setpoint) : null;
                                            return (
                                                <div className={`fm-furnace-panel__stat fm-furnace-panel__stat--${tiers[i]}`} key={i}>
                                                    <span className="fm-furnace-panel__stat-zone">Zona {i + 1}</span>
                                                    <span className="fm-furnace-panel__stat-value">
                                                        {hasTemp ? Math.round(zone.temp as number) : "—"}°
                                                    </span>
                                                    <span className="fm-furnace-panel__stat-sp">sp {zone.setpoint}°</span>
                                                    {delta != null && (
                                                        <span
                                                            className={`fm-furnace-panel__stat-delta fm-furnace-panel__stat-delta--${
                                                                delta >= 0 ? "pos" : "neg"
                                                            }`}
                                                        >
                                                            {delta >= 0 ? "+" : ""}
                                                            {delta}°
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </>
    );
};

export default React.memo(FurnacePanels);
