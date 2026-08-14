import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, axis, barLabel, centerText, fmt } from '../../components/dashboardUI';
import grrData from './grrData.json';

/* ── Neon ikonka (dizayn tizimiga mos, gradient + glow) ── */
const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: size >= 40 ? 12 : 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color}33, ${color}0a)`,
        border: `1px solid ${color}55`,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}22`,
        color,
    }}>
        {children}
    </div>
);

/* ── Ikonkalar to'plami ── */
const IconLayers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconFolder = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6.5A1.5 1.5 0 014.5 5h4.6l2 2.4H19.5A1.5 1.5 0 0121 8.9v9.6A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5v-12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
        <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconCoins = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="9" cy="7" rx="6" ry="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 7v10c0 1.7 2.7 3 6 3s6-1.3 6-3V7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 9.5c2.9.3 6 1.4 6 3.5s-3.1 3.2-6 3.5M15 17c2.9.3 6 1.4 6 3.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconGauge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 15l4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.3" fill="currentColor" />
    </svg>
);
const IconBars = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTrend = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconStar = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9l-5.6 3.1 1.4-6.2-4.8-4.3 6.4-.6L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconWarning = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4l9 16H3L12 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconPie = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v9l7.8 4.5A9 9 0 1112 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconMapPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconCube = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 7.6L12 12l8-4.4M12 12v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);
const IconGrid = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconExpand = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconRotate = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 4v4h-4M6 20v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ICON_MAP: Record<string, React.ReactNode> = {
    folder: <IconFolder />, pulse: <IconPulse />, check: <IconCheck />, search: <IconSearch />,
    coins: <IconCoins />, gauge: <IconGauge />, bars: <IconBars />, trend: <IconTrend />,
    star: <IconStar />, clock: <IconClock />, warning: <IconWarning />, pie: <IconPie />,
};

/* ── Bo'lim kartochkasi (umumiy dizayn tizimidagi konvensiya) ── */
const SectionCard: React.FC<{
    title: string; icon?: React.ReactNode; iconColor?: string; hint?: string;
    children: React.ReactNode; style?: React.CSSProperties; bodyStyle?: React.CSSProperties;
}> = ({ title, icon, iconColor = '#4fb3d9', hint, children, style, bodyStyle }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
            <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, ...bodyStyle }}>
            {children}
        </div>
    </div>
);

const RISK_COLORS: Record<string, string> = { low: '#22c55e', medium: '#eab308', high: '#ef4444' };
const RISK_LABELS: Record<string, string> = { low: 'Past', medium: "O'rta", high: 'Yuqori' };

const readinessColor = (v: number) => (v >= 60 ? C.up : v >= 40 ? '#eab308' : C.down);

/* Tarkib halqasi — qiymatlar juda kichik (<2%) bo'lgani uchun guruh ichidagi maksimumga nisbatan normallashtiriladi */
const CompositionRing: React.FC<{ label: string; value: number; maxValue: number; color: string }> = ({ label, value, maxValue, color }) => {
    const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,0.08) 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{ width: 47, height: 47, borderRadius: '50%', background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, fontSize: 11.5, fontWeight: 700 }}>
                    {fmt(value, 2)}%
                </div>
            </div>
            <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 600 }}>{label}</div>
        </div>
    );
};

const GRR: React.FC = () => {
    const { meta, kpis, projects, mineralZones, summary, reservesChart, elementContentChart, budgetRemainderChart, resourceDistribution, keyFindings } = grrData;

    const maxComposition = Math.max(...summary.composition.map((c) => c.value));

    const reservesData = {
        labels: reservesChart.labels,
        datasets: [
            { label: "Razvedka qilingan zaxiralar", data: reservesChart.explored, backgroundColor: C.up, borderRadius: 3, barPercentage: 0.75, categoryPercentage: 0.7 },
            { label: 'Resurslar', data: reservesChart.resources, backgroundColor: '#3b82f6', borderRadius: 3, barPercentage: 0.75, categoryPercentage: 0.7 },
        ],
    };

    const elementData = {
        labels: elementContentChart.labels,
        datasets: [
            { label: "Razvedka qilingan zaxiralar", data: elementContentChart.explored, backgroundColor: C.up, borderRadius: 3, barPercentage: 0.6, categoryPercentage: 0.6 },
            { label: 'Resurslar', data: elementContentChart.resources, backgroundColor: '#3b82f6', borderRadius: 3, barPercentage: 0.6, categoryPercentage: 0.6 },
        ],
    };

    const budgetData = {
        labels: budgetRemainderChart.labels,
        datasets: [
            { label: "O'zlashtirildi", data: budgetRemainderChart.used, backgroundColor: C.up, stack: 's', borderRadius: 2, barPercentage: 0.7 },
            { label: 'Qoldiq', data: budgetRemainderChart.remaining, backgroundColor: '#3b82f6', stack: 's', borderRadius: 2, barPercentage: 0.7 },
        ],
    };

    const stagesDonut = {
        labels: summary.stages.map((s) => s.label),
        datasets: [{ data: summary.stages.map((s) => s.count), backgroundColor: summary.stages.map((s) => s.color), borderColor: C.card, borderWidth: 2 }],
    };

    const resourceDonut = {
        labels: resourceDistribution.map((r) => r.label),
        datasets: [{ data: resourceDistribution.map((r) => r.pct), backgroundColor: resourceDistribution.map((r) => r.color), borderColor: C.card, borderWidth: 2 }],
    };

    return (
        <div style={{
            // background: C.bg,
            width: '100%', height: '100%', minHeight: 0,
            overflowY: 'auto', padding: 14, boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/*<NeonIcon color="#3b82f6" size={36}><IconLayers /></NeonIcon>*/}
                    <div>
                        <div style={{ color: 'rgb(241, 242, 246)', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{meta.title}</div>
                        {/*<div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{meta.subtitle}</div>*/}
                    </div>
                </div>
                <span style={{ color: C.sub, fontSize: 11 }}>{meta.dateRange}</span>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, flexShrink: 0 }}>
                {kpis.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <NeonIcon color={k.color} size={26}>{ICON_MAP[k.icon]}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 8.7, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', lineHeight: 1.25 }}>{k.label}</span>
                        </div>
                        <div>
                            <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ color: C.sub, fontSize: 10, marginTop: 3 }}>{k.unit}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Asosiy 3 ustunli qism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.6fr 1fr', gap: 8, minHeight: 380 }}>

                {/* Portfel loyihalari */}
                <SectionCard title="Loyihalar portfeli" icon={<IconFolder />}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                        <span>Loyiha</span>
                        <span>Tayyorlik / Xavf</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', flex: 1, paddingTop: 8, minHeight: 0 }}>
                        {projects.map((p) => (
                            <div key={p.num}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ color: C.sub, fontSize: 10.5, flexShrink: 0 }}>#{p.num}</span>
                                            <span style={{ color: C.text, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                                        </div>
                                        <div style={{ color: '#4fb3d9', fontSize: 10.5, marginTop: 1 }}>{p.stage}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{p.readiness}%</span>
                                        <span title={RISK_LABELS[p.risk]} style={{ width: 9, height: 9, borderRadius: '50%', background: RISK_COLORS[p.risk], boxShadow: `0 0 6px ${RISK_COLORS[p.risk]}` }} />
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
                                    <div style={{ width: `${p.readiness}%`, height: '100%', background: readinessColor(p.readiness), borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: '#4fb3d9', fontSize: 11, fontWeight: 600, paddingTop: 9, marginTop: 6, borderTop: `1px solid ${C.border}`, cursor: 'pointer', flexShrink: 0 }}>
                        Barcha loyihalarni ko'rish <IconArrowRight />
                    </div>
                </SectionCard>

                {/* 3D geologik model */}
                <SectionCard title="3D geologik model" icon={<IconCube />} bodyStyle={{ gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        <img src="/imgs/r6.jpg" alt="3D geologik model" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(1.05) brightness(0.85)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,15,29,0.15) 0%, rgba(10,15,29,0.05) 45%, rgba(10,15,29,0.75) 100%)' }} />

                        {/* Zonalar mineralizatsiyasi legendasi */}
                        <div style={{
                            position: 'absolute', top: 10, right: 10, width: 178,
                            background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)',
                            border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px',
                        }}>
                            <div style={{ color: '#4fb3d9', fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, paddingBottom: 5, marginBottom: 6 }}>
                                Mineralizatsiya zonalari
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {mineralZones.map((m) => (
                                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: 2, background: m.color, flexShrink: 0, boxShadow: `0 0 4px ${m.color}` }} />
                                        <span style={{ color: C.text, fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hudud yorlig'i */}
                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px' }}>
                            <span style={{ color: '#4fb3d9' }}><IconMapPin /></span>
                            <span style={{ color: C.text, fontSize: 10.5, fontWeight: 600 }}>Minerallar hududi</span>
                        </div>

                        {/* Pastki dekorativ asboblar paneli */}
                        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.sub }}>
                                <IconCube /><IconLayers /><IconGrid /><IconExpand /><IconRotate />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 9.5 }}>
                                Kesimlar:
                                {['X', 'Y', 'Z'].map((ax) => (
                                    <span key={ax} style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, fontSize: 9.5, fontWeight: 700 }}>{ax}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 9.5 }}>
                                Shaffoflik:
                                <div style={{ width: 70, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', borderRadius: 2, background: '#4fb3d9' }} />
                                </div>
                                <span style={{ color: C.text, fontWeight: 700 }}>60%</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Loyihalar bo'yicha xulosa */}
                <SectionCard title="Loyihalar bo'yicha xulosa" icon={<IconBars />} bodyStyle={{ overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, flexShrink: 0, marginBottom: 10 }}>
                        {summary.stageCounts.map((s) => (
                            <div key={s.label} style={{ textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 4px' }}>
                                <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                                <div style={{ color: C.sub, fontSize: 8, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 11.5, marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Portfel byudjeti:</span>
                            <span style={{ color: C.text, fontWeight: 700 }}>{summary.budget.total}</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: C.sub }}>O'zlashtirildi ({summary.budget.usedPct}%):</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>{summary.budget.used}</span>
                            </div>
                            <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                                <div style={{ width: `${summary.budget.usedPct}%`, height: '100%', background: '#3b82f6', borderRadius: 3 }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Kutilayotgan tushum:</span>
                            <span style={{ color: C.text, fontWeight: 700 }}>{summary.revenue.expected}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Diskontlangan tushum:</span>
                            <span style={{ color: C.text, fontWeight: 700 }}>{summary.revenue.discounted}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Kutilayotgan NPV (8%):</span>
                            <span style={{ color: C.up, fontWeight: 700 }}>{summary.revenue.npv8}</span>
                        </div>
                    </div>

                    <div style={{ color: '#4fb3d9', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                        Portfelning o'rtacha vaznli tarkibi
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginBottom: 12 }}>
                        {summary.composition.map((c, i) => (
                            <CompositionRing key={c.label} label={c.label} value={c.value} maxValue={maxComposition} color={['#3b82f6', '#a855f7', '#22c55e', '#06b6d4', '#f59e0b'][i % 5]} />
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1, textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 4px' }}>
                            <div style={{ color: C.sub, fontSize: 9 }}>Loyihalar bahosi (NPV10%, mln dollar)</div>
                            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 3 }}>{summary.npv10}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 4px' }}>
                            <div style={{ color: C.sub, fontSize: 9 }}>Portfel IRR</div>
                            <div style={{ color: C.up, fontSize: 18, fontWeight: 700, marginTop: 3 }}>{summary.irr}</div>
                        </div>
                    </div>

                    <div style={{ color: '#4fb3d9', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
                        Loyiha bosqichlari
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                            <Doughnut data={stagesDonut} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${projects.length}`, 'loyiha')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {summary.stages.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 10.5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{s.count}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>({s.pct}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Pastki grafiklar qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, height: 450 }}>
                <SectionCard title="Loyihalar bo'yicha zaxira va resurslar, mln t" icon={<IconLayers />} iconColor="#22c55e">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={reservesData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 9.5 } } } }, scales: axis({ x: { ticks: { font: { size: 8.5 } } }, y: { beginAtZero: true } }) } as any} />
                    </div>
                </SectionCard>

                <SectionCard title="Element guruhlari bo'yicha o'rtacha tarkib" icon={<IconGauge />} iconColor="#a855f7">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={elementData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 9.5 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </SectionCard>

                <SectionCard title="Loyihalar bo'yicha byudjet qoldig'i, mln dollar" icon={<IconCoins />} iconColor="#06b6d4">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={budgetData} options={{
                            ...chartBase, indexAxis: 'y' as const,
                            plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 9.5 } } } },
                            scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 8.5 } } } },
                        } as any} />
                    </div>
                </SectionCard>

                <SectionCard title="Guruhlar bo'yicha resurslar taqsimoti" icon={<IconPie />} iconColor="#f59e0b">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 108, height: 108, flexShrink: 0 }}>
                            <Doughnut data={resourceDonut} options={{ ...chartBase, cutout: '62%', ...noLegend } as any} plugins={[centerText('100%', 'resurslar')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {resourceDistribution.map((r) => (
                                <div key={r.label} style={{ display: 'flex', alignItems: 'center', fontSize: 9.5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{r.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Asosiy xulosalar va risklar */}
            <SectionCard title="" style={{ padding: '12px 14px', flexShrink: 0 }} bodyStyle={{ flexDirection: 'row', gap: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%' }}>
                    {keyFindings.map((f) => (
                        <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                            <NeonIcon color={f.color} size={30}>{ICON_MAP[f.icon]}</NeonIcon>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{f.title}</div>
                                <div style={{ color: C.sub, fontSize: 10.5, marginTop: 3, lineHeight: 1.4 }}>{f.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default GRR;
