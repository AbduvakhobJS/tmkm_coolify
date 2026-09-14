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
// each other as the camera nears either one. Apparent on-screen size scales
// with (CSS px) × distanceFactor ÷ camera distance, so this was brought down
// from 5.4 to compensate for the 5-column layout's much wider card (1180px,
// up from 600px) — without it the panels grew almost 2× and started
// overlapping each other even from the pavilion's default overview distance.
const PANEL_DISTANCE_FACTOR = 2.8;

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

// viewBox units for each zone card's own chart — scaled to whatever CSS size
// the element ends up at.
const CHART_W = 216;
const CHART_H = 108;

const chartPoints = (history: FurnaceHistoryPoint[], now: number, spanMs: number) => {
    if (history.length < 2) return [] as { x: number; y: number }[];
    const startTs = now - spanMs;
    return history.map((p) => ({
        x: Math.min(1, Math.max(0, (p.ts - startTs) / spanMs)) * CHART_W,
        y: (1 - clampPercent(p.value)) * CHART_H,
    }));
};

const buildLinePath = (points: { x: number; y: number }[]): string =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

// Same line, closed down to the chart floor — the fill under it reads the
// trend's magnitude at a glance, not just its shape.
const buildAreaPath = (points: { x: number; y: number }[]): string => {
    if (points.length < 2) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${buildLinePath(points)} L${last.x.toFixed(1)},${CHART_H} L${first.x.toFixed(1)},${CHART_H} Z`;
};

interface HistoryStats {
    min: number;
    max: number;
    avg: number;
}

// Min/avg/max over whichever window is currently selected — the only extra
// readouts the ThingsBoard API actually supports without inventing numbers,
// since it exposes just current + setpoint + this same history series
// (API.md §2/§3). Computed from the raw values, not the chart's scaled
// coordinates.
const historyStats = (history: FurnaceHistoryPoint[]): HistoryStats | null => {
    if (history.length === 0) return null;
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    history.forEach((p) => {
        if (p.value < min) min = p.value;
        if (p.value > max) max = p.value;
        sum += p.value;
    });
    return { min, max, avg: sum / history.length };
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
 * `page_panel_N` cube's centre (hidden geometry — see PavilionModelMesh): 5
 * zone cards in a row, each its own self-contained readout — current
 * temperature, a day/week/month trend chart for that zone specifically
 * (ThingsBoard history endpoint), and setpoint/Δ — rather than one shared
 * chart with 5 overlapping lines. All 6 furnace panels stay open for the
 * whole walkthrough — no click to reveal — face the camera like the app's
 * other billboards (`sprite`), and never intercept clicks/drag
 * (`pointer-events: none`).
 *
 * Always real ThingsBoard data — a furnace it hasn't answered for (yet, or
 * ever) simply reads as stopped/"—", the same as a furnace that is genuinely
 * switched off, rather than a fabricated placeholder reading.
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
                                <div className={`fm-furnace-panel__body fm-furnace-panel__body--${tier}`}>
                                    <div className="fm-furnace-panel__head">
                                        <span className="fm-furnace-panel__dot" />
                                        <span className="fm-furnace-panel__title">Pech №{index}</span>
                                        <span className="fm-furnace-panel__status">
                                            {furnace.status ? "Ishlamoqda" : "To‘xtagan"}
                                        </span>
                                        <span className="fm-furnace-panel__scale-note">600–1200°C</span>

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

                                    <div className="fm-furnace-panel__zones">
                                        {furnace.zones.map((zone, i) => {
                                            const zTier = tiers[i];
                                            const hasTemp =
                                                furnace.status && zone.temp != null && Number.isFinite(zone.temp);
                                            const delta = hasTemp ? Math.round((zone.temp as number) - zone.setpoint) : null;
                                            const points = chartPoints(zone.history, now, rangeConfig.spanMs);
                                            const lineColor = zTier === "oq" ? "#3d5064" : TIER_HEX[zTier];
                                            const gradientId = `fm-zone-fade-${index}-${i}`;
                                            const stats = historyStats(zone.history);
                                            return (
                                                <div
                                                    className={`fm-furnace-panel__zone-card fm-furnace-panel__zone-card--${zTier}`}
                                                    key={i}
                                                >
                                                    <div className="fm-furnace-panel__zone-card-head">
                                                        <span className="fm-furnace-panel__zone-card-label">
                                                            Zona {i + 1}
                                                        </span>
                                                        <span className="fm-furnace-panel__zone-card-value">
                                                            {hasTemp ? Math.round(zone.temp as number) : "—"}°
                                                        </span>
                                                    </div>

                                                    <div className="fm-furnace-panel__zone-card-chart">
                                                        <svg
                                                            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                                                            preserveAspectRatio="none"
                                                        >
                                                            <defs>
                                                                <linearGradient
                                                                    id={gradientId}
                                                                    x1="0"
                                                                    y1="0"
                                                                    x2="0"
                                                                    y2="1"
                                                                >
                                                                    <stop offset="0%" stopColor={lineColor} stopOpacity={0.38} />
                                                                    <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <line
                                                                x1={0}
                                                                y1={CHART_H * (1 - clampPercent(800))}
                                                                x2={CHART_W}
                                                                y2={CHART_H * (1 - clampPercent(800))}
                                                                className="fm-furnace-panel__grid"
                                                            />
                                                            <line
                                                                x1={0}
                                                                y1={CHART_H * (1 - clampPercent(1000))}
                                                                x2={CHART_W}
                                                                y2={CHART_H * (1 - clampPercent(1000))}
                                                                className="fm-furnace-panel__grid"
                                                            />
                                                            {points.length >= 2 && (
                                                                <>
                                                                    <path d={buildAreaPath(points)} fill={`url(#${gradientId})`} stroke="none" />
                                                                    <path
                                                                        d={buildLinePath(points)}
                                                                        fill="none"
                                                                        stroke={lineColor}
                                                                        strokeWidth={2.6}
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        opacity={furnace.status ? 0.95 : 0.4}
                                                                    />
                                                                </>
                                                            )}
                                                        </svg>
                                                    </div>

                                                    <div className="fm-furnace-panel__zone-card-foot">
                                                        <span className="fm-furnace-panel__zone-card-sp">
                                                            sp {zone.setpoint}°
                                                        </span>
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

                                                    <div className="fm-furnace-panel__zone-card-range-stats">
                                                        <span>
                                                            <b>{stats ? Math.round(stats.min) : "—"}°</b>
                                                            min
                                                        </span>
                                                        <span>
                                                            <b>{stats ? Math.round(stats.avg) : "—"}°</b>
                                                            o‘rt.
                                                        </span>
                                                        <span>
                                                            <b>{stats ? Math.round(stats.max) : "—"}°</b>
                                                            max
                                                        </span>
                                                    </div>
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
