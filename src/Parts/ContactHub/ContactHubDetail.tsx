import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
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

const IconBuilding = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
const IconCalendarDays = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconClock = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCheckCircle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 12.3l2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 9.5v4.2M12 16.7h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconStickyNote = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4h13l3 3v13H4V4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M17 4v3h3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);
const IconExternalLink = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6H5.5A1.5 1.5 0 004 7.5v11A1.5 1.5 0 005.5 20h11a1.5 1.5 0 001.5-1.5V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 4h6v6M20 4l-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconListTodo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4.8 6.5l.9.9L7.4 5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3.5" y="15" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11.5 6.5h9M11.5 17.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconBell = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 18.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);

/* ── API javob turi (situation.uzkmt.uz /api/summary → summary.notebook) ── */

type Notebook = {
    ok: boolean;
    service: string;
    domain: string;
    generatedAt: string;
    totals: {
        companies: number; countries: number; directions: number; files: number;
        meetings: number; meetingsPlanned: number; meetingsDone: number; meetingsOverdue: number;
        notes: number; users: number; pendingSubmissions: number;
    };
    cards: { label: string; value: number; icon: string }[];
    tasks: [string, string, string][];
    reminders: [string, string, string][];
    notes: { id: number; title: string; content: string; color: string; pinned: boolean; createdAt: string; updatedAt: string }[];
    meetings: {
        upcoming: { id: number; date: string; time: string; dateLabel: string; title: string; company: string; meetingWith: string; place: string; status: string; assigned: string }[];
        recent: { id: number; date: string; time: string; dateLabel: string; title: string; company: string; meetingWith: string; place: string; status: string; assigned: string }[];
    };
    foreign: {
        totalCompanies: number;
        latestCompanies: { id: number; name: string; country: string; direction: string; updatedAt: string }[];
    };
    charts: {
        countries: { label: string; count: number; color: string }[];
        directions: { label: string; count: number; color: string }[];
        categories: { label: string; count: number; color: string }[];
        meetingStatuses: { label: string; count: number; color: string }[];
    };
};

const CARD_ICON: Record<string, React.ReactNode> = {
    building: <IconBuilding />,
    globe: <IconGlobe />,
    'layer-group': <IconLayers />,
    'file-lines': <IconFileLines />,
    'calendar-days': <IconCalendarDays />,
    clock: <IconClock />,
    'circle-check': <IconCheckCircle />,
    'triangle-exclamation': <IconAlertTriangle />,
};
const CARD_COLOR: Record<string, string> = {
    building: GC.cyan,
    globe: GC.blue,
    'layer-group': GC.violet,
    'file-lines': GC.cyan,
    'calendar-days': GC.green,
    clock: GC.amber,
    'circle-check': GC.green,
    'triangle-exclamation': C.down,
};

const NOTE_COLORS: Record<string, string> = { sky: GC.blue, amber: GC.amber, green: GC.green, pink: GC.magenta, purple: GC.violet };

const DEMO: Notebook = demoData as unknown as Notebook;

/* ── Yordamchi komponentlar ── */

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = GC.cyan, hint, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: GC.cyan, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        {children}
    </div>
);

const ProgressRow: React.FC<{ name: string; value: number; max: number; color: string }> = ({ name, value, max, color }) => (
    <div style={{ marginBottom: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 2 }}>
            <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }} title={name}>{name}</span>
            <span style={{ color: C.sub, fontWeight: 700, flexShrink: 0 }}>{value}</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, boxShadow: `0 0 5px ${GC.icon}88` }} />
        </div>
    </div>
);

const StatTile: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = C.text }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0 }}>
        <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ color, fontSize: 15, fontWeight: 700, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
);

const PRIORITY_COLOR: Record<string, string> = { 'Высокий': C.down, 'Средний': GC.amber, 'Низкий': GC.green };
const MEETING_STATUS_COLOR: Record<string, string> = { 'Проведено': GC.green, 'Запланировано': GC.blue, 'Перенесено': GC.amber, 'Отменено': C.down };

const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

const ContactHubDetail: React.FC = () => {
    const { data, isSuccess } = useContactHubSummary();
    const [now] = useState(() => new Date());

    const liveNotebook: Notebook | undefined = data?.data?.payload?.summary?.notebook;
    const isLive = isSuccess && !!liveNotebook;
    const NB: Notebook = liveNotebook ?? DEMO;

    const maxCountry = Math.max(...NB.charts.countries.map((c) => c.count), 1);
    const maxDirection = Math.max(...NB.charts.directions.map((c) => c.count), 1);
    const categoriesTotal = NB.charts.categories.reduce((s, c) => s + c.count, 0);
    const meetingsTotal = NB.charts.meetingStatuses.reduce((s, c) => s + c.count, 0);

    const categoriesDonut = useMemo(() => ({
        labels: NB.charts.categories.map((c) => c.label),
        datasets: [{ data: NB.charts.categories.map((c) => c.count), backgroundColor: NB.charts.categories.map((c) => c.color), borderColor: C.card, borderWidth: 2 }],
    }), [NB]);
    const meetingsDonut = useMemo(() => ({
        labels: NB.charts.meetingStatuses.map((c) => c.label),
        datasets: [{ data: NB.charts.meetingStatuses.map((c) => c.count), backgroundColor: NB.charts.meetingStatuses.map((c) => c.color), borderColor: C.card, borderWidth: 2 }],
    }), [NB]);

    const apiFields: { key: string; value: string; tag: string }[] = [
        { key: 'ok', value: String(NB.ok), tag: 'значение' },
        { key: 'service', value: NB.service, tag: 'значение' },
        { key: 'domain', value: NB.domain, tag: 'значение' },
        { key: 'generatedAt', value: NB.generatedAt, tag: 'значение' },
        { key: 'totals', value: String(Object.keys(NB.totals).length), tag: 'полей' },
        { key: 'totals.companies', value: String(NB.totals.companies), tag: 'значение' },
        { key: 'totals.countries', value: String(NB.totals.countries), tag: 'значение' },
        { key: 'totals.directions', value: String(NB.totals.directions), tag: 'значение' },
        { key: 'totals.files', value: String(NB.totals.files), tag: 'значение' },
        { key: 'totals.meetings', value: String(NB.totals.meetings), tag: 'значение' },
        { key: 'totals.meetingsPlanned', value: String(NB.totals.meetingsPlanned), tag: 'значение' },
        { key: 'totals.meetingsDone', value: String(NB.totals.meetingsDone), tag: 'значение' },
        { key: 'totals.meetingsOverdue', value: String(NB.totals.meetingsOverdue), tag: 'значение' },
        { key: 'totals.notes', value: String(NB.totals.notes), tag: 'значение' },
        { key: 'totals.users', value: String(NB.totals.users), tag: 'значение' },
        { key: 'cards', value: String(NB.cards.length), tag: 'массив' },
        { key: 'cards[0]', value: String(Object.keys(NB.cards[0] ?? {}).length), tag: 'полей' },
        { key: 'tasks', value: String(NB.tasks.length), tag: 'массив' },
        { key: 'reminders', value: String(NB.reminders.length), tag: 'массив' },
        { key: 'notes', value: String(NB.notes.length), tag: 'массив' },
        { key: 'meetings.upcoming', value: String(NB.meetings.upcoming.length), tag: 'массив' },
        { key: 'meetings.recent', value: String(NB.meetings.recent.length), tag: 'массив' },
        { key: 'foreign.latestCompanies', value: String(NB.foreign.latestCompanies.length), tag: 'массив' },
        { key: 'charts.countries', value: String(NB.charts.countries.length), tag: 'массив' },
        { key: 'charts.categories', value: String(NB.charts.categories.length), tag: 'массив' },
    ];

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color={GC.cyan} size={36}><IconGlobe /></NeonIcon>
                    <div>
                        <div style={{ color: GC.cyan, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Notebook · Контакты и встречи</div>
                        <div style={{ color: C.text, fontSize: 19, fontWeight: 700, textTransform: 'uppercase', marginTop: 1 }}>ContactHub / Международные контакты</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2, maxWidth: 620 }}>
                            Детализация базы международных контактов: компании, страны, направления, категории, встречи, задачи, файлы и заметки.
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <a
                        href={`https://${NB.domain}`} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: GC.cyan, fontSize: 11, textDecoration: 'none' }}
                    >
                        <IconExternalLink />Перейти на источник
                    </a>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                        color: isLive ? GC.green : GC.amber, background: isLive ? alpha(GC.green, 0.09) : alpha(GC.amber, 0.09),
                        border: `1px solid ${isLive ? alpha(GC.green, 0.27) : alpha(GC.amber, 0.27)}`, borderRadius: 999, padding: '3px 11px',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? GC.green : GC.amber, boxShadow: `0 0 6px ${isLive ? GC.green : GC.amber}` }} />
                        {isLive ? 'Живые данные API' : 'Демо-данные'}
                    </span>
                    <span style={{ color: C.sub, fontSize: 11 }}>{now.toLocaleDateString('ru-RU')}, {now.toLocaleTimeString('ru-RU').slice(0, 5)}</span>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {NB.cards.map((c) => {
                    const color = CARD_COLOR[c.icon] ?? GC.cyan;
                    return (
                        <div key={c.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <NeonIcon color={color} size={22}>{CARD_ICON[c.icon] ?? <IconBuilding />}</NeonIcon>
                                <span style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                            </div>
                            <div style={{ color, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{c.value.toLocaleString('ru-RU')}</div>
                        </div>
                    );
                })}
            </div>

            {/* 1-qator: mamlakatlar / yo'nalishlar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Страны в базе контактов" icon={<IconGlobe />} hint={`${NB.charts.countries.length} стран`}>
                    {NB.charts.countries.map((c, idx) => (
                        <ProgressRow key={`${c.label}-${idx}`} name={c.label} value={c.count} max={maxCountry} color={c.color} />
                    ))}
                </SectionCard>

                <SectionCard title="Направления деятельности" icon={<IconLayers />} hint={`${NB.charts.directions.length} направлений`}>
                    {NB.charts.directions.map((d, idx) => (
                        <ProgressRow key={`${d.label}-${idx}`} name={d.label} value={d.count} max={maxDirection} color={d.color} />
                    ))}
                </SectionCard>
            </div>

            {/* 2-qator: kategoriyalar / uchrashuv statuslari */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Категории компаний" icon={<IconLayers />} hint="категории">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 108, height: 108, flexShrink: 0 }}>
                            <Doughnut data={categoriesDonut} options={donutOptions} plugins={[centerText(String(categoriesTotal), 'компаний')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                            {NB.charts.categories.map((c, idx) => (
                                <div key={`${c.label}-${idx}`} style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }} title={c.label}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 6, flexShrink: 0, boxShadow: `0 0 5px ${c.color}` }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 600 }}>{c.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Статусы встреч" icon={<IconCalendarDays />} hint="calendar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 108, height: 108, flexShrink: 0 }}>
                            <Doughnut data={meetingsDonut} options={donutOptions} plugins={[centerText(String(meetingsTotal), 'встреч')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            {NB.charts.meetingStatuses.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 12.5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 6, flexShrink: 0, boxShadow: `0 0 5px ${s.color}` }} />
                                    <span style={{ color: C.text, flex: 1 }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 700 }}>{s.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Sводка ContactHub */}
            <SectionCard title="Сводка ContactHub" icon={<IconBuilding />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    <StatTile label="Компаний" value={NB.totals.companies} />
                    <StatTile label="Стран" value={NB.totals.countries} />
                    <StatTile label="Сфер деятельности" value={NB.totals.directions} />
                    <StatTile label="Файлов" value={NB.totals.files} />
                    <StatTile label="Встреч всего" value={NB.totals.meetings} />
                    <StatTile label="Проведено встреч" value={NB.totals.meetingsDone} color={GC.green} />
                    <StatTile label="Запланировано" value={NB.totals.meetingsPlanned} color={GC.blue} />
                    <StatTile label="Просрочено" value={NB.totals.meetingsOverdue} color={C.down} />
                    <StatTile label="Заметки" value={NB.totals.notes} />
                    <StatTile label="Пользователи" value={NB.totals.users} />
                    <StatTile label="Заявки" value={NB.totals.pendingSubmissions} />
                </div>
            </SectionCard>

            {/* Oxirgi kompaniyalar */}
            <SectionCard title="Последние компании" icon={<IconBuilding />}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ color: C.sub, textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Компания</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Страна</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Направление</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Обновлено</th>
                        </tr>
                    </thead>
                    <tbody>
                        {NB.foreign.latestCompanies.map((c) => (
                            <tr key={c.id} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '6px 6px', color: C.text }}>{c.name}</td>
                                <td style={{ padding: '6px 6px', color: C.sub }}>{c.country}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{c.direction}</td>
                                <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right', whiteSpace: 'nowrap' }}>{c.updatedAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>

            {/* Ikki ustunli: kalendar va oxirgi uchrashuvlar */}
            <SectionCard title="Ближайшие встречи" icon={<IconCalendarDays />}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ color: C.sub, textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Дата / время</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Тема</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Компания / место</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {NB.meetings.upcoming.map((m) => (
                            <tr key={m.id} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '6px 6px', color: C.sub, whiteSpace: 'nowrap' }}>{m.dateLabel}, {m.time}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{m.title}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{m.company}{m.place && m.place !== m.meetingWith ? ` · ${m.place}` : ''}</td>
                                <td style={{ padding: '6px 6px', textAlign: 'right' }}>
                                    <span style={{ color: MEETING_STATUS_COLOR[m.status] ?? C.sub, background: `${MEETING_STATUS_COLOR[m.status] ?? C.sub}18`, border: `1px solid ${MEETING_STATUS_COLOR[m.status] ?? C.sub}44`, borderRadius: 999, padding: '2px 9px', fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>

            <SectionCard title="Недавние встречи" icon={<IconClock />}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ color: C.sub, textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Дата</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Тема</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Компания</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Итог</th>
                        </tr>
                    </thead>
                    <tbody>
                        {NB.meetings.recent.map((m) => (
                            <tr key={m.id} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '6px 6px', color: C.sub, whiteSpace: 'nowrap' }}>{m.dateLabel}, {m.time}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{m.title}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{m.company}</td>
                                <td style={{ padding: '6px 6px', textAlign: 'right' }}>
                                    <span style={{ color: MEETING_STATUS_COLOR[m.status] ?? C.sub, background: `${MEETING_STATUS_COLOR[m.status] ?? C.sub}18`, border: `1px solid ${MEETING_STATUS_COLOR[m.status] ?? C.sub}44`, borderRadius: 999, padding: '2px 9px', fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>

            {/* Задачи / Напоминания */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Задачи" icon={<IconListTodo />}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Задача</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Приоритет</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Количество</th>
                            </tr>
                        </thead>
                        <tbody>
                            {NB.tasks.map(([label, priority, count], idx) => (
                                <tr key={idx} style={{ borderTop: `1px solid ${C.border}` }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text }}>{label}</td>
                                    <td style={{ padding: '6px 6px' }}>
                                        <span style={{ color: PRIORITY_COLOR[priority] ?? C.sub, background: `${PRIORITY_COLOR[priority] ?? C.sub}18`, border: `1px solid ${PRIORITY_COLOR[priority] ?? C.sub}44`, borderRadius: 999, padding: '2px 9px', fontSize: 10.5, fontWeight: 600 }}>{priority}</span>
                                    </td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 700 }}>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard title="Напоминания" icon={<IconBell />}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Время</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Событие</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Компания</th>
                            </tr>
                        </thead>
                        <tbody>
                            {NB.reminders.map(([time, title, company], idx) => (
                                <tr key={idx} style={{ borderTop: `1px solid ${C.border}` }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.sub, whiteSpace: 'nowrap' }}>{time}</td>
                                    <td style={{ padding: '6px 6px', color: C.text }}>{title}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right' }}>{company}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>
            </div>

            {/* Zametkalar */}
            <SectionCard title="Заметки / события" icon={<IconStickyNote />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {NB.notes.map((n) => {
                        const color = NOTE_COLORS[n.color] ?? GC.amber;
                        return (
                            <div key={n.id} style={{ background: `${GC.icon}14`, border: `1px solid ${GC.icon}44`, borderRadius: 10, padding: '9px 11px', minWidth: 0 }}>
                                <div style={{ color, fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{n.title}</div>
                                <div style={{ color: C.sub, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{n.content}</div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* API-поля источника */}
            <SectionCard title="API-поля источника" hint="структура данных">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                    {apiFields.map((f) => (
                        <div key={f.key} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', minWidth: 0 }}>
                            <div style={{ color: GC.cyan, fontSize: 10.5, fontFamily: 'monospace', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.key}</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value}</div>
                            <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>{f.tag}</div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default ContactHubDetail;
