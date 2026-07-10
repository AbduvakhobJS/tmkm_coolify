import React, { useState } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { C as BaseC, chartBase } from './dashboardUI';
import ResourceDashboardPart2 from './ResourceDashboardPart2';
import StModal from './StModal';
import RD from './resourceDashboardDemoData.json';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ── Demo ma'lumot manbai (resourceDashboardDemoData.json) ── */
export const DATA = RD;
export const MONTHS = RD.months;
export const MONTHS_SHORT = RD.monthsShort;

/* ── Ranglar palitrasi (umumiy dizayn tizimi + resurs aksentlari) ── */
export const C = {
    ...BaseC,
    muted: BaseC.sub,
    electric: '#3b82f6', gas: '#f97316', water: '#0ea8c7', solar: '#eab308', chemical: '#a855f7',
    cost: '#22c55e', co2: '#ef4444', eff: '#22c55e', warn: '#eab308', ok: '#22c55e', crit: '#ef4444', info: '#0ea8c7',
};

/* ── Neon ikonka (Finance / ESG komponentlaridagi bir xil dizayn uslubi) ── */
export const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 26, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${color}40, ${color}12)`,
        border: `1.3px solid ${color}70`,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}25`,
        color,
    }}>
        {children}
    </div>
);

/* ── Professional ikonka to'plami ── */
export const IconBolt = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" opacity="0.9" />
    </svg>
);
export const IconSun = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" opacity="0.85" />
        <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
export const IconFlame = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5c1 3-2.5 4-2.5 7a2.5 2.5 0 005 0c1.3 1 2 2.5 2 4a6.5 6.5 0 01-13 0c0-4 2.5-6 3.7-8.2C8 3.8 10 3 12 2.5z" fill="currentColor" opacity="0.9" />
    </svg>
);
export const IconDroplet = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 01-13 0C5.5 10 12 3 12 3z" fill="currentColor" opacity="0.85" />
    </svg>
);
export const IconFlask = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 3h5M10 3v5.5L5.6 17a2 2 0 001.8 2.9h9.2a2 2 0 001.8-2.9L14 8.5V3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.8 14.5h8.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
export const IconDollar = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M12 5.5v13M15.5 8.3c0-1.3-1.4-2.3-3.5-2.3-2.3 0-3.7 1.1-3.7 2.6 0 3.4 7.2 1.7 7.2 5.1 0 1.6-1.6 2.8-4 2.8-2.1 0-3.7-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const IconGauge = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15.5a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 15.5l3.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    </svg>
);
export const IconCloud = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5-1.8A4.5 4.5 0 007 18z" fill="currentColor" opacity="0.85" />
    </svg>
);
export const IconClipboard = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12h7M8.5 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
export const IconFactory = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20V10l5 3.5V10l5 3.5V10l5 3.5V20H3z" fill="currentColor" opacity="0.85" />
        <path d="M6 20v-4M12 20v-4M18 20v-4" stroke="#0a0f1d" strokeWidth="1" opacity="0.4" />
    </svg>
);
export const IconBell = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" fill="currentColor" opacity="0.85" />
        <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
export const IconEye = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);
export const IconChip = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);

const ICON_BY_TYPE: Record<string, React.ReactNode> = { warn: <IconBell />, crit: <IconBell />, ok: <IconGauge />, info: <IconBell /> };

/* ── Chart optionlari (barcha componentlarda ishlatilgan dizayn uslubiga mos) ── */
export const baseOpts = (leg?: 'bottom' | 'right' | false) => ({
    ...chartBase,
    plugins: {
        legend: leg ? { display: true, position: leg as 'bottom' | 'right', labels: { color: C.sub, font: { size: 9 }, boxWidth: 9, padding: 4 } } : { display: false },
        tooltip: { enabled: true },
    },
    scales: {
        x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
        y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
    },
});

/* ── Styles ── */
export const panelStyle: React.CSSProperties = {
    width: '100%', height: '100vh', overflowY: 'auto', overflowX: 'hidden',
    padding: '10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '10px',
    background: C.bg, scrollbarWidth: 'thin', scrollbarColor: 'rgba(14,168,199,0.2) transparent',
};
export const twoCol: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '8px', alignItems: 'stretch',
};
export const colFlex: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', marginBottom: '12px',
};
export const flexWrap = (minH: number): React.CSSProperties => ({
    flex: 1, position: 'relative', minHeight: `${minH}px`, width: '100%',
});
export const wrap = (h: number): React.CSSProperties => ({ height: `${h}px`, position: 'relative', width: '100%' });

const cardBase = (accent?: string): React.CSSProperties => ({
    background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`,
    border: `1px solid ${accent ? accent + '3d' : C.border}`,
    borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px',
});

/* ── UI komponentlar ── */
export const SectionHeader: React.FC<{ title: string; color: string; icon?: React.ReactNode; right?: React.ReactNode }> =
    ({ title, color, icon, right }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={color} size={26}>{icon}</NeonIcon>}
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.2px', color, textTransform: 'uppercase' }}>{title}</span>
            </div>
            {right && <span style={{ fontWeight: 400, textTransform: 'none' }}>{right}</span>}
        </div>
    );

export const DetailButton: React.FC<{ onClick: () => void; color: string }> = ({ onClick, color }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
            background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 7,
            color, fontSize: 10.5, fontWeight: 600, padding: '5px 10px',
        }}
    >
        <IconEye />Батафсил
    </button>
);

export const Card: React.FC<{ title: string; accent?: string; icon?: React.ReactNode; extra?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> =
    ({ title, accent, icon, extra, children, style }) => (
        <div style={{ ...cardBase(accent), ...style }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    {icon && accent && <NeonIcon color={accent} size={20}>{icon}</NeonIcon>}
                    <div style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                </div>
                {extra && <div style={{ flexShrink: 0 }}>{extra}</div>}
            </div>
            {children}
        </div>
    );

export const KpiRow: React.FC<{ value: string; unit: string; color: string; trend?: string; up?: boolean; sub?: string; right?: React.ReactNode }> =
    ({ value, unit, color, trend, up, sub, right }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</span>
                    <span style={{ fontSize: '13px', color: C.sub }}>{unit}</span>
                </div>
                {trend && <div style={{ fontSize: '12px', color: up ? C.ok : C.crit, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontWeight: 600 }}>
                    <span>{up ? '▲' : '▼'}</span><span>{trend}</span>
                </div>}
                {sub && <div style={{ fontSize: '10px', color: C.sub, marginTop: '4px' }}>{sub}</div>}
            </div>
            {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </div>
    );

export const MonthRow: React.FC<{ values: (number | string)[]; color?: string; warn?: number }> =
    ({ values, color, warn }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            {MONTHS_SHORT.map((m, i) => (
                <div key={m} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: warn !== undefined && i === warn ? C.crit : (color || C.eff) }}>{values[i]}</div>
                    <div style={{ fontSize: '9px', color: C.sub }}>{m}</div>
                </div>
            ))}
        </div>
    );

export const badge = (color: string, text: string) => (
    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '5px', background: `${color}1c`, border: `1px solid ${color}55`, color, fontSize: '10px', fontWeight: 700 }}>
        {text}
    </span>
);

export const Div: React.FC<{ color: string }> = ({ color }) => (
    <div style={{ height: '1px', background: `linear-gradient(90deg, ${color}55, transparent)`, margin: '2px 0' }} />
);

/* ── Chart helperlari ── */
export const MiniLine: React.FC<{ data: number[]; color: string; warnIdx?: number; refLine?: number; height?: number; fill?: boolean }> =
    ({ data, color, warnIdx, refLine, height = 75, fill = true }) => {
        const pts = data.map((_, i) => warnIdx !== undefined && i === warnIdx ? C.crit : color);
        const ds: any[] = [{ data, borderColor: color, backgroundColor: fill ? `${color}20` : 'transparent', borderWidth: 2, pointRadius: 3, pointBackgroundColor: pts, tension: 0.4, fill }];
        if (refLine !== undefined) ds.push({ data: data.map(() => refLine), borderColor: `${C.crit}88`, borderWidth: 1, borderDash: [4, 4], pointRadius: 0, fill: false, backgroundColor: 'transparent' } as any);
        return <div style={wrap(height)}><Line data={{ labels: MONTHS, datasets: ds }} options={baseOpts() as any} /></div>;
    };

export const MiniArea: React.FC<{ data: number[]; color: string; height?: number }> =
    ({ data, color, height = 80 }) => (
        <div style={wrap(height)}>
            <Line data={{ labels: MONTHS, datasets: [{ data, borderColor: color, backgroundColor: `${color}28`, borderWidth: 2, pointRadius: 3, tension: 0.4, fill: true }] }} options={baseOpts() as any} />
        </div>
    );

export const MiniBar: React.FC<{ data: number[]; color?: string; barColors?: string[]; height?: number; labels?: string[] }> =
    ({ data, color = C.electric, barColors, height = 80, labels }) => (
        <div style={wrap(height)}>
            <Bar data={{ labels: labels || MONTHS, datasets: [{ data, backgroundColor: barColors || `${color}bb`, borderRadius: 4, borderColor: 'transparent' }] }} options={baseOpts() as any} />
        </div>
    );

export const StackedBar: React.FC<{ datasets: { label: string; data: number[]; color: string }[]; height?: number; flex?: boolean }> =
    ({ datasets, height = 110, flex }) => (
        <div style={flex ? flexWrap(height) : wrap(height)}>
            <Bar data={{ labels: MONTHS, datasets: datasets.map(d => ({ label: d.label, data: d.data, backgroundColor: `${d.color}bb`, borderRadius: 2, borderColor: 'transparent' })) }}
                options={{
                    ...baseOpts('bottom'), scales: {
                        x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
                        y: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
                    }
                } as any} />
        </div>
    );

export const GroupedBar: React.FC<{ datasets: { label: string; data: number[]; color: string }[]; height?: number; flex?: boolean }> =
    ({ datasets, height = 110, flex }) => (
        <div style={flex ? flexWrap(height) : wrap(height)}>
            <Bar data={{ labels: MONTHS, datasets: datasets.map(d => ({ label: d.label, data: d.data, backgroundColor: `${d.color}bb`, borderRadius: 4, borderColor: 'transparent' })) }}
                options={baseOpts('bottom') as any} />
        </div>
    );

export const DonutChart: React.FC<{ data: number[]; labels: string[]; colors: string[]; height?: number; flex?: boolean }> =
    ({ data, labels, colors, height = 110, flex }) => (
        <div style={flex ? flexWrap(height) : wrap(height)}>
            <Doughnut data={{ labels, datasets: [{ data, backgroundColor: colors, borderColor: C.card, borderWidth: 2, hoverOffset: 4 }] }}
                options={{
                    responsive: true, maintainAspectRatio: false, cutout: '65%',
                    plugins: { legend: { position: 'bottom', labels: { color: C.sub, font: { size: 9 }, boxWidth: 9, padding: 4 } } }
                } as any} />
        </div>
    );

export const GaugeChart: React.FC<{ value: number; color: string; label: string; height?: number }> =
    ({ value, color, label, height = 90 }) => (
        <div style={{ ...wrap(height), display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={{ datasets: [{ data: [value, 100 - value], backgroundColor: [color, 'rgba(255,255,255,0.07)'], borderWidth: 0, circumference: 180, rotation: 270 }] }}
                options={{ responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } } } as any} />
            <div style={{ position: 'absolute', bottom: '6px', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}%</div>
                <div style={{ fontSize: '10px', color: C.sub }}>{label}</div>
            </div>
        </div>
    );

export const ProgressItem: React.FC<{ label: string; pct: number; color: string; value: string }> =
    ({ label, pct, color, value }) => {
        const over = pct > 100;
        return (
            <div style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', color: C.text }}>{label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: over ? C.crit : color }}>{value}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: over ? C.crit : color, borderRadius: '3px', boxShadow: `0 0 6px ${(over ? C.crit : color)}77`, transition: 'width 1s ease' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '9px', color: over ? C.crit : C.sub, marginTop: '1px' }}>{pct}%{over && ' · лимит превышен'}</div>
            </div>
        );
    };

export const AlertList: React.FC<{ items: { type: 'warn' | 'crit' | 'ok' | 'info'; text: string; time: string }[] }> =
    ({ items }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map((a, i) => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '7px',
                    background: a.type === 'crit' ? 'rgba(239,68,68,0.09)' : a.type === 'warn' ? 'rgba(234,179,8,0.09)' : a.type === 'ok' ? 'rgba(34,197,94,0.09)' : 'rgba(14,168,199,0.09)',
                    borderLeft: `2px solid ${C[a.type]}`,
                }}>
                    <NeonIcon color={C[a.type]} size={20}>{ICON_BY_TYPE[a.type]}</NeonIcon>
                    <span style={{ flex: 1, fontSize: '11px', color: C.text }}>{a.text}</span>
                    <span style={{ fontSize: '10px', color: C.sub, flexShrink: 0 }}>{a.time}</span>
                </div>
            ))}
        </div>
    );

export const Leaderboard: React.FC<{ items: { rank: number; name: string; value: string; delta?: string; up?: boolean }[] }> =
    ({ items }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {items.map(item => (
                <div key={item.rank} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 7px', borderRadius: '7px', background: item.rank === 1 ? 'rgba(59,130,246,0.09)' : 'transparent' }}>
                    <span style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        background: item.rank <= 3 ? [C.electric, C.solar, C.gas][item.rank - 1] + '33' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${item.rank <= 3 ? [C.electric, C.solar, C.gas][item.rank - 1] : '#ffffff22'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '9px', fontWeight: 700,
                        color: item.rank <= 3 ? [C.electric, C.solar, C.gas][item.rank - 1] : C.sub,
                    }}>
                        {item.rank}
                    </span>
                    <span style={{ flex: 1, fontSize: '11px', color: C.text }}>{item.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: item.rank <= 3 ? C.eff : C.warn }}>{item.value}</span>
                    {item.delta && <span style={{ fontSize: '10px', color: item.up ? C.ok : C.crit, fontWeight: 600 }}>{item.up ? '▲' : '▼'}{item.delta}</span>}
                </div>
            ))}
        </div>
    );

export const PeakHeatmap: React.FC = () => {
    const { hours, days, values } = DATA.peakHeatmap;
    const bg = (v: number) => v > 0.85 ? `${C.crit}bb` : v > 0.65 ? `${C.gas}bb` : v > 0.45 ? `${C.solar}bb` : `${C.electric}22`;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', gap: '2px', paddingLeft: '32px' }}>
                {hours.map(h => <div key={h} style={{ flex: 1, fontSize: '8px', color: C.sub, textAlign: 'center' }}>{h}</div>)}
            </div>
            {values.map((r, di) => (
                <div key={di} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <div style={{ width: '28px', fontSize: '9px', color: C.sub, flexShrink: 0 }}>{days[di]}</div>
                    {r.map((v, hi) => <div key={hi} style={{ flex: 1, height: '16px', borderRadius: '3px', background: bg(v), border: v > 0.85 ? `1px solid ${C.crit}66` : '1px solid transparent' }} title={`${hours[hi]}:00 — ${Math.round(v * 100)}%`} />)}
                </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', justifyContent: 'flex-end' }}>
                {[[`${C.crit}bb`, 'Высокая'], [`${C.gas}bb`, 'Средняя'], [`${C.solar}bb`, 'Норма'], [`${C.electric}22`, 'Низкая']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: c }} />
                        <span style={{ fontSize: '9px', color: C.sub }}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const miniBox = (label: string, value: string, col: string) => (
    <div key={label} style={{ textAlign: 'center', background: `${col}11`, borderRadius: '6px', padding: '5px 2px', border: `1px solid ${col}22` }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: col }}>{value}</div>
        <div style={{ fontSize: '9px', color: C.sub }}>{label}</div>
    </div>
);

/* ══════════════════════════════
   Компактная карточка ресурса (bir xil "view-model" uslubidagi mustaqil card,
   RightPanel.tsx dagi GeoModelCard bilan bir xil dizaynda)
══════════════════════════════ */
const resourceCardStyle: React.CSSProperties = {
    width: '100%', height: '100%', padding: '10px',
    background: 'var(--gc-panel-bg)', borderRadius: '12px',
    overflow: 'hidden', position: 'relative',
    border: '1px solid rgba(14,168,199,0.2)',
    display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 0, minWidth: 0,
};

const CompactTrendCard: React.FC<{
    title: string; color: string; icon: React.ReactNode;
    value: string; unit: string; deltaText?: string; up?: boolean;
    trendData: number[]; warnIdx?: number; refLine?: number;
    stats: { label: string; value: string }[]; statsCols?: number;
}> = ({ title, color, icon, value, unit, deltaText, up, trendData, warnIdx, refLine, stats, statsCols = 3 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pts = trendData.map((_, i) => (warnIdx !== undefined && i === warnIdx ? C.crit : color));
    const datasets: any[] = [{ data: trendData, borderColor: color, backgroundColor: `${color}20`, borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: pts, tension: 0.4, fill: true }];
    if (refLine !== undefined) datasets.push({ data: trendData.map(() => refLine), borderColor: `${C.crit}88`, borderWidth: 1, borderDash: [4, 4], pointRadius: 0, fill: false, backgroundColor: 'transparent' });

    return (
        <div style={resourceCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <NeonIcon color={color} size={20}>{icon}</NeonIcon>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, color, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                </div>
                <DetailButton onClick={() => setIsOpen(true)} color={color} />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 21, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 11, color: C.sub }}>{unit}</span>
                {deltaText && (
                    <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: up ? C.ok : C.crit, whiteSpace: 'nowrap' }}>
                        {up ? '▲' : '▼'} {deltaText}
                    </span>
                )}
            </div>

            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <Line data={{ labels: MONTHS, datasets }} options={baseOpts() as any} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statsCols},1fr)`, gap: '4px', flexShrink: 0 }}>
                {stats.map((s, i) => <React.Fragment key={i}>{miniBox(s.label, s.value, color)}</React.Fragment>)}
            </div>

            <StModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
};

export const ElectricResourceCard: React.FC = () => {
    const d = DATA.electric;
    return (
        <CompactTrendCard
            title="Электроэнергия" color={C.electric} icon={<IconBolt />}
            value={d.today.value} unit={d.today.unit} deltaText={d.today.deltaText.replace(/^[+-]\s*/, '')} up={d.today.up}
            trendData={d.monthlyTrend.data} stats={d.miniStats}
        />
    );
};

export const SolarResourceCard: React.FC = () => {
    const d = DATA.solar;
    return (
        <CompactTrendCard
            title="Солнечная энергия" color={C.solar} icon={<IconSun />}
            value={String(d.current.shareOfTotal)} unit="% от общего" deltaText={d.monthlyShare.badge} up
            trendData={d.monthlyShare.data} stats={d.current.stats} statsCols={2}
        />
    );
};

export const GasResourceCard: React.FC = () => {
    const d = DATA.gas;
    return (
        <CompactTrendCard
            title="Расход газа" color={C.gas} icon={<IconFlame />}
            value={d.today.value} unit={d.today.unit} deltaText={d.today.deltaText.replace(/^[+-]\s*/, '')} up={d.today.up}
            trendData={d.monthly.data} stats={d.miniStats}
        />
    );
};

export const WaterResourceCard: React.FC = () => {
    const d = DATA.water;
    return (
        <CompactTrendCard
            title="Расход воды" color={C.water} icon={<IconDroplet />}
            value={d.realtime.value} unit={d.realtime.unit} deltaText={d.realtime.deltaText.replace(/^[+-]\s*/, '')} up={d.realtime.up}
            trendData={d.monthly.data} warnIdx={d.monthly.warnIdx} refLine={d.monthly.refLine} stats={d.miniStats}
        />
    );
};

/* ══════════════════════════════
   MAIN — mustaqil marshrut (/main/9) uchun to'liq sahifa,
   LeftPanel.tsx da esa yuqoridagi 4 ta kartochka alohida-alohida ishlatiladi
══════════════════════════════ */
const ResourceDashboard: React.FC = () => {
    return (
        <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                <NeonIcon color={C.electric} size={30}><IconGauge /></NeonIcon>
                <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: '#4fb3d9', textTransform: 'uppercase' }}>
                    Мониторинг расхода ресурсов
                </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '10px', minHeight: 0 }}>
                <ElectricResourceCard />
                <SolarResourceCard />
                <GasResourceCard />
                <WaterResourceCard />
            </div>
            <div style={{ height: '50%', flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', padding: '10px', background: 'var(--gc-panel-bg)', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(14,168,199,0.2)' }}>
                    <ResourceDashboardPart2 />
                </div>
            </div>
        </div>
    );
};

export default ResourceDashboard;
