import React, { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, axis } from '../../components/dashboardUI';
import financeData from './financeDemoData.json';

/* ── Professional dumaloq ikonka (gradient fon + glow, "badge" uslubi) ── */

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

/* ── Ikonka to'plami (silliq, "duotone" uslubidagi moliyaviy glyflar) ── */

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
const IconChartDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 7.5l6 6 4-4 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.5 12.5v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChartUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 16.5l6-6 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 7.5h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconPieChart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v9l7.8 4.5A9 9 0 1012 3z" fill="currentColor" opacity="0.85" />
        <path d="M12 3a9 9 0 00-9 9h9V3z" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none" />
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
const IconReceipt = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3h12v18l-2.5-1.5L13 21l-1-1.5L11 21l-2.5-1.5L6 21V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconBuilding = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 9h6v12h-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 7h1M10.5 7h1M7 11h1M10.5 11h1M7 15h1M10.5 15h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconLayers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconWallet = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7.5a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 12.5h3.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1.5 1.5 0 010-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 8.5l11-4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
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
const IconDroplets = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 01-13 0C5.5 10 12 3 12 3z" fill="currentColor" opacity="0.8" />
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
const IconDownload = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v13M7 11l5 5 5-5M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── Ma'lumot turlari ── */

type LineItem = { label: string; value: number };
type FinanceData = typeof financeData;
const DATA = financeData as FinanceData;

/* ── Yordamchi funksiyalar ── */

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

/* ── UI blok komponentlari ── */

const SectionTitle: React.FC<{ index: number; title: string; icon: React.ReactNode; color: string }> = ({ index, title, icon, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '4px 0 2px' }}>
        <NeonIcon color={color} size={26}>{icon}</NeonIcon>
        <span style={{ color: '#4fb3d9', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {index}. {title}
        </span>
    </div>
);

const MONTH_SHORT = financeData.trend.labels.map((l) => l.split(' ')[0]);

/* ── Karta ichidagi maydonli (area) trend grafik, oy belgilari va hover tooltip bilan ── */
const AreaTrend: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 46 }) => {
    const w = 260, h = height, padTop = 4, padBottom = 14;
    const plotH = h - padTop - padBottom;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const x = (i: number) => (i / (data.length - 1)) * w;
    const y = (v: number) => padTop + plotH - ((v - min) / range) * plotH;
    const linePoints = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const areaPoints = `0,${padTop + plotH} ${linePoints} ${w},${padTop + plotH}`;
    const gradId = `grad-${color.replace('#', '')}`;
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const relX = ((e.clientX - rect.left) / rect.width) * w;
        let nearest = 0, bestDist = Infinity;
        data.forEach((_, i) => {
            const dist = Math.abs(x(i) - relX);
            if (dist < bestDist) { bestDist = dist; nearest = i; }
        });
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
                <polygon points={areaPoints} fill={`url(#${gradId})`} />
                <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {hovered && (
                    <line x1={hx} y1={padTop} x2={hx} y2={padTop + plotH} stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity={0.55} />
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
                    <div style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{fmtNum(data[hoverIdx as number])}</div>
                </div>
            )}
        </div>
    );
};

const KpiTile: React.FC<{
    label: string; value: string; unit?: string; delta?: number; deltaUnit?: string;
    icon: React.ReactNode; color: string; trend?: number[]; valueTone?: string;
}> = ({ label, value, unit, delta, deltaUnit = '%', icon, color, trend, valueTone }) => (
    <div style={{ minWidth: 0, background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 1)}{deltaUnit}
                </div>
            )}
        </div>
        <div style={{ color: valueTone ?? C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}{unit && <span style={{ color: C.sub, fontSize: 10, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
        </div>
        {trend && <AreaTrend data={trend} color={color} />}
    </div>
);

const donutOpts = { ...chartBase, cutout: '62%', plugins: { legend: { display: false }, tooltip: { enabled: false } } } as any;

const AssetTile: React.FC<{
    label: string; total: number; deltaPct: number; color: string; icon: React.ReactNode;
    breakdown: { label: string; value: number; color: string }[];
}> = ({ label, total, deltaPct, color, icon, breakdown }) => {
    const donut = useMemo(() => ({
        labels: breakdown.map((b) => b.label),
        datasets: [{ data: breakdown.map((b) => b.value), backgroundColor: breakdown.map((b) => b.color), borderColor: C.card, borderWidth: 2 }],
    }), [breakdown]);
    const sum = breakdown.reduce((s, b) => s + b.value, 0) || 1;
    return (
        <div style={{ minWidth: 0, background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                    <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </div>
                <div style={{ color: deltaColor(deltaPct), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(deltaPct)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(deltaPct)} {fmtNum(Math.abs(deltaPct), 1)}%
                </div>
            </div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{fmtNum(total)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 52, height: 52, flexShrink: 0 }}>
                    <Doughnut data={donut} options={donutOpts} />
                </div>
                <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {breakdown.map((b) => (
                        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: b.color, boxShadow: `0 0 4px ${b.color}`, flexShrink: 0 }} />
                            <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{b.label}</span>
                            <span style={{ color: C.text, fontWeight: 600, flexShrink: 0 }}>{Math.round((b.value / sum) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RatioTile: React.FC<{ label: string; value: string; delta: number; icon: React.ReactNode; color: string; trend?: number[] }> = ({ label, value, delta, icon, color, trend }) => (
    <div style={{ minWidth: 0, background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                {deltaArrow(delta)} {fmtNum(Math.abs(delta), 2)}
            </div>
        </div>
        <span style={{ color: C.text, fontSize: 19, fontWeight: 700 }}>{value}</span>
        {trend && <AreaTrend data={trend} color={color} />}
    </div>
);

/* ── Asosiy komponent ── */

const Finance: React.FC = () => {
    const bs = DATA.balanceSheet;
    const is = DATA.incomeStatement;
    const d = DATA.deltas as Record<string, number>;

    const grossMargin = (is.grossProfit / is.revenue) * 100;
    const operatingMargin = (is.operatingProfit / is.revenue) * 100;
    const netMargin = (is.netProfit / is.revenue) * 100;
    const roa = (is.netProfit / bs.totalAssets) * 100;
    const roe = (is.netProfit / bs.capitalTotal) * 100;
    const debtToEquity = bs.totalLiabilities / bs.capitalTotal;
    const currentRatio = bs.currentAssetsTotal / bs.currentLiabilitiesTotal;
    const netCashFlow = DATA.cashFlow.operating + DATA.cashFlow.investing + DATA.cashFlow.financing;

    const trendChart = useMemo(() => ({
        labels: DATA.trend.labels,
        datasets: [
            { label: 'Тушум', data: DATA.trend.revenue, backgroundColor: '#3b82f6', borderRadius: 4 },
            { label: 'Ялпи фойда', data: DATA.trend.grossProfit, backgroundColor: '#eab308', borderRadius: 4 },
            { label: 'Операцион фойда', data: DATA.trend.operatingProfit, backgroundColor: '#ef4444', borderRadius: 4 },
            { label: 'Ҳисобот даври фойдаси', data: DATA.trend.netProfit, backgroundColor: '#22c55e', borderRadius: 4 },
        ],
    }), []);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#eab308" size={36}><IconDollar /></NeonIcon>
                    <div>
                        <div style={{ color: '#4fb3d9', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{DATA.meta.title}</div>
                        <div style={{ color: C.sub, fontSize: 11.5, marginTop: 2, maxWidth: 640 }}>{DATA.meta.company}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.text, fontSize: 11.5 }}>
                        <IconCalendar />Даврi: {DATA.meta.period}
                    </div>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.sub, fontSize: 11.5 }}>
                        Солиштириш: {DATA.meta.comparePeriod}
                    </div>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.sub, fontSize: 11.5 }}>
                        Валюта: {DATA.meta.currency}
                    </div>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 11px', color: C.sub, fontSize: 11.5 }}>
                        Курс: 1 USD = {fmtNum(DATA.meta.exchangeRate, 2)} сўм
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: C.sub, fontSize: 10 }}>Янгиланган:</div>
                        <div style={{ color: C.text, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>{DATA.meta.generatedAt} <span style={{ color: '#4fb3d9' }}><IconRefresh /></span></div>
                    </div>
                </div>
            </div>

            {/* 1. Moliyaviy natijalar (oy bo'yicha) */}
            <SectionTitle index={1} title="Молиявий натижалар (ой бўйича)" icon={<IconDollar />} color="#eab308" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label="Тушум" value={fmtNum(is.revenue)} delta={d.revenue} icon={<IconDollar />} color="#3b82f6" trend={DATA.trend.revenue} />
                <KpiTile label="Ялпи фойда" value={fmtNum(is.grossProfit)} delta={d.grossProfit} icon={<IconChartBars />} color="#eab308" trend={DATA.trend.grossProfit} valueTone={valueColor(is.grossProfit)} />
                <KpiTile label="Операцион фойда" value={fmtNum(is.operatingProfit)} delta={d.operatingProfit} icon={<IconChartDown />} color="#ef4444" trend={DATA.trend.operatingProfit} valueTone={valueColor(is.operatingProfit)} />
                <KpiTile label="Фойда солиғидан олдинги фойда" value={fmtNum(is.profitBeforeTax)} delta={d.profitBeforeTax} icon={<IconPieChart />} color="#a855f7" trend={DATA.trend.profitBeforeTax} valueTone={valueColor(is.profitBeforeTax)} />
                <KpiTile label="Ҳисобот даври фойдаси" value={fmtNum(is.netProfit)} delta={d.netProfit} icon={<IconWalletFilled />} color="#0ea8c7" trend={DATA.trend.netProfit} valueTone={valueColor(is.netProfit)} />
                <KpiTile label="Ялпи фойда маржаси" value={fmtNum(grossMargin, 1)} unit="%" delta={d.grossMarginPP} deltaUnit=" п.п." icon={<IconPercentBadge />} color="#22c55e" trend={DATA.trend.grossMargin} valueTone={valueColor(grossMargin)} />
                <KpiTile label="Операцион маржа" value={fmtNum(operatingMargin, 1)} unit="%" delta={d.operatingMarginPP} deltaUnit=" п.п." icon={<IconPercentBadge />} color="#ef4444" trend={DATA.trend.operatingMargin} valueTone={valueColor(operatingMargin)} />
                <KpiTile label="Соф фойда маржаси" value={fmtNum(netMargin, 1)} unit="%" delta={d.netMarginPP} deltaUnit=" п.п." icon={<IconPercentBadge />} color="#f59e0b" trend={DATA.trend.netMargin} valueTone={valueColor(netMargin)} />
            </div>

            {/* 2. Daromad va xarajatlar tahlili */}
            <SectionTitle index={2} title="Даромад ва харажатлар таҳлили" icon={<IconReceipt />} color="#4fb3d9" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label="Сотиш таннархи" value={fmtNum(is.costOfSales)} delta={d.costOfSales} icon={<IconReceipt />} color="#ef4444" trend={DATA.trend.costOfSales} valueTone={valueColor(is.costOfSales)} />
                <KpiTile label="Сотиш ва тарқатиш харажатлари" value={fmtNum(is.sellingExpenses)} delta={d.sellingExpenses} icon={<IconReceipt />} color="#22c55e" trend={DATA.trend.sellingExpenses} valueTone={valueColor(is.sellingExpenses)} />
                <KpiTile label="Маъмурий харажатлар" value={fmtNum(is.adminExpenses)} delta={d.adminExpenses} icon={<IconReceipt />} color="#ef4444" trend={DATA.trend.adminExpenses} valueTone={valueColor(is.adminExpenses)} />
                <KpiTile label="Бошқа операцион харажатлар" value={fmtNum(is.otherOperatingExpenses)} delta={d.otherOperatingExpenses} icon={<IconReceipt />} color="#ef4444" trend={DATA.trend.otherOperatingExpenses} valueTone={valueColor(is.otherOperatingExpenses)} />
                <KpiTile label="Операцион даромадлар" value={fmtNum(is.otherOperatingIncome)} delta={d.otherOperatingIncome} icon={<IconChartUp />} color="#22c55e" trend={DATA.trend.otherOperatingIncome} valueTone={valueColor(is.otherOperatingIncome)} />
                <KpiTile label="Молиявий даромад" value={fmtNum(is.financialIncome.total)} delta={d.financialIncome} icon={<IconChartUp />} color="#22c55e" trend={DATA.trend.financialIncome} valueTone={valueColor(is.financialIncome.total)} />
                <KpiTile label="Молиявий харажатлар" value={fmtNum(is.financialExpenses.total)} delta={d.financialExpenses} icon={<IconChartDown />} color="#ef4444" trend={DATA.trend.financialExpenses} valueTone={valueColor(is.financialExpenses.total)} />
                <KpiTile label="Фойда солиғи харажати" value={fmtNum(is.incomeTaxExpense)} delta={d.incomeTaxExpense} icon={<IconReceipt />} color="#ef4444" trend={DATA.trend.incomeTaxExpense} valueTone={valueColor(is.incomeTaxExpense)} />
            </div>

            {/* 3. Aktivlar va majburiyatlar tahlili */}
            <SectionTitle index={3} title="Активлар ва мажбуриятлар таҳлили" icon={<IconLayers />} color="#a855f7" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <AssetTile
                    label="Жами активлар" total={bs.totalAssets} deltaPct={d.totalAssets} color="#3b82f6" icon={<IconLayers />}
                    breakdown={[
                        { label: 'Узоқ муддатли активлар', value: bs.longTermAssetsTotal, color: '#3b82f6' },
                        { label: 'Жорий активлар', value: bs.currentAssetsTotal, color: '#0ea8c7' },
                    ]}
                />
                <AssetTile
                    label="Узоқ муддатли активлар" total={bs.longTermAssetsTotal} deltaPct={d.longTermAssetsTotal} color="#a855f7" icon={<IconBuilding />}
                    breakdown={bs.longTermAssets.map((it: LineItem, i: number) => ({ label: it.label, value: it.value, color: ['#a855f7', '#3b82f6', '#eab308', '#94a3b8'][i % 4] }))}
                />
                <AssetTile
                    label="Жорий активлар" total={bs.currentAssetsTotal} deltaPct={d.currentAssetsTotal} color="#0ea8c7" icon={<IconWallet />}
                    breakdown={bs.currentAssets.map((it: LineItem, i: number) => ({ label: it.label, value: it.value, color: ['#0ea8c7', '#3b82f6', '#22c55e', '#f59e0b'][i % 4] }))}
                />
                <AssetTile
                    label="Жами капитал" total={bs.capitalTotal} deltaPct={d.capitalTotal} color="#22c55e" icon={<IconScale />}
                    breakdown={bs.capital.map((it: LineItem, i: number) => ({ label: it.label, value: it.value, color: ['#22c55e', '#3b82f6', '#eab308'][i % 3] }))}
                />
                <AssetTile
                    label="Жами мажбуриятлар" total={bs.totalLiabilities} deltaPct={d.totalLiabilities} color="#ef4444" icon={<IconScale />}
                    breakdown={[
                        { label: 'Узоқ муддатли мажбуриятлар', value: bs.longTermLiabilitiesTotal, color: '#ef4444' },
                        { label: 'Жорий мажбуриятлар', value: bs.currentLiabilitiesTotal, color: '#f59e0b' },
                    ]}
                />
                <AssetTile
                    label="Жами капитал ва мажбуриятлар" total={bs.totalCapitalAndLiabilities} deltaPct={d.totalCapitalAndLiabilities} color="#f59e0b" icon={<IconLayers />}
                    breakdown={[
                        { label: 'Жами капитал', value: bs.capitalTotal, color: '#22c55e' },
                        { label: 'Жами мажбуриятлар', value: bs.totalLiabilities, color: '#ef4444' },
                    ]}
                />
                <RatioTile label="Қарз/капитал коэффициенти" value={fmtNum(debtToEquity, 2)} delta={d.debtToEquity} icon={<IconScale />} color="#eab308" trend={DATA.trend.debtToEquity} />
                <RatioTile label="Жорий ликвидлик коэффициенти" value={fmtNum(currentRatio, 2)} delta={d.currentRatio} icon={<IconDroplets />} color="#0ea8c7" trend={DATA.trend.currentRatio} />
            </div>

            {/* 4. Pul oqimlari va bank ma'lumotlari */}
            <SectionTitle index={4} title="Пул оқимлари ва банк маълумотлари" icon={<IconArrowUpDown />} color="#22c55e" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label="Пул маблағлари ва уларнинг эквивалентлари" value={fmtNum(DATA.cashFlow.cashAndEquivalents)} delta={d.cash} icon={<IconWalletFilled />} color="#22c55e" trend={DATA.trend.cash} valueTone={valueColor(DATA.cashFlow.cashAndEquivalents)} />
                <KpiTile label="Операцион пул оқими" value={fmtNum(DATA.cashFlow.operating)} icon={<IconArrowUpDown />} color="#ef4444" trend={DATA.trend.operatingCF} valueTone={valueColor(DATA.cashFlow.operating)} />
                <KpiTile label="Инвестицион пул оқими" value={fmtNum(DATA.cashFlow.investing)} icon={<IconArrowUpDown />} color="#ef4444" trend={DATA.trend.investingCF} valueTone={valueColor(DATA.cashFlow.investing)} />
                <KpiTile label="Молиявий пул оқими" value={fmtNum(DATA.cashFlow.financing)} icon={<IconArrowUpDown />} color="#22c55e" trend={DATA.trend.financingCF} valueTone={valueColor(DATA.cashFlow.financing)} />
                <KpiTile label="Соф пул оқими" value={fmtNum(netCashFlow)} icon={<IconArrowUpDown />} color="#22c55e" trend={DATA.trend.netCF} valueTone={valueColor(netCashFlow)} />
                <RatioTile label="Активлар устига қайтувчанлик (ROA)" value={`${fmtNum(roa, 1)}%`} delta={d.roa} icon={<IconPercentBadge />} color="#3b82f6" trend={DATA.trend.roa} />
                <RatioTile label="Капитал устига қайтувчанлик (ROE)" value={`${fmtNum(roe, 1)}%`} delta={d.roe} icon={<IconPercentBadge />} color="#a855f7" trend={DATA.trend.roe} />
                <KpiTile label="EBITDA" value={fmtNum(DATA.cashFlow.ebitda)} icon={<IconDollar />} color="#f59e0b" trend={DATA.trend.ebitda} valueTone={valueColor(DATA.cashFlow.ebitda)} />
            </div>

            {/* Bank jadvali va dinamika grafigi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <NeonIcon color="#0ea8c7" size={22}><IconBank /></NeonIcon>Банк ҳисоб рақамларидаги қолдиқ пул маблағлари
                        </div>
                        <div style={{ color: C.sub, fontSize: 9.5 }}>Валюта курси: 1 USD = {fmtNum(DATA.meta.exchangeRate, 2)} сўм</div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>Банк номи</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>Сўм</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>АҚШ Доллар</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>Сўмдаги эквиваленти</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DATA.banks.accounts.map((b) => (
                                    <tr key={b.name}>
                                        <td style={{ color: C.text, padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>{b.name}</td>
                                        <td style={{ color: C.text, textAlign: 'right', padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>{b.sum ? fmtNum(b.sum) : '-'}</td>
                                        <td style={{ color: C.text, textAlign: 'right', padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>{b.usd ? fmtNum(b.usd) : '-'}</td>
                                        <td style={{ color: C.text, textAlign: 'right', padding: '5px 6px', borderBottom: `1px solid ${C.border}` }}>{b.sumEquivalent ? fmtNum(b.sumEquivalent) : '-'}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td style={{ color: C.text, fontWeight: 700, padding: '6px 6px' }}>ВАЛЮТА БЎЙИЧА ЖАМИ</td>
                                    <td style={{ color: C.text, fontWeight: 700, textAlign: 'right', padding: '6px 6px' }}>{fmtNum(DATA.banks.total.sum)}</td>
                                    <td style={{ color: C.text, fontWeight: 700, textAlign: 'right', padding: '6px 6px' }}>{fmtNum(DATA.banks.total.usd)}</td>
                                    <td style={{ color: C.text, fontWeight: 700, textAlign: 'right', padding: '6px 6px' }}>{fmtNum(DATA.banks.total.sumEquivalent)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <NeonIcon color="#eab308" size={22}><IconChartBars /></NeonIcon>Тушум, харажатлар ва фойда динамикаси
                        </div>
                        <div style={{ color: C.sub, fontSize: 9.5 }}>Валюта: {DATA.meta.currency}</div>
                    </div>
                    <div style={{ flex: 1, minHeight: 260 }}>
                        <Bar
                            data={trendChart as any}
                            options={{
                                ...chartBase,
                                plugins: { legend: { position: 'top', labels: { color: C.sub, font: { size: 10 }, boxWidth: 10 } } },
                                scales: axis({ y: { ticks: { color: C.sub, font: { size: 9 }, callback: (v: any) => fmtNum(Number(v)) } } }),
                            } as any}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.sub, fontSize: 11, paddingTop: 2 }}>
                <span>{DATA.meta.periodEndLabel}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconDownload />Экспорт / Форма №1, №2</span>
            </div>
        </div>
    );
};

export default Finance;
