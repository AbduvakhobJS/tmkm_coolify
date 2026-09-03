import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { C, chartBase, axis } from '../../components/dashboardUI';
import DATA_JSON from './financeNewMainDemoData.json';
import { GC } from '../../theme/palette';

/* ── Professional dumaloq ikonka (FinanceNew.tsx bilan bir xil "badge" uslubi) ── */

const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${GC.icon}40, ${GC.icon}12)`,
        border: `1.3px solid ${GC.icon}70`,
        boxShadow: `0 0 12px ${GC.icon}66, inset 0 0 8px ${GC.icon}30`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

/* ── Ikonka to'plami ── */
const IconGlobe = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconDollar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M12 5.5v13M15.5 8.3c0-1.3-1.4-2.3-3.5-2.3-2.3 0-3.7 1.1-3.7 2.6 0 3.4 7.2 1.7 7.2 5.1 0 1.6-1.6 2.8-4 2.8-2.1 0-3.7-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTruck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6.5h11v10H2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M13 10h4.5l3.5 3.5v3H13z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconTagPrice = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 3.5H20a1 1 0 011 1v7.5a1 1 0 01-.3.7l-9 9a1 1 0 01-1.4 0l-8.2-8.2a1 1 0 010-1.4l9-9a1 1 0 01.4-.3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="16.5" cy="7.5" r="1.6" fill="currentColor" />
    </svg>
);
const IconChartBars = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="13" width="3.6" height="7" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="10.2" y="8.5" width="3.6" height="11.5" rx="1" fill="currentColor" />
        <rect x="16.4" y="4.5" width="3.6" height="15.5" rx="1" fill="currentColor" opacity="0.7" />
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
const IconWeight = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 8.5L4 20h16L15.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconPickaxe = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8c4-4 10-5 15-2M18 6c3 3 2 9-2 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.5 11.5L4 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconFlask = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 3h5M10 3v5.5L5.6 17a2 2 0 001.8 2.9h9.2a2 2 0 001.8-2.9L14 8.5V3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.8 14.5h8.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconCube = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 7.5L12 12l8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconPieChart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5A9.5 9.5 0 1121.5 12H12V2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 12L4.5 6.5A9.5 9.5 0 0012 21.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconInfo = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 11v6M12 7.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

/* ── Ma'lumot turi ── */
type FinanceNewMainData = typeof DATA_JSON;
const DATA = DATA_JSON as FinanceNewMainData;

const MARKET_COLOR: Record<string, string> = { blue: GC.blue, purple: GC.violet, teal: GC.cyan, amber: GC.amber, coral: GC.amber, gray: GC.slate };
const PRODUCT_ICON = [<IconPickaxe key="p" />, <IconCube key="w" />, <IconWeight key="m" />, <IconChartBars key="k" />, <IconFlask key="s" />];

/* ── Yordamchi funksiyalar (FinanceNew.tsx bilan bir xil nomlash) ── */
const fmtNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};
const deltaColor = (n: number) => (n < 0 ? GC.red : GC.green);
const deltaArrow = (n: number) => (n < 0 ? '▼' : '▲');
const MONTH_SHORT = DATA.trendLabels;

/* ── Nuqtalar orqali silliq (Catmull-Rom) egri chiziq (FinanceNew.tsx bilan bir xil) ── */
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

/* ── Bo'lim sarlavhasi ── */
const SectionTitle: React.FC<{ index: number; title: string; icon: React.ReactNode; color: string; hint?: string }> = ({ index, title, icon, color, hint }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '4px 0 2px' }}>
        <NeonIcon color={color} size={26}>{icon}</NeonIcon>
        <span style={{ color: GC.cyan, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {index}. {title}
        </span>
        {hint && <span style={{ marginLeft: 'auto', color: C.sub, fontSize: 10.5 }}>{hint}</span>}
    </div>
);

/* ── Karta qobig'i ── */
const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = GC.cyan, hint, children, style }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: GC.cyan, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        {children}
    </div>
);

/* ── Karta ichidagi maydonli (area) trend grafik, oy belgilari va hover tooltip bilan ── */
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
    const gradId = `grad-main-${color.replace('#', '')}`;
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
                        style={hoverIdx === i ? { filter: `drop-shadow(0 0 3px ${GC.icon})` } : undefined}
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
                    background: '#0a0f1df2', border: `1px solid ${GC.icon}99`, borderRadius: 6,
                    padding: '3px 8px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20,
                    boxShadow: `0 2px 10px ${GC.icon}55`, textAlign: 'center',
                }}>
                    <div style={{ color: C.sub, fontSize: 8, fontWeight: 600, textTransform: 'uppercase' }}>{MONTH_SHORT[hoverIdx as number]}</div>
                    <div style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{fmtV(data[hoverIdx as number])}</div>
                </div>
            )}
        </div>
    );
};

/* ── KPI kartasi ── */
const KpiTile: React.FC<{
    label: string; value: string; unit?: string; delta?: number | null; deltaUnit?: string;
    icon: React.ReactNode; color: string; trend?: number[]; valueTone?: string; fmtV?: (n: number) => string;
}> = ({ label, value, unit, delta, deltaUnit = '%', icon, color, trend, valueTone, fmtV }) => (
    <div style={{ minWidth: 0, background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && delta !== null && (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 1)}{deltaUnit}
                </div>
            )}
        </div>
        <div style={{ color: valueTone ?? C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}{unit && <span style={{ color: C.sub, fontSize: 10, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
        </div>
        {trend && <AreaTrend data={trend} color={color} fmtV={fmtV} />}
    </div>
);

/* ── Asosiy komponent ── */
const FinanceNewMain: React.FC = () => {
    const fmtPct = (n: number) => `${fmtNum(n, 1)}%`;
    const fmtUsd = (n: number) => `$${fmtNum(n, n < 100 ? 1 : 0)}`;

    const totalSalesRevenue = useMemo(() => DATA.salesByProduct.reduce((s, p) => s + p.revenue, 0), []);
    const totalTonnage = useMemo(() => DATA.salesByProduct.reduce((s, p) => s + p.tonnage, 0), []);

    /* Bozor narxlari indeksi — har metallni yanvarga nisbatan 100 deb normallashtirish, shunda turli birlikdagi (mis $/t, volfram $/mtu, molibden $/funt) narxlar bir grafikda solishtiriladi */
    const priceIndexChart = useMemo(() => {
        const datasets = DATA.marketPrices.map((m) => {
            const base = m.trend[0];
            return {
                label: m.label,
                data: m.trend.map((v) => +((v / base) * 100).toFixed(1)),
                borderColor: m.color,
                backgroundColor: `${m.color}18`,
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 2.5,
                pointBackgroundColor: m.color,
                fill: false,
            };
        });
        return {
            data: { labels: DATA.trendLabels, datasets },
            options: {
                ...chartBase,
                plugins: {
                    legend: { display: true, position: 'top' as const, labels: { color: C.sub, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 10 } } },
                    tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}` } },
                },
                scales: axis({ y: { ticks: { color: C.sub, font: { size: 9 }, callback: (v: any) => `${v}` } } }),
            },
        };
    }, []);

    return (
        <div style={{
            background: 'var(--gc-panel-bg)',
            height: '100vh',
            overflowY: 'auto',
            padding: 14,
            boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/*<NeonIcon color={GC.cyan} size={36}><IconGlobe /></NeonIcon>*/}
                    <div>
                        <div style={{ color: C.text, fontSize: "clamp(14px, 3.4cqmin, 24px)", fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{DATA.meta.company}</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{DATA.meta.subtitle}</div>
                    </div>
                </div>
                {/*<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>*/}
                {/*    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.text, fontSize: 11.5 }}>*/}
                {/*        <IconCalendar />Davr: {DATA.meta.period}*/}
                {/*    </div>*/}
                {/*    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.sub, fontSize: 11.5 }}>Solishtirish: {DATA.meta.comparePeriod}</div>*/}
                {/*    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.sub, fontSize: 11.5 }}>Kurs: {DATA.meta.exchangeRate} so'm</div>*/}
                {/*    <div style={{ textAlign: 'right' }}>*/}
                {/*        <div style={{ color: C.sub, fontSize: 10 }}>Yangilangan:</div>*/}
                {/*        <div style={{ color: C.text, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{DATA.meta.generatedAt} <span style={{ color: GC.cyan }}><IconRefresh /></span></div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            {/* Vitals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label="Sotuvdan jami tushum" value={fmtNum(DATA.vitals[0].value)} unit={DATA.meta.currency} icon={<IconDollar />} color={GC.blue}
                    delta={DATA.vitals[0].delta} trend={DATA.vitals[0].trend} />
                <KpiTile label="Eksport ulushi" value={fmtPct(DATA.vitals[1].value)} icon={<IconTruck />} color={GC.cyan}
                    delta={DATA.vitals[1].delta} deltaUnit=" p.p." trend={DATA.vitals[1].trend} fmtV={fmtPct} />
                <KpiTile label="Realizatsiya indeksi" value={fmtPct(DATA.vitals[2].value)} icon={<IconPercentBadge />} color={GC.green}
                    delta={DATA.vitals[2].delta} deltaUnit=" p.p." trend={DATA.vitals[2].trend} fmtV={fmtPct} />
                <KpiTile label="Sotilgan umumiy hajm" value={fmtNum(DATA.vitals[3].value)} unit={(DATA.vitals[3] as any).unit} icon={<IconWeight />} color={GC.amber}
                    delta={DATA.vitals[3].delta} trend={DATA.vitals[3].trend} />
            </div>

            {/* 01. Mahsulot bo'yicha sotuv */}
            <SectionTitle index={1} title="Mahsulot bo'yicha sotuv" icon={<IconPickaxe />} color={GC.amber} hint={`jami ${fmtNum(totalTonnage)} t · ${fmtNum(totalSalesRevenue)} ${DATA.meta.currency}`} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Sotuv tuzilmasi" icon={<IconPieChart />} iconColor={GC.amber} hint="hajm va tushum ulushi">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {DATA.salesByProduct.map((p, i) => {
                            const revPct = (p.revenue / totalSalesRevenue) * 100;
                            return (
                                <div key={p.label} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '7px 9px', background: C.cardAlt, borderRadius: 9, border: `1px solid ${C.border}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                                        <NeonIcon color={p.color} size={22}>{PRODUCT_ICON[i % PRODUCT_ICON.length]}</NeonIcon>
                                        <span style={{ color: C.text, fontSize: 10.5, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label}</span>
                                        <span style={{ color: deltaColor(p.delta), fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}>{deltaArrow(p.delta)} {fmtNum(p.delta, 1)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
                                        <div style={{ width: `${revPct}%`, background: p.color, borderRadius: 3 }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: C.sub }}>
                                        <span>{fmtNum(p.tonnage)} t</span>
                                        <span>{fmtNum(p.revenue)} {DATA.meta.currency} <b style={{ color: C.text }}>({fmtNum(revPct, 1)}%)</b></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
                <SectionCard title="Narx va rentabellik — jahon narxiga nisbatan" icon={<IconTagPrice />} iconColor={GC.green} hint="$ / birlik">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '5px 7px', borderBottom: `1px solid ${C.border}` }}>Mahsulot</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 7px', borderBottom: `1px solid ${C.border}` }}>Jahon narxi</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 7px', borderBottom: `1px solid ${C.border}` }}>Realizatsiya</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 7px', borderBottom: `1px solid ${C.border}` }}>Tannarx</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 7px', borderBottom: `1px solid ${C.border}` }}>Marja</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DATA.salesByProduct.map((p) => (
                                    <tr key={p.label}>
                                        <td style={{ padding: '6px 7px', color: C.text, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{p.label}</td>
                                        <td style={{ padding: '6px 7px', textAlign: 'right', color: C.sub, borderBottom: `1px solid ${C.border}` }}>{p.worldPrice ? `${fmtUsd(p.worldPrice)}${p.priceUnit.replace('$', '')}` : '—'}</td>
                                        <td style={{ padding: '6px 7px', textAlign: 'right', color: C.text, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{fmtUsd(p.realizedPrice)}{p.priceUnit.replace('$', '')}</td>
                                        <td style={{ padding: '6px 7px', textAlign: 'right', color: C.sub, borderBottom: `1px solid ${C.border}` }}>{fmtUsd(p.cashCost)}{p.priceUnit.replace('$', '')}</td>
                                        <td style={{ padding: '6px 7px', textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>
                                            <span style={{ color: GC.green, fontWeight: 700, background: 'rgba(34,197,94,0.12)', borderRadius: 6, padding: '2px 7px' }}>{fmtNum(p.marginPct, 1)}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>
                        Realizatsiya narxi jahon bozori narxidan kontsentrat tarkibi va tashish xarajatlari hisobiga farqlanadi. Kukun metallurgiyasi mahsulotlari uchun jahon birja narxi mavjud emas — ichki shartnoma narxi ko'rsatilgan.
                    </div>
                </SectionCard>
            </div>

            {/* 02. Jahon bozori narxlari */}
            <SectionTitle index={2} title="Jahon bozori narxlari" icon={<IconGlobe />} color={GC.blue} hint="LME / birja ko'rsatkichlari" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {DATA.marketPrices.map((m) => {
                    const last = m.trend[m.trend.length - 1];
                    const prev = m.trend[m.trend.length - 2];
                    const delta = ((last - prev) / prev) * 100;
                    return (
                        <KpiTile key={m.label} label={m.label} value={fmtUsd(last)} unit={m.unit.replace('$/', '')} icon={<IconTagPrice />} color={m.color}
                            delta={delta} trend={m.trend} fmtV={fmtUsd} />
                    );
                })}
            </div>
            <SectionCard title="Narxlar indeksi — yanvarga nisbatan (=100)" icon={<IconChartBars />} iconColor={GC.blue} hint="turli birlikdagi narxlarni solishtirish uchun normallashtirilgan">
                <div style={{ height: 220 }}>
                    <Line data={priceIndexChart.data as any} options={priceIndexChart.options as any} />
                </div>
            </SectionCard>

            {/* 03. Eksport bozorlari */}
            <SectionTitle index={3} title="Eksport bozorlari" icon={<IconTruck />} color={GC.violet} hint="hududlar bo'yicha sotuv ulushi" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Hududlar bo'yicha taqsimot" icon={<IconPieChart />} iconColor={GC.violet}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {DATA.exportMarkets.map((m) => (
                            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.text }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: MARKET_COLOR[m.color], boxShadow: `0 0 5px ${MARKET_COLOR[m.color]}` }} />
                                        {m.label}
                                    </span>
                                    <span style={{ color: C.text, fontWeight: 700 }}>{fmtNum(m.pct, 1)}%</span>
                                </div>
                                <div style={{ height: 7, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${m.pct}%`, background: MARKET_COLOR[m.color], borderRadius: 3, boxShadow: `0 0 6px ${MARKET_COLOR[m.color]}88` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="Bozor sharhi" icon={<IconInfo />} iconColor={GC.amber} style={{ justifyContent: 'space-between' }}>
                    <div style={{ color: C.sub, fontSize: 11.5, lineHeight: 1.6 }}>{DATA.marketNote}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                        <div style={{ padding: '9px 11px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 9 }}>
                            <div style={{ color: GC.green, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Eng yuqori o'sish</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>Mis kontsentrati · +8,4%</div>
                        </div>
                        <div style={{ padding: '9px 11px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.28)', borderRadius: 9 }}>
                            <div style={{ color: GC.amber, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>Diqqat talab</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>Sulfat kislotasi tannarxi</div>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default FinanceNewMain;
