import React, { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { C, chartBase, axis } from '../../components/dashboardUI';
import DATA_JSON from './financeNewDemoData.json';

/* ── Professional dumaloq ikonka (gradient fon + glow, "badge" uslubi — Finance.tsx bilan bir xil) ── */

const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${color}40, ${color}12)`,
        border: `1.3px solid ${color}70`,
        boxShadow: `0 0 12px ${color}66, inset 0 0 8px ${color}30`,
        color,
    }}>
        {children}
    </div>
);

/* ── Ikonka to'plami (Finance.tsx dagi bir xil "duotone" uslub) ── */
const IconDollar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M12 5.5v13M15.5 8.3c0-1.3-1.4-2.3-3.5-2.3-2.3 0-3.7 1.1-3.7 2.6 0 3.4 7.2 1.7 7.2 5.1 0 1.6-1.6 2.8-4 2.8-2.1 0-3.7-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChartBars = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="13" width="3.6" height="7" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="10.2" y="8.5" width="3.6" height="11.5" rx="1" fill="currentColor" />
        <rect x="16.4" y="4.5" width="3.6" height="15.5" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
);
const IconWalletFilled = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6.5" width="18" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.6" cy="14" r="1.5" fill="currentColor" />
        <path d="M6.5 6.5l3-3.5h6l2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconPercentBadge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
        <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8.3" cy="8.3" r="2.1" fill="currentColor" />
        <circle cx="15.7" cy="15.7" r="2.1" fill="currentColor" />
    </svg>
);
const IconChartUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 16.5l6-6 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 7.5h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconLayers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconScale = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v18M8 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7h6M14 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7l-2.5 5a2.5 2.5 0 005 0L4 7zM20 7l-2.5 5a2.5 2.5 0 005 0L20 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="3" r="1.3" fill="currentColor" />
    </svg>
);
const IconArrowUpDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3v18M7 3L3.5 6.5M7 3l3.5 3.5M17 21V3M17 21l3.5-3.5M17 21l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconBank = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10l9-6 9 6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 10h16v9H4z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 19h16M7 13v4M12 13v4M17 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconRefresh = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 11A8 8 0 105.5 16.5M20 11V5M20 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 9.5v4.2M12 16.7h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconFlag = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 4h13l-3 4 3 4H5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);

/* ── Ma'lumot turi ── */
type FinanceNewData = typeof DATA_JSON;
const DATA = DATA_JSON as FinanceNewData;

/* ── Ranglar (mockupdagi semantik ranglarni C palitrasiga moslashtirish) ── */
const SEG_COLOR: Record<string, string> = { blue: '#3b82f6', purple: '#a855f7', teal: '#0ea8c7', amber: '#eab308', coral: '#f97316', gray: '#94a3b8' };

/* ── Yordamchi funksiyalar (Finance.tsx bilan bir xil nomlash) ── */
const fmtNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};
const valueColor = (n: number) => (n < 0 ? '#ef4444' : '#22c55e');
const deltaColor = (n: number) => (n < 0 ? '#ef4444' : '#22c55e');
const deltaArrow = (n: number) => (n < 0 ? '▼' : '▲');

const MONTH_SHORT = DATA.trendLabels;

/* ── Nuqtalar orqali silliq (Catmull-Rom) egri chiziq — Chart.js "tension" effektiga o'xshash ── */
const smoothPath = (pts: [number, number][]): string => {
    if (pts.length < 3) return `M${pts.map((p) => p.join(',')).join(' L')}`;
    const smoothing = 0.2;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1[0] + (p2[0] - p0[0]) * smoothing;
        const cp1y = p1[1] + (p2[1] - p0[1]) * smoothing;
        const cp2x = p2[0] - (p3[0] - p1[0]) * smoothing;
        const cp2y = p2[1] - (p3[1] - p1[1]) * smoothing;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
};

/* ── Bo'lim sarlavhasi (Finance.tsx SectionTitle bilan bir xil) ── */
const SectionTitle: React.FC<{ index: number; title: string; icon: React.ReactNode; color: string; hint?: string }> = ({ index, title, icon, color, hint }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9,background: `C.card`, margin: '4px 0 2px' }}>
        {/*<NeonIcon color={color} size={26}>{icon}</NeonIcon>*/}
        <span style={{ color: C.text, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {title}
        </span>
        {hint && <span style={{ marginLeft: 'auto', color: C.sub, fontSize: 10.5 }}>{hint}</span>}
    </div>
);

/* ── Karta qobig'i (ESGDetail.tsx SectionCard bilan bir xil) ── */
const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = '#4fb3d9', hint, children, style }) => (
    <div style={{ background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: C.text, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {/*{icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}*/}
                {title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        {children}
    </div>
);

/* ── Karta ichidagi maydonli (area) trend grafik, oy belgilari va hover tooltip bilan (Finance.tsx bilan bir xil) ── */
const AreaTrend: React.FC<{ data: number[]; color: string; height?: number; fmtV?: (n: number) => string }> = ({ data, color, height = 46, fmtV = fmtNum }) => {
    const w = 260, h = height, padTop = 4, padBottom = 14;
    const plotH = h - padTop - padBottom;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const x = (i: number) => (i / (data.length - 1)) * w;
    const y = (v: number) => padTop + plotH - ((v - min) / range) * plotH;
    const points: [number, number][] = data.map((v, i) => [x(i), y(v)]);
    const linePath = smoothPath(points);
    const areaPath = `${linePath} L${w},${padTop + plotH} L0,${padTop + plotH} Z`;
    const gradId = `grad-new-${color.replace('#', '')}`;
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const relX = ((e.clientX - rect.left) / rect.width) * w;
        let nearest = 0, bestDist = Infinity;
        data.forEach((_, i) => { const dist = Math.abs(x(i) - relX); if (dist < bestDist) { bestDist = dist; nearest = i; } });
        setHoverIdx(nearest);
    };

    const hovered = hoverIdx !== null;
    const hx = hovered ? x(hoverIdx as number) : 0;
    const hy = hovered ? y(data[hoverIdx as number]) : 0;
    const tooltipAbove = hy > h * 0.4;

    return (
        <div style={{ position: 'relative', width: '100%' }} onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}>
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#${gradId})`} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {hovered && (
                    <line x1={hx} y1={padTop} x2={hx} y2={padTop + plotH} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={0.55} />
                )}
                {data.map((v, i) => (
                    <circle
                        key={i} cx={x(i)} cy={y(v)}
                        r={hoverIdx === i ? 3.8 : i === data.length - 1 ? 3 : 2}
                        fill={color} stroke={C.card} strokeWidth={hoverIdx === i ? 1.6 : 1}
                        style={hoverIdx === i ? { filter: `drop-shadow(0 0 3px ${color})` } : undefined}
                    />
                ))}
                {MONTH_SHORT.map((m, i) => (
                    <text key={m} x={x(i)} y={h - 2} fontSize="7.5" fill={hoverIdx === i ? color : C.sub} textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}>{m}</text>
                ))}
            </svg>
            {hovered && (
                <div style={{
                    position: 'absolute', left: `${(hx / w) * 100}%`, top: `${(hy / h) * 100}%`,
                    transform: `translate(-50%, ${tooltipAbove ? '-130%' : '20%'})`,
                    background: '#0a0f1df2', border: `1px solid ${color}99`, borderRadius: 6,
                    padding: '3px 8px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20,
                    boxShadow: `0 2px 10px ${color}55`, textAlign: 'center',
                }}>
                    <div style={{ color: C.sub, fontSize: 8, fontWeight: 600, textTransform: 'uppercase' }}>{MONTH_SHORT[hoverIdx as number]}</div>
                    <div style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{fmtV(data[hoverIdx as number])}</div>
                </div>
            )}
        </div>
    );
};

/* ── KPI kartasi (Finance.tsx KpiTile bilan bir xil) ── */
const KpiTile: React.FC<{
    label: string; value: string; unit?: string; delta?: number | null; deltaUnit?: string;
    icon: React.ReactNode; color: string; trend?: number[]; valueTone?: string; note?: string; fmtV?: (n: number) => string;
}> = ({ label, value, unit, delta, deltaUnit = '%', icon, color, trend, valueTone, note, fmtV }) => (
    <div style={{ minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && delta !== null ? (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 1)}{deltaUnit}
                </div>
            ) : note ? (
                <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: 'rgba(148,163,184,0.1)', borderRadius: 6, padding: '2px 6px' }}>{note}</div>
            ) : null}
        </div>
        <div style={{ color: valueTone ?? C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}{unit && <span style={{ color: C.sub, fontSize: 10, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
        </div>
        {trend && <AreaTrend data={trend} color={color} fmtV={fmtV} />}
    </div>
);

/* ── Nisbat kartasi (Finance.tsx RatioTile bilan bir xil, + yorliq) ── */
const RatioTile: React.FC<{ label: string; value: string; delta?: number | null; icon: React.ReactNode; color: string; tag?: string }> = ({ label, value, delta, icon, color, tag }) => (
    <div style={{ minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && delta !== null && (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 2)}
                </div>
            )}
        </div>
        <span style={{ color: C.text, fontSize: 22, fontWeight: 700 }}>{value}</span>
        {tag && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.13)', padding: '3px 9px', borderRadius: 6, alignSelf: 'flex-start' }}>✓ {tag}</span>}
    </div>
);

/* ── Tarkib kartasi (Finance.tsx AssetTile bilan bir xil uslub, stacked-bar bilan) ── */
const CompositionTile: React.FC<{ item: FinanceNewData['composition'][number] }> = ({ item }) => (
    <div style={{ minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <NeonIcon color="#a855f7" size={24}><IconLayers /></NeonIcon>
            <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
        </div>
        <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
        <div style={{ display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden', background: C.cardAlt }}>
            {item.segs.filter((s) => s.pct > 0).map((s) => (
                <div key={s.label} style={{ width: `${s.pct}%`, background: SEG_COLOR[s.color] }} />
            ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {item.segs.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: SEG_COLOR[s.color], boxShadow: `0 0 4px ${SEG_COLOR[s.color]}`, flexShrink: 0 }} />
                    <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{s.label}</span>
                    <span style={{ color: C.text, fontWeight: 600, flexShrink: 0 }}>{s.pct}%</span>
                </div>
            ))}
        </div>
    </div>
);

/* ── Chart.js "floating bar" qiymat yorlig'i plaginlari (dashboardUI.tsx barLabel uslubiga mos) ── */
const floatingBarLabelH = {
    id: 'floatingBarLabelH',
    afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const ds = chart.data.datasets[0];
        meta.data.forEach((el: any, idx: number) => {
            ctx.save();
            ctx.fillStyle = ds.labelColors[idx];
            ctx.font = `${ds.boldFlags[idx] ? 700 : 400} 11px "Segoe UI", sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(ds.displayValues[idx], Math.max(el.x, el.base) + 6, el.y);
            ctx.restore();
        });
    },
};

const floatingBarLabelV = {
    id: 'floatingBarLabelV',
    afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const ds = chart.data.datasets[0];
        meta.data.forEach((el: any, idx: number) => {
            ctx.save();
            ctx.fillStyle = C.text;
            ctx.font = '700 12px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ds.displayValues[idx], el.x, Math.min(el.y, el.base) - 8);
            ctx.restore();
        });
    },
};

/* ── Waterfall chart (P&L bridge) — Finance.tsx dagi Bar chart uslubida, floating-bar texnikasi bilan ── */
const Waterfall: React.FC<{ steps: { label: string; value: number; kind: string }[] }> = ({ steps }) => {
    const { chartData, options } = useMemo(() => {
        let cum = 0;
        const floating: [number, number][] = [];
        const colors: string[] = [];
        const labelColors: string[] = [];
        const boldFlags: boolean[] = [];
        const displayValues: string[] = [];
        steps.forEach((st) => {
            const isMile = st.kind === 'sub' || st.kind === 'start' || st.kind === 'res';
            let a: number, b: number, color: string;
            if (st.kind === 'cost' || st.kind === 'inc') {
                a = cum; b = cum + st.value; cum = b;
                color = st.value >= 0 ? '#22c55e' : '#ef4444';
            } else {
                a = 0; b = st.value; cum = st.value;
                color = st.kind === 'sub' ? '#eab308' : (st.value >= 0 ? '#3b82f6' : '#ef4444');
            }
            floating.push([Math.min(a, b), Math.max(a, b)]);
            colors.push(color);
            boldFlags.push(isMile);
            const shown = isMile ? cum : st.value;
            labelColors.push(isMile ? C.text : (shown >= 0 ? '#22c55e' : '#ef4444'));
            displayValues.push(`${shown >= 0 ? '+' : ''}${fmtNum(Math.round(shown / 1000))}`);
        });
        return {
            chartData: {
                labels: steps.map((s) => s.label),
                datasets: [{ data: floating, backgroundColor: colors, borderRadius: 3, barThickness: 15, displayValues, labelColors, boldFlags } as any],
            },
            options: {
                ...chartBase,
                indexAxis: 'y' as const,
                layout: { padding: { right: 55 } },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx: any) => `${ctx.chart.data.datasets[0].displayValues[ctx.dataIndex]} mln so'm` } },
                },
                scales: axis({
                    x: { ticks: { color: C.sub, font: { size: 9 }, callback: (v: any) => fmtNum(Number(v) / 1000) } },
                    y: { ticks: { color: C.sub, font: { size: 10.5 } }, grid: { display: false } },
                }),
            },
        };
    }, [steps]);

    return (
        <div style={{ height: 340 }}>
            <Bar data={chartData as any} options={options as any} plugins={[floatingBarLabelH]} />
        </div>
    );
};

/* ── Pul oqimi ko'prigi (vertikal waterfall) — xuddi shu Chart.js floating-bar texnikasi bilan ── */
const CashBridge: React.FC<{ items: { label: string; value: number; total?: boolean }[] }> = ({ items }) => {
    const { chartData, options } = useMemo(() => {
        let cum = 0;
        const floating: [number, number][] = [];
        const colors: string[] = [];
        const displayValues: string[] = [];
        items.forEach((it) => {
            let a: number, b: number, color: string;
            if (it.total) {
                a = 0; b = it.value; color = '#94a3b8';
            } else {
                a = cum; b = cum + it.value; cum = b;
                color = it.value >= 0 ? '#22c55e' : '#ef4444';
            }
            floating.push([Math.min(a, b), Math.max(a, b)]);
            colors.push(color);
            displayValues.push(`${it.value >= 0 ? '+' : ''}${fmtNum(Math.round(it.value / 1000))}`);
        });
        return {
            chartData: {
                labels: items.map((it) => it.label),
                datasets: [{ data: floating, backgroundColor: colors, borderRadius: 4, maxBarThickness: 56, displayValues } as any],
            },
            options: {
                ...chartBase,
                layout: { padding: { top: 26 } },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx: any) => `${ctx.chart.data.datasets[0].displayValues[ctx.dataIndex]} mln so'm` } },
                },
                scales: axis({ y: { ticks: { color: C.sub, font: { size: 9 }, callback: (v: any) => fmtNum(Number(v) / 1000) } } }),
            },
        };
    }, [items]);

    return (
        <div style={{ height: 200 }}>
            <Bar data={chartData as any} options={options as any} plugins={[floatingBarLabelV]} />
        </div>
    );
};

/* ── Asosiy komponent ── */
const FinanceNew: React.FC = () => {
    const fmtPct = (n: number) => `${fmtNum(n, 1)}%`;

    const topCostDrivers = useMemo(() => (
        DATA.waterfall.steps
            .filter((s) => s.kind === 'cost')
            .slice()
            .sort((a, b) => a.value - b.value)
            .slice(0, 2)
    ), []);

    return (
        <div style={{
            background: C.bg,
            height: '100vh',
            overflowY: 'auto',
            padding: 14,
            boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/*<NeonIcon color="#eab308" size={36}><IconDollar /></NeonIcon>*/}
                    <div>
                        <div style={{ color: C.text, fontSize: 'clamp(14px, 3.4cqmin, 22px)', fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{DATA.meta.company}</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{DATA.meta.subtitle}</div>
                    </div>
                </div>
            </div>

            {/* Vitals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label="Tushum" value={fmtNum(DATA.vitals[0].value)} icon={<IconDollar />} color="#3b82f6"
                    delta={DATA.vitals[0].delta} trend={DATA.vitals[0].trend} />
                <KpiTile label="Hisobot davri foydasi" value={fmtNum(DATA.vitals[1].value)} icon={<IconWalletFilled />} color="#0ea8c7"
                    delta={DATA.vitals[1].delta} trend={DATA.vitals[1].trend} valueTone={valueColor(DATA.vitals[1].value)} />
                <KpiTile label="Sof foyda marjasi" value={fmtPct(DATA.vitals[2].value)} icon={<IconPercentBadge />} color="#f59e0b"
                    delta={DATA.vitals[2].delta} deltaUnit=" p.p." trend={DATA.vitals[2].trend} valueTone={valueColor(DATA.vitals[2].value)} fmtV={fmtPct} />
                <KpiTile label="Sof pul oqimi" value={fmtNum(DATA.vitals[3].value)} icon={<IconArrowUpDown />} color="#22c55e"
                    note={(DATA.vitals[3] as any).note} trend={DATA.vitals[3].trend} />
            </div>

            {/* 02. Moliyaviy holat */}
            <SectionTitle index={2} title="Moliyaviy holat" icon={<IconLayers />} color="#a855f7" hint="tarkib · ulush bo'yicha" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {DATA.composition.map((item) => <CompositionTile key={item.label} item={item} />)}
                {DATA.ratios.map((r) => (
                    <RatioTile key={r.label} label={r.label} value={r.value} delta={r.deltaValue} icon={<IconScale />} color="#0ea8c7" tag={r.tag} />
                ))}
            </div>

            {/* 03. Likvidlik va pul */}
            <SectionTitle index={3} title="Likvidlik va pul" icon={<IconArrowUpDown />} color="#22c55e" hint="oqim ko'prigi · bank qoldiqlari" />
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 8 }}>
                <SectionCard title="Pul oqimi ko'prigi" icon={<IconArrowUpDown />} iconColor="#0ea8c7" hint={DATA.meta.currency}>
                    <CashBridge items={DATA.cashBridge.items} />
                    <div style={{ fontSize: 11.5, color: C.sub, marginTop: 8 }}>{DATA.cashBridge.note}</div>
                </SectionCard>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                    {DATA.cashMetrics.map((m) => (
                        <RatioTile key={m.label} label={m.label} value={m.value} delta={m.deltaValue} icon={<IconWalletFilled />} color={m.up === false ? '#ef4444' : '#22c55e'} />
                    ))}
                </div>
            </div>

            <SectionCard title="Bank hisoblari — turi bo'yicha guruhlangan" icon={<IconBank />} iconColor="#eab308">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <colgroup><col style={{ width: '32%' }} /><col style={{ width: '23%' }} /><col style={{ width: '14%' }} /><col style={{ width: '31%' }} /></colgroup>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }}>Bank</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }}>So'm</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }}>USD</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }}>So'm ekviv.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DATA.bankGroups.map((g) => (
                                <React.Fragment key={g.name}>
                                    <tr>
                                        <td colSpan={4} style={{ padding: '10px 8px 5px', fontSize: 10.5, fontWeight: 700, color: '#4fb3d9', textTransform: 'uppercase', letterSpacing: 0.5 }}>{g.name}</td>
                                    </tr>
                                    {g.rows.map((r) => (
                                        <tr key={r.name}>
                                            <td style={{ padding: '5px 8px', color: C.text, borderBottom: `1px solid ${C.border}` }}>{r.name}</td>
                                            <td style={{ padding: '5px 8px', textAlign: 'right', color: (r as any).flag ? '#eab308' : C.text, borderBottom: `1px solid ${C.border}` }}>{r.sum}{(r as any).flag ? ' ⚑' : ''}</td>
                                            <td style={{ padding: '5px 8px', textAlign: 'right', color: C.sub, borderBottom: `1px solid ${C.border}` }}>{r.usd}</td>
                                            <td style={{ padding: '5px 8px', textAlign: 'right', color: C.text, borderBottom: `1px solid ${C.border}` }}>{r.sumEq}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td style={{ padding: '6px 8px', color: C.text, fontWeight: 700 }}>Oraliq jami</td>
                                        <td />
                                        <td />
                                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: C.text }}>{g.subtotal}</td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.28)', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
                    <NeonIcon color="#eab308" size={22}><IconFlag /></NeonIcon>
                    <span>{DATA.bankFlagNote}</span>
                </div>
            </SectionCard>
        </div>
    );
};

export default FinanceNew;
