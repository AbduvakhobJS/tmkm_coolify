import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText } from '../../components/dashboardUI';
import { useContactHubSummary } from '../../hooks/contactHub';
import demoData from './contactHubDemoData.json';
import { GC, alpha } from '../../theme/palette';

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

const IconBookOpen = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5c-1.6-1.3-3.7-2-6.5-2-1 0-1.5.2-1.5.2v13.3s.5-.2 1.5-.2c2.8 0 4.9.7 6.5 2 1.6-1.3 3.7-2 6.5-2 1 0 1.5.2 1.5.2V4.7s-.5-.2-1.5-.2c-2.8 0-4.9.7-6.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 6.5v13.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconBuilding = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="9" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 7h1.5M11 7h1.5M7 11h1.5M11 11h1.5M7 15h1.5M11 15h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconGlobe = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);
const IconLayers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3.5 12.5l8.5 4.5 8.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconFileLines = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2.5h9l4 4V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h6M9 8h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconCalendarPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6.5 15l2.5-3 2 2 3-4 3.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconStickyNote = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h13l3 3v13H4V4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M17 4v3h3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── API javob turi (situation.uzkmt.uz /api/summary → summary.notebook) — qisqartirilgan ── */

type Notebook = {
    totals: { companies: number; countries: number; directions: number; files: number; meetings: number; meetingsPlanned: number; meetingsDone: number; meetingsOverdue: number };
    notes: { id: number; title: string; content: string; color: string }[];
    meetings: { upcoming: { id: number; time: string; title: string; company: string; status: string }[] };
    charts: {
        countries: { label: string; count: number; color: string }[];
        directions: { label: string; count: number; color: string }[];
    };
};

const NOTE_COLORS: Record<string, string> = { sky: GC.blue, amber: GC.amber, green: GC.green, pink: GC.magenta, purple: GC.violet };
const MEETING_STATUS_COLOR: Record<string, string> = { 'Проведено': GC.green, 'Запланировано': GC.blue, 'Перенесено': GC.amber, 'Отменено': C.down };

const DEMO = demoData as unknown as Notebook;

const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = GC.cyan, hint, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: GC.cyan, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7 }}>
                {icon && <NeonIcon color={iconColor} size={20}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{hint}</div>}
        </div>
        {children}
    </div>
);

const ProgressRow: React.FC<{ name: string; value: number; max: number; color: string }> = ({ name, value, max, color }) => (
    <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 2 }}>
            <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }} title={name}>{name}</span>
            <span style={{ color: C.sub, fontWeight: 700, flexShrink: 0 }}>{value}</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 2, boxShadow: `0 0 5px ${GC.icon}88` }} />
        </div>
    </div>
);

const ContactHub: React.FC = () => {
    const navigate = useNavigate();
    const { data, isSuccess } = useContactHubSummary();

    const liveNB: Notebook | undefined = data?.data?.payload?.summary?.notebook;
    const isLive = isSuccess && !!liveNB;
    const NB: Notebook = liveNB ?? DEMO;

    const topCountries = useMemo(() => [...NB.charts.countries].sort((a, b) => b.count - a.count).slice(0, 6), [NB]);
    const countriesTotal = NB.totals.companies;
    const maxDirection = Math.max(...NB.charts.directions.map((d) => d.count), 1);
    const firstUpcoming = NB.meetings.upcoming[0];

    const countriesDonut = useMemo(() => ({
        labels: topCountries.map((c) => c.label),
        datasets: [{ data: topCountries.map((c) => c.count), backgroundColor: topCountries.map((c) => c.color), borderColor: C.card, borderWidth: 2 }],
    }), [topCountries]);

    const meetingsLine = useMemo(() => ({
        labels: ['План', 'Пров.', 'Просроч.', 'Ближ.', 'Всего'],
        datasets: [{
            data: [NB.totals.meetingsPlanned, NB.totals.meetingsDone, NB.totals.meetingsOverdue, NB.meetings.upcoming.length, NB.totals.meetings],
            borderColor: GC.cyan, backgroundColor: alpha(GC.cyan, 0.13), borderWidth: 2, tension: 0.35, fill: true,
            pointRadius: 4,
            pointBackgroundColor: [GC.blue, GC.green, C.down, GC.amber, GC.cyan],
        }],
    }), [NB]);

    const meetingsLineOptions = {
        ...chartBase, ...noLegend,
        scales: {
            x: { grid: { display: false }, ticks: { color: C.sub, font: { size: 9.5 } } },
            y: { display: false },
        },
    } as any;

    return (
        <div style={{ background: C.bg,  display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
            <div style={{ width: '100%',  background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Sarlavha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <NeonIcon color={GC.cyan} size={32}><IconBookOpen /></NeonIcon>
                        <div style={{ color: GC.cyan, fontSize: 15, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>ContactHub</div>
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontWeight: 700, marginLeft: 4,
                            color: isLive ? GC.green : GC.amber, background: isLive ? alpha(GC.green, 0.09) : alpha(GC.amber, 0.09),
                            border: `1px solid ${isLive ? alpha(GC.green, 0.27) : alpha(GC.amber, 0.27)}`, borderRadius: 999, padding: '2px 8px',
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isLive ? GC.green : GC.amber }} />
                            {isLive ? 'Живые данные' : 'Демо'}
                        </span>
                    </div>
                    <button
                        onClick={() => navigate('/main/contact-hub-detail')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                            background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, border: 'none', borderRadius: 999,
                            color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '5px 11px',
                            boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                        Подробнее<IconArrowRight />
                    </button>
                </div>

                {/* KPI qatori */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[
                        { label: 'Всего компаний', value: NB.totals.companies, icon: <IconBuilding />, color: GC.cyan },
                        { label: 'Стран', value: NB.totals.countries, icon: <IconGlobe />, color: GC.blue },
                        { label: 'Сфер деятельности', value: NB.totals.directions, icon: <IconLayers />, color: GC.violet },
                        { label: 'Карточек с файлами', value: NB.totals.files, icon: <IconFileLines />, color: GC.cyan },
                    ].map((k) => (
                        <div key={k.label} style={{ minWidth: 0, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <NeonIcon color={k.color} size={26}>{k.icon}</NeonIcon>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</div>
                                <div style={{ color: C.text, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{k.value.toLocaleString('ru-RU')}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inostrannaya baza / uchrashuvlar dinamikasi */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                    <SectionCard title="Иностранная база" icon={<IconGlobe />}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                                <Doughnut data={countriesDonut} options={donutOptions} plugins={[centerText(String(countriesTotal), 'контактов')]} />
                            </div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 8px', minWidth: 0 }}>
                                {topCountries.map((c) => (
                                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', fontSize: 10.5, minWidth: 0 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, marginRight: 5, flexShrink: 0, boxShadow: `0 0 4px ${c.color}` }} />
                                        <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                                        <span style={{ color: C.sub, fontWeight: 700, marginLeft: 4 }}>{c.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Встречи / динамика" icon={<IconCalendarPulse />}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                            <span style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>{NB.totals.meetings}</span>
                            <span style={{ color: C.sub, fontSize: 10 }}>встреч всего</span>
                        </div>
                        <div style={{ height: 68 }}>
                            <Line data={meetingsLine} options={meetingsLineOptions} />
                        </div>
                        {firstUpcoming && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}`, fontSize: 10.5 }}>
                                <div>
                                    <span style={{ color: C.sub }}>{firstUpcoming.time}</span>
                                    <span style={{ color: C.text, marginLeft: 6 }}>{firstUpcoming.title}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>{firstUpcoming.company}</span>
                                </div>
                                <span style={{ color: MEETING_STATUS_COLOR[firstUpcoming.status] ?? C.sub, fontWeight: 700, flexShrink: 0 }}>{firstUpcoming.status}</span>
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Sferalar / zametkalar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                    <SectionCard title="Сферы деятельности" icon={<IconLayers />}>
                        {NB.charts.directions.slice(0, 7).map((d, idx) => (
                            <ProgressRow key={`${d.label}-${idx}`} name={d.label} value={d.count} max={maxDirection} color={d.color} />
                        ))}
                    </SectionCard>

                    <SectionCard title="Заметки / события" icon={<IconStickyNote />}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {NB.notes.map((n) => {
                                const color = NOTE_COLORS[n.color] ?? GC.amber;
                                return (
                                    <div key={n.id} style={{ background: `${GC.icon}18`, border: `1px solid ${GC.icon}44`, borderRadius: 10, padding: '8px 10px', minWidth: 0 }}>
                                        <div style={{ color, fontSize: 11.5, fontWeight: 700, marginBottom: 2 }}>{n.title}</div>
                                        <div style={{ color: C.sub, fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default ContactHub;
