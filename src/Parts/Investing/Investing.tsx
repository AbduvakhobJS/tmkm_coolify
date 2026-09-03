import React from 'react';
import { C } from '../../components/dashboardUI';
import investingData from './investingDemoData.json';
import { useGetAllInvesting } from '../../hooks/investing';
import { GC } from '../../theme/palette';

/* ── Professional dumaloq ikonka (gradient fon + glow, "badge" uslubi) ── */

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
const IconTarget = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" />
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
type Funding = { own: number; foreign: number; fund: number };
type Project = {
    id: number; name: string; region: string; district: string; capacity: string; term: string;
    icon: string; color: string; funding: Funding;
    totalValue: number; yearPlan: number; quartersPlan: number[]; quartersActual: number[];
};
type InvestingData = typeof investingData;
const DATA = investingData as InvestingData;
const FUND_COLORS = DATA.fundingColors;

/* ── Yordamchi funksiyalar ── */
const fmt1 = (n: number): string => n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* ── UI blok komponentlari ── */
const KpiCard: React.FC<{ label: string; value: string; unit?: string; sub?: string; icon: React.ReactNode; color: string }> = ({ label, value, unit, sub, icon, color }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <NeonIcon color={color} size={46}>{icon}</NeonIcon>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
            <div style={{ color: C.text, fontSize: 23, fontWeight: 700, lineHeight: 1 }}>
                {value}{unit && <span style={{ color: C.sub, fontSize: 12, fontWeight: 500, marginLeft: 6 }}>{unit}</span>}
            </div>
            {sub && <div style={{ color: C.sub, fontSize: 10.5, marginTop: 5 }}>{sub}</div>}
        </div>
    </div>
);

const FundingRow: React.FC<{ item: FundingSource }> = ({ item }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <NeonIcon color={item.color} size={30}>{FUNDING_ICONS[item.icon]}</NeonIcon>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: C.sub, fontSize: 9.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>{item.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: item.color, fontSize: 16, fontWeight: 700 }}>{fmt1(item.value)}</span>
                <span style={{ color: C.sub, fontSize: 9.5 }}>млн $</span>
                <span style={{ color: C.sub, fontSize: 9.5 }}>({fmt1(item.pct)}%)</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginTop: 4 }}>
                <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 2 }} />
            </div>
        </div>
    </div>
);

/* Loyiha qiymatining moliялаштириш манбалари бўйича тақсимланиши (segmentli бар) */
const FundingSplit: React.FC<{ f: Funding; total: number }> = ({ f, total }) => {
    const segs = [
        { v: f.own, c: FUND_COLORS.own, t: 'Ўз маблағлари' },
        { v: f.foreign, c: FUND_COLORS.foreign, t: 'Хорижий инвестиция ва кредитлар' },
        { v: f.fund, c: FUND_COLORS.fund, t: 'Тикланиш ва тараққиёт жамғармаси' },
    ].filter((s) => s.v > 0);
    return (
        <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', marginTop: 6, width: 132 }}>
            {segs.map((s, i) => (
                <div key={i} title={`${s.t}: ${fmt1(s.v)} млн $`} style={{ width: `${(s.v / total) * 100}%`, background: s.c }} />
            ))}
        </div>
    );
};

/* Фоиз (факт/режа) ранги */
const pctColor = (p: number): string => (p >= 100 ? GC.green : p >= 80 ? GC.green : p >= 50 ? GC.amber : p > 0 ? GC.amber : GC.slate);

/* Chorak katagi — режа ҳар доим 100% (бутун бар), факт эса режага нисбатан
   бажарилган қисми. Прогрессбар икки алоҳида қийматни эмас, бир бутун
   "режа = 100%" шкаласи ичида фактнинг улушини кўрсатади. */
const QuarterCell: React.FC<{ plan: number; fact: number; color: string }> = ({ plan, fact, color }) => {
    const pct = plan ? (fact / plan) * 100 : (fact > 0 ? 100 : 0);
    const factW = Math.min(pct, 100);
    const over = pct > 100;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 116 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 9.5, color: C.sub }}>реж <b style={{ color: C.text, fontWeight: 600 }}>{fmt1(plan)}</b></span>
                <span style={{ fontSize: 9.5, color: C.sub }}>факт <b style={{ color: fact ? color : C.sub, fontWeight: 700 }}>{fmt1(fact)}</b></span>
            </div>
            <div style={{ position: 'relative', height: 7, borderRadius: 4, background: `${GC.icon}28`, overflow: 'hidden' }}>
                {/* режа = бутун барнинг ўзи (100% база), факт — унинг ичидаги тўлдирма */}
                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${factW}%`, background: color, borderRadius: 4, boxShadow: fact ? `0 0 6px ${GC.icon}88` : 'none' }} />
                {over && <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 3, background: GC.green }} />}
            </div>
            <div style={{ textAlign: 'right', fontSize: 10.5, fontWeight: 700, color: pctColor(pct) }}>{plan ? `${fmt1(pct)}%` : (fact ? `${fmt1(pct)}%` : '—')}</div>
        </div>
    );
};

/* ── Asosiy komponent ── */
const Investing: React.FC = () => {
    useGetAllInvesting();
    const projects = DATA.projects as Project[];
    const execPct = DATA.totals.yearFact / DATA.totals.yearPlan * 100;

    const th: React.CSSProperties = { color: C.sub, fontWeight: 600, padding: '7px 8px', borderBottom: `1px solid ${C.border}` };
    const td: React.CSSProperties = { padding: '9px 8px', borderBottom: `1px solid ${C.border}` };

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ maxWidth: 960 }}>
                    <div style={{ color: GC.cyan, fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{DATA.meta.titleLine1}</div>
                    <div style={{ color: C.text, fontSize: 13.5, fontWeight: 500, lineHeight: 1.35, marginTop: 2 }}>{DATA.meta.titleLine2}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 13px', flexShrink: 0 }}>
                    <NeonIcon color={GC.cyan} size={22}><IconCalendar /></NeonIcon>
                    <div>
                        <div style={{ color: C.text, fontSize: 11.5, fontWeight: 600 }}>{DATA.meta.periodLabel}</div>
                        <div style={{ color: C.sub, fontSize: 10 }}>{DATA.meta.periodRange}</div>
                    </div>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1fr 1fr 1.15fr 2fr', gap: 10, alignItems: 'stretch' }}>
                <KpiCard label="Лойиҳалар сони" value={String(DATA.kpi.projectsCount)} unit="та" icon={<IconFileText />} color={GC.blue} />
                <KpiCard label="Умумий қиймат" value={fmt1(DATA.kpi.totalValue)} unit={DATA.meta.unit} icon={<IconCoinsStack />} color={GC.green} />
                <KpiCard label="2026 йил ўзлаштириш режаси" value={fmt1(DATA.kpi.yearPlan)} unit={DATA.meta.unit} icon={<IconChartBar />} color={GC.amber} />
                <KpiCard label="Факт (август ҳолатига)" value={fmt1(DATA.kpi.yearFact)} unit={DATA.meta.unit} sub={`Йиллик режанинг ${fmt1(execPct)} фоизи бажарилди`} icon={<IconTarget />} color={GC.green} />

                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0 }}>
                    <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Лойиҳалар қиймати манбалари</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                        {DATA.fundingSources.map((f) => <FundingRow key={f.label} item={f as FundingSource} />)}
                    </div>
                </div>
            </div>

            {/* Loyihalar jadvali */}
            <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ color: GC.cyan, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                        Лойиҳалар бўйича ўзлаштириш: режа ва факт (ҳар чоракда) <span style={{ color: C.sub, fontWeight: 400, textTransform: 'none' }}>(2026 йил, {DATA.meta.unit})</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ color: C.sub, fontSize: 10 }}><span style={{ display: 'inline-block', width: 16, height: 7, borderRadius: 3, background: 'rgba(79,179,217,0.30)', marginRight: 4, verticalAlign: 'middle' }} />режа (соя)</span>
                        <span style={{ color: C.sub, fontSize: 10 }}><span style={{ display: 'inline-block', width: 16, height: 7, borderRadius: 3, background: GC.cyan, marginRight: 4, verticalAlign: 'middle' }} />факт (бажарилган)</span>
                        <span style={{ color: C.sub, fontSize: 10 }}>% — факт/режа</span>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 1080 }}>
                        <thead>
                            <tr>
                                <th style={{ ...th, textAlign: 'left', minWidth: 300 }}>Лойиҳа номи ва тавсифи</th>
                                <th style={{ ...th, textAlign: 'right', minWidth: 96 }}>Умумий қиймати</th>
                                <th style={{ ...th, textAlign: 'right', minWidth: 84 }}>2026 йил режаси</th>
                                {DATA.quarterLabels.map((q, i) => (
                                    <th key={q} style={{ ...th, textAlign: 'left', minWidth: 116 }}>
                                        {q}<div style={{ fontWeight: 400, fontSize: 9, color: C.sub }}>{DATA.quarterSubLabels[i]}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ ...td }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <NeonIcon color={p.color} size={30}>{PROJECT_ICONS[p.icon]}</NeonIcon>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                                    <span style={{ color: GC.cyan, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.id}.</span>
                                                    <span style={{ color: C.text, fontWeight: 500 }}>{p.name}</span>
                                                </div>
                                                <div style={{ color: C.sub, fontSize: 9.5, marginTop: 3 }}>
                                                    {p.region} · {p.district} · {p.capacity} · {p.term}
                                                </div>
                                                <FundingSplit f={p.funding} total={p.totalValue} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ ...td, textAlign: 'right', color: C.text, fontWeight: 700 }}>{fmt1(p.totalValue)}</td>
                                    <td style={{ ...td, textAlign: 'right', color: GC.amber, fontWeight: 700 }}>{fmt1(p.yearPlan)}</td>
                                    {p.quartersPlan.map((q, i) => (
                                        <td key={i} style={{ ...td }}>
                                            <QuarterCell plan={q} fact={p.quartersActual[i]} color={DATA.quarterColors[i]} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ borderTop: `2px solid ${C.border}` }}>
                                <td style={{ color: C.text, fontWeight: 800, padding: '11px 8px' }}>ЖАМИ:</td>
                                <td style={{ textAlign: 'right', color: C.text, fontWeight: 800, padding: '11px 8px' }}>{fmt1(DATA.totals.totalValue)}</td>
                                <td style={{ textAlign: 'right', color: GC.amber, fontWeight: 800, padding: '11px 8px' }}>{fmt1(DATA.totals.yearPlan)}</td>
                                {DATA.totals.quartersPlan.map((q, i) => (
                                    <td key={i} style={{ padding: '11px 8px' }}>
                                        <QuarterCell plan={q} fact={DATA.totals.quartersActual[i]} color={DATA.quarterColors[i]} />
                                    </td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Investing;
