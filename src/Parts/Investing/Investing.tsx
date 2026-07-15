import React, { useMemo } from 'react';
import { C } from '../../components/dashboardUI';
import investingData from './investingDemoData.json';

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

/* ── Ikonka to'plami ── */

const IconFileText = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3.5h9l4 4V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 3.5V8h4M8.5 12h7M8.5 15.5h7M8.5 8.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconCoinsStack = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="9" cy="7" rx="6" ry="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 7v9c0 1.66 2.69 3 6 3s6-1.34 6-3V7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12c0 1.66 2.69 3 6 3s6-1.34 6-3" stroke="currentColor" strokeWidth="1.6" />
        <ellipse cx="17" cy="12.5" rx="4.5" ry="2.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12.5 12.5v5.7c0 1.2 2 2.2 4.5 2.2s4.5-1 4.5-2.2v-5.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconWallet = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7.5a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 12.5h3.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1.5 1.5 0 010-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 8.5l11-4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconGlobe = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconBank = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10l9-6 9 6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 10h16v9H4z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 19h16M7 13v4M12 13v4M17 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconChartBar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="13" width="3.6" height="7" rx="1" fill="currentColor" opacity="0.9" />
        <rect x="10.2" y="8.5" width="3.6" height="11.5" rx="1" fill="currentColor" />
        <rect x="16.4" y="4.5" width="3.6" height="15.5" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
);
const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconFactory = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 20V10l5 3.5V10l5 3.5V10l5 3.5V20H3z" fill="currentColor" opacity="0.85" />
        <path d="M6 20v-4M12 20v-4M18 20v-4" stroke="#0a0f1d" strokeWidth="1" opacity="0.4" />
    </svg>
);
const IconRecycle = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 4.5L7 9h4M14.5 4.5L17 9h-4M6 15l-2.2 3.8L6 20h4M18 15l2.2 3.8L18 20h-4M10.5 20h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconSearch = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.3 15.3L20.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconGear = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8L6.3 6.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconCube = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 7.5L12 12l8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconBolt = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" opacity="0.9" />
    </svg>
);
const IconFlask = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 3h5M10 3v5.5L5.6 17a2 2 0 001.8 2.9h9.2a2 2 0 001.8-2.9L14 8.5V3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.8 14.5h8.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const PROJECT_ICONS: Record<string, React.ReactNode> = {
    factory: <IconFactory />, recycle: <IconRecycle />, search: <IconSearch />, gear: <IconGear />,
    cube: <IconCube />, bolt: <IconBolt />, flask: <IconFlask />,
};
const FUNDING_ICONS: Record<string, React.ReactNode> = { wallet: <IconWallet />, globe: <IconGlobe />, bank: <IconBank /> };

/* ── Ma'lumot turlari ── */
type FundingSource = { label: string; value: number; pct: number; icon: string; color: string };
type Project = { id: number; name: string; icon: string; color: string; totalValue: number; yearPlan: number; quarters: number[]; actual: number };
type InvestingData = typeof investingData;
const DATA = investingData as InvestingData;

/* ── Yordamchi funksiyalar ── */
const fmt1 = (n: number): string => n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ── UI blok komponentlari ── */
const KpiCard: React.FC<{ label: string; value: string; unit?: string; icon: React.ReactNode; color: string; style?: React.CSSProperties }> = ({ label, value, unit, icon, color, style }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, ...style }}>
        <NeonIcon color={color} size={46}>{icon}</NeonIcon>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ color: C.text, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>
                {value}{unit && <span style={{ color: C.sub, fontSize: 12, fontWeight: 500, marginLeft: 6 }}>{unit}</span>}
            </div>
        </div>
    </div>
);

const FundingRow: React.FC<{ item: FundingSource }> = ({ item }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <NeonIcon color={item.color} size={30}>{FUNDING_ICONS[item.icon]}</NeonIcon>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: C.sub, fontSize: 9.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: item.color, fontSize: 16, fontWeight: 700 }}>{fmt1(item.value)}</span>
                <span style={{ color: C.sub, fontSize: 9.5 }}>млн доллар</span>
                <span style={{ color: C.sub, fontSize: 9.5 }}>({fmt1(item.pct)}%)</span>
            </div>
        </div>
    </div>
);

const QuarterBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', minWidth: 30 }}>
            <div style={{ height: '100%', width: `${max ? (value / max) * 100 : 0}%`, background: color, borderRadius: 3, boxShadow: `0 0 6px ${color}88` }} />
        </div>
        <span style={{ color: C.text, fontSize: 11, fontWeight: 600, width: 30, textAlign: 'right', flexShrink: 0 }}>{fmt1(value)}</span>
    </div>
);

/* ── Asosiy komponent ── */
const Investing: React.FC = () => {
    const maxQuarter = useMemo(() => Math.max(...DATA.projects.flatMap((p) => p.quarters)), []);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ maxWidth: 900 }}>
                    <div style={{ color: '#4fb3d9', fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{DATA.meta.titleLine1}</div>
                    <div style={{ color: '#4fb3d9', fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{DATA.meta.titleLine2}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 13px', flexShrink: 0 }}>
                    <NeonIcon color="#4fb3d9" size={22}><IconCalendar /></NeonIcon>
                    <div>
                        <div style={{ color: C.text, fontSize: 11.5, fontWeight: 600 }}>{DATA.meta.periodLabel}</div>
                        <div style={{ color: C.sub, fontSize: 10 }}>{DATA.meta.periodRange}</div>
                    </div>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1fr 2fr 1fr', gap: 10, alignItems: 'stretch' }}>
                <KpiCard label="Лойиҳалар сони" value={String(DATA.kpi.projectsCount)} unit="та" icon={<IconFileText />} color="#3b82f6" />
                <KpiCard label="Лойиҳаларнинг умумий қиймати" value={fmt1(DATA.kpi.totalValue)} unit={DATA.meta.unit} icon={<IconCoinsStack />} color="#22c55e" />

                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                    <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Лойиҳалар қиймати манбалари</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                        {DATA.fundingSources.map((f) => <FundingRow key={f.label} item={f as FundingSource} />)}
                    </div>
                </div>

                <KpiCard label="2026 йилга жами ўзлаштириш режаси" value={fmt1(DATA.kpi.yearPlan)} unit={DATA.meta.unit} icon={<IconChartBar />} color="#f97316" />
            </div>

            {/* Loyihalar jadvali */}
            <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ color: '#4fb3d9', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10 }}>
                    2026 йилга лойиҳалар бўйича ўзлаштириш режалари ва амалда ўзлаштирилган кўрсаткичлар <span style={{ color: C.sub, fontWeight: 400, textTransform: 'none' }}>({DATA.meta.unit})</span>
                </div>

                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 980 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '6px 8px', borderBottom: `1px solid ${C.border}`, minWidth: 260 }}>Лойиҳа номи</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>Лойиҳа умумий қиймати</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>2026 йил ўзлаштириш режаси</th>
                                {DATA.quarterLabels.map((q) => (
                                    <th key={q} style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '6px 8px', borderBottom: `1px solid ${C.border}`, minWidth: 110 }}>{q}</th>
                                ))}
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>Амалда ўзлаштирилган (янв-мар)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DATA.projects.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ padding: '7px 8px', borderBottom: `1px solid ${C.border}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                            <NeonIcon color={(p as Project).color} size={28}>{PROJECT_ICONS[p.icon]}</NeonIcon>
                                            <span style={{ color: '#4fb3d9', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.id}</span>
                                            <span style={{ color: C.text }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', color: C.text, fontWeight: 600, padding: '7px 8px', borderBottom: `1px solid ${C.border}` }}>{fmt1(p.totalValue)}</td>
                                    <td style={{ textAlign: 'right', color: C.text, fontWeight: 600, padding: '7px 8px', borderBottom: `1px solid ${C.border}` }}>{fmt1(p.yearPlan)}</td>
                                    {p.quarters.map((q, i) => (
                                        <td key={i} style={{ padding: '7px 8px', borderBottom: `1px solid ${C.border}` }}>
                                            <QuarterBar value={q} max={maxQuarter} color={DATA.quarterColors[i]} />
                                        </td>
                                    ))}
                                    <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: 700, padding: '7px 8px', borderBottom: `1px solid ${C.border}` }}>{fmt1(p.actual)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style={{ color: C.text, fontWeight: 700, padding: '10px 8px' }}>ЖАМИ:</td>
                                <td style={{ textAlign: 'right', color: C.text, fontWeight: 700, padding: '10px 8px' }}>{fmt1(DATA.totals.totalValue)}</td>
                                <td style={{ textAlign: 'right', color: C.text, fontWeight: 700, padding: '10px 8px' }}>{fmt1(DATA.totals.yearPlan)}</td>
                                {DATA.totals.quarters.map((q, i) => (
                                    <td key={i} style={{ textAlign: 'right', color: DATA.quarterColors[i], fontWeight: 700, padding: '10px 8px' }}>{fmt1(q)}</td>
                                ))}
                                <td style={{ textAlign: 'right', color: '#22c55e', fontWeight: 700, padding: '10px 8px' }}>{fmt1(DATA.totals.actual)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Investing;
