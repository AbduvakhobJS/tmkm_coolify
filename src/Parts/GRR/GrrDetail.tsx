import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText, fmt } from '../../components/dashboardUI';
import grrDetail from './grrDetailData.json';
import { GC } from '../../theme/palette';

/* ── Neon ikonka (dizayn tizimiga mos, gradient + glow) ── */
const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: size >= 40 ? 12 : 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${GC.icon}33, ${GC.icon}0a)`,
        border: `1px solid ${GC.icon}55`,
        boxShadow: `0 0 10px ${GC.icon}55, inset 0 0 6px ${GC.icon}22`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

/* ── Ikonkalar ── */
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9l-5.6 3.1 1.4-6.2-4.8-4.3 6.4-.6L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconWarning = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4l9 16H3L12 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconScale = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v18M7 21h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7h6M14 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7l-2.5 5A2.5 2.5 0 004 15a2.5 2.5 0 002.5-3L4 7zM20 7l-2.5 5A2.5 2.5 0 0020 15a2.5 2.5 0 002.5-3L20 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconShieldCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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
    star: <IconStar />, warning: <IconWarning />, scale: <IconScale />,
};

/* ── Sparkline (KPI plitkalari uchun kichik trend chizig'i) ── */
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const w = 64, h = 16;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / range) * h]);
    const points = pts.map((p) => p.join(',')).join(' ');
    const [lx, ly] = pts[pts.length - 1];
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <circle cx={lx} cy={ly} r="2" fill={color} />
        </svg>
    );
};

/* ── Bo'lim kartochkasi — rasmdagidek: sarlavha faqat rangli matn, ikonkasiz ── */
const SectionCard: React.FC<{
    title: string; hint?: string;
    children: React.ReactNode; style?: React.CSSProperties; bodyStyle?: React.CSSProperties;
}> = ({ title, hint, children, style, bodyStyle }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, ...style }}>
        {title && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexShrink: 0 }}>
                <div style={{ color: GC.cyan, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{title}</div>
                {hint && <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.3 }}>{hint}</div>}
            </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, ...bodyStyle }}>
            {children}
        </div>
    </div>
);

/* Donut legendasi uchun kvadrat rang belgisi (rasmdagidek) */
const LegendSquare: React.FC<{ color: string }> = ({ color }) => (
    <span style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0, boxShadow: `0 0 6px ${GC.icon}55` }} />
);

const RISK_COLORS: Record<string, string> = { low: GC.green, medium: GC.amber, high: GC.red };
const readinessColor = (v: number) => (v >= 60 ? C.up : v >= 40 ? GC.amber : C.down);

const GrrDetail: React.FC = () => {
    const { meta, kpis, priorityProjects, portfolioStructure, valueIndicators, resourceDistribution, averageContent, keyFindings, overallStatus } = grrDetail;

    const structureTotal = portfolioStructure.reduce((s, p) => s + p.count, 0);
    const structureDonut = {
        labels: portfolioStructure.map((p) => p.label),
        datasets: [{ data: portfolioStructure.map((p) => p.count), backgroundColor: portfolioStructure.map((p) => p.color), borderColor: C.card, borderWidth: 2 }],
    };
    const resourceDonut = {
        labels: resourceDistribution.map((r) => r.label),
        datasets: [{ data: resourceDistribution.map((r) => r.pct), backgroundColor: resourceDistribution.map((r) => r.color), borderColor: C.card, borderWidth: 2 }],
    };
    const contentBar = {
        labels: averageContent.map((c) => c.label),
        datasets: [{ data: averageContent.map((c) => c.value), backgroundColor: C.up, borderRadius: 4, barPercentage: 0.5, categoryPercentage: 0.6 }],
    };
    const contentLabelPlugin = {
        id: 'contentValueLabel',
        afterDatasetsDraw(chart: any) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            meta.data.forEach((el: any, idx: number) => {
                const v = chart.data.datasets[0].data[idx] as number;
                ctx.save();
                ctx.fillStyle = C.text;
                ctx.font = '700 11px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${fmt(v, 2)}%`, el.x, el.y - 8);
                ctx.restore();
            });
        },
    };

    return (
        <div style={{ background: C.bg, width: '100%', height: '100%', minHeight: 0, overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color={GC.cyan} size={36}><IconLayers /></NeonIcon>
                    <div>
                        <div style={{ color: GC.cyan, fontSize: 18, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{meta.title}</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{meta.subtitle}</div>
                    </div>
                </div>
                <span style={{ color: C.sub, fontSize: 11 }}>{meta.dateRange}</span>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, flexShrink: 0 }}>
                {kpis.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <NeonIcon color={GC.cyan} size={30}>{ICON_MAP[k.icon]}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase', lineHeight: 1.25 }}>{k.label}</span>
                        </div>
                        <div style={{ color: C.text, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
                        <Sparkline data={k.trend} color={GC.cyan} />
                    </div>
                ))}
            </div>

            {/* Qator 2: ustuvor loyihalar / portfel tuzilmasi / qiymat ko'rsatkichlari */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 8, minHeight: 230 }}>
                <SectionCard title="Приоритетные проекты" hint="Готовность">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, minHeight: 0 }}>
                        {priorityProjects.map((p) => (
                            <div key={p.num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)', color: GC.cyan, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.num}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                                        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                                        <span style={{ color: C.text, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{p.readiness}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                                        <div style={{ width: `${p.readiness}%`, height: '100%', background: readinessColor(p.readiness), borderRadius: 3 }} />
                                    </div>
                                </div>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLORS[p.risk], boxShadow: `0 0 5px ${RISK_COLORS[p.risk]}`, flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: GC.cyan, fontSize: 10.5, fontWeight: 600, paddingTop: 8, marginTop: 6, borderTop: `1px solid ${C.border}`, cursor: 'pointer', flexShrink: 0 }}>
                        Смотреть все проекты <IconArrowRight />
                    </div>
                </SectionCard>

                <SectionCard title="Структура портфеля">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 118, height: 118, flexShrink: 0 }}>
                            <Doughnut data={structureDonut} options={{ ...chartBase, cutout: '62%', ...noLegend } as any} plugins={[centerText(`${structureTotal}`, 'проектов')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                            {portfolioStructure.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11 }}>
                                    <LegendSquare color={s.color} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                    <span style={{ color: C.text, fontWeight: 700 }}>{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Ключевые показатели ценности">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, flex: 1 }}>
                        {valueIndicators.map((v) => (
                            <div key={v.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                                <NeonIcon color={v.color} size={22}>{ICON_MAP[v.icon]}</NeonIcon>
                                <div style={{ color: C.sub, fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.2, lineHeight: 1.2 }}>{v.label}</div>
                                <div style={{ color: v.label.includes('РИСК') ? v.color : C.text, fontSize: 13, fontWeight: 700 }}>{v.value}</div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Qator 3: resurslar guruhlari / o'rtacha tarkib / xulosalar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, minHeight: 220 }}>
                <SectionCard title="Ресурсы по группам">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 108, height: 108, flexShrink: 0 }}>
                            <Doughnut data={resourceDonut} options={{ ...chartBase, cutout: '60%', ...noLegend } as any} plugins={[centerText('100%', 'ресурсы')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                            {resourceDistribution.map((r) => (
                                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5 }}>
                                    <LegendSquare color={r.color} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{r.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Средние содержания">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={contentBar} options={{ ...chartBase, ...noLegend, scales: { x: { display: false }, y: { display: false, beginAtZero: true } } } as any} plugins={[contentLabelPlugin]} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', gap: 6, marginTop: 6, flexShrink: 0 }}>
                        {averageContent.map((c) => (
                            <span key={c.label} style={{
                                color: c.color, fontSize: 10.5, fontWeight: 700, padding: '3px 10px',
                                borderRadius: 5, border: `1px solid ${c.color}`, background: `${c.color}18`,
                            }}>
                                {c.label}
                            </span>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Ключевые выводы и риски">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {keyFindings.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                <NeonIcon color={f.color} size={24}>{ICON_MAP[f.icon]}</NeonIcon>
                                <div style={{ color: C.text, fontSize: 11, lineHeight: 1.4, paddingTop: 2 }}>{f.text}</div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Umumiy status paneli */}
            <div style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                background: `linear-gradient(90deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02)),
                    radial-gradient(rgba(34,197,94,0.35) 1px, transparent 1px)`,
                backgroundSize: 'auto, 14px 14px',
                border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '14px 20px',
            }}>
                <NeonIcon color={C.up} size={30}><IconShieldCheck /></NeonIcon>
                <span style={{ color: C.sub, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{overallStatus.label}:</span>
                <span style={{ color: C.up, fontSize: 17, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{overallStatus.value}</span>
            </div>
        </div>
    );
};

export default GrrDetail;
