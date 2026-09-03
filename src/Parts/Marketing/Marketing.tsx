import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';

/* ── Neon ikonkalar (dizayn tizimiga mos, gradient + glow) ── */

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

const IconBarChart = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconGlobe = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const IconTrendUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconShield = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconLeaf = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 19c8 0 14-6 14-14 0 0-11-2-14 7-1.6 4.9 0 7 0 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M5 19c0-4 2-7 6-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const IconCheckCircle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 12.3l2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconLinkedIn = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.4a1.96 1.96 0 100 3.92 1.96 1.96 0 000-3.92zM20.5 20h-3.37v-5.93c0-1.41-.03-3.23-1.97-3.23-1.98 0-2.28 1.55-2.28 3.13V20H9.5V8.5h3.24v1.57h.05c.45-.86 1.56-1.76 3.2-1.76 3.42 0 4.05 2.25 4.05 5.18V20z" />
    </svg>
);

const IconTelegram = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.5 3.5L2.7 10.9c-1.1.45-1.1 1.08-.2 1.36l4.8 1.5 1.8 5.7c.22.6.38.85.78.85.3 0 .44-.14.6-.3l2.6-2.5 4.9 3.6c.66.37 1.13.18 1.3-.6l3.4-15.9c.24-1.08-.42-1.6-1.2-1.16z" />
    </svg>
);

const IconYouTube = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.5 9.3v5.4l4.8-2.7z" />
    </svg>
);

const IconInstagram = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
);

/* ── Mock ma'lumotlar (Marketing / бренд / PR / инвесторы — qisqa ko'rinish) ── */

const KPI_ITEMS = [
    { label: 'Индекс репутации', value: '78.4', delta: '▲ 5.2' },
    { label: 'Тональность', value: '68%', delta: 'позитив' },
    { label: 'Медиаохват', value: '256M', delta: '▲ 15.4%' },
    { label: 'Трафик сайта', value: '128K', delta: '▲ 12.4%' },
];

const SOCIAL = [
    { label: 'LinkedIn', value: '45.2K', icon: <IconLinkedIn />, color: GC.blue },
    { label: 'Telegram', value: '38.7K', icon: <IconTelegram />, color: GC.blue },
    { label: 'YouTube', value: '22.1K', icon: <IconYouTube />, color: GC.red },
    { label: 'Instagram', value: '18.6K', icon: <IconInstagram />, color: GC.magenta },
];

const FUNNEL = [
    { label: 'Лиды инвесторов', value: '156', width: 100 },
    { label: 'Due diligence', value: '78', width: 78 },
    { label: 'NDA signed', value: '42', width: 56 },
    { label: 'MOU', value: '24', width: 38 },
];

const RISKS = [
    { label: 'Репутационные', value: 3, color: GC.amber },
    { label: 'Медиа-инциденты', value: 2, color: GC.blue },
    { label: 'Fake News', value: 1, color: C.down },
];

const CHECKLIST = [
    'Международная узнаваемость растёт',
    'Инвесторский интерес устойчив',
];

const HeaderRow: React.FC<{ icon: React.ReactNode; title: string; color?: string }> = ({ icon, title, color = GC.cyan }) => (
    <div style={{ color, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <NeonIcon color={color} size={24}>{icon}</NeonIcon>{title}
    </div>
);

const SectionCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        {children}
    </div>
);

const Marketing: React.FC = () => {
    const navigate = useNavigate();
    const totalRisk = RISKS.reduce((s, r) => s + r.value, 0);

    const riskDonut = {
        labels: RISKS.map((r) => r.label),
        datasets: [{ data: RISKS.map((r) => r.value), backgroundColor: RISKS.map((r) => r.color), borderColor: C.cardAlt, borderWidth: 2 }],
    };
    const donutOptions = { ...chartBase, cutout: '70%', ...noLegend } as any;

    return (
        <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
            <div style={{ width: '100%',  background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Sarlavha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <NeonIcon color={GC.blue} size={36}><IconBarChart /></NeonIcon>
                        <div>
                            <div style={{ color: GC.cyan, fontSize: 15, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Маркетинг</div>
                            <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 }}>Ключевые показатели</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.up, fontSize: 10 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.up }} />Системы в норме
                        </span>
                        <button
                            onClick={() => navigate('/main/marketing-detail')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                                background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, border: 'none', borderRadius: 999,
                                color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '5px 11px',
                                boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                        >
                            Подробнее
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* KPI qatori */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {KPI_ITEMS.map((k) => (
                        <div key={k.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 8px', minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</div>
                            <div style={{ color: C.text, fontSize: 16, fontWeight: 700, marginTop: 2 }}>{k.value}</div>
                            <div style={{ color: C.up, fontSize: 9, marginTop: 1 }}>{k.delta}</div>
                        </div>
                    ))}
                </div>

                {/* Cifrovoy brend / Investorlar / Xavflar — bitta qatorda */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, alignItems: 'stretch' }}>

                    <SectionCard style={{ height: 300 }}>
                        <HeaderRow icon={<IconGlobe />} title="Цифровой бренд" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1 }}>
                            {SOCIAL.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <NeonIcon color={s.color}>{s.icon}</NeonIcon>
                                    <div>
                                        <div style={{ color: C.text, fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{s.value}</div>
                                        <div style={{ color: C.sub, fontSize: 10.5 }}>{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>Вовлечённость</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>6.4% <span style={{ color: C.up, fontWeight: 400 }}>▲ 1.2 п.п.</span></span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>Упоминания в мире</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>18.7K <span style={{ color: C.up, fontWeight: 400 }}>▲ 8.1%</span></span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard style={{ height: 300 }}>
                        <HeaderRow icon={<IconTrendUp />} title="Инвесторы и мероприятия" />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginBottom: 8 }}>
                            {FUNNEL.map((f) => (
                                <div key={f.label} style={{ width: `${f.width}%`, height: 16, borderRadius: 3, background: `linear-gradient(90deg, #1e4d7b, ${GC.cyan})`, boxShadow: '0 0 8px rgba(14,168,199,0.35)' }} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', flex: 1 }}>
                            {FUNNEL.map((f) => (
                                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                    <span style={{ color: C.sub }}>{f.label}</span>
                                    <span style={{ color: C.text, fontWeight: 700 }}>{f.value}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard style={{ height: 300 }}>
                        <HeaderRow icon={<IconShield />} title="Риски и кризисные коммуникации" />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
                            <div style={{ width: 96, height: 96, flexShrink: 0 }}>
                                <Doughnut data={riskDonut} options={donutOptions} plugins={[centerText(String(totalRisk), '')]} />
                            </div>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                                {RISKS.map((r) => (
                                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', fontSize: 11 }} title={r.label}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, marginRight: 5, flexShrink: 0, boxShadow: `0 0 5px ${r.color}` }} />
                                        <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
                                        <span style={{ color: C.sub, fontWeight: 600 }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* ESG va yakuniy xulosa */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <SectionCard>
                        <HeaderRow icon={<IconLeaf />} title="ESG" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>ESG Score</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>A−</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>Safety / LTIFR</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>0.45</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>Комплаенс</span>
                                <span style={{ color: C.up, fontWeight: 700 }}>100%</span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <HeaderRow icon={<IconCheckCircle />} title="Итог" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
                            {CHECKLIST.map((c) => (
                                <div key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 10.5, color: C.text }}>
                                    <span style={{ color: C.up, flexShrink: 0 }}>✓</span>{c}
                                </div>
                            ))}
                        </div>
                        <div style={{ background: `${C.up}18`, border: `1px solid ${C.up}44`, borderRadius: 8, padding: '6px 8px', color: C.up, fontSize: 10.5, fontWeight: 700, textAlign: 'center' }}>
                            Статус: удовлетворительно
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
