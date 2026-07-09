import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, axis, centerText } from '../../components/dashboardUI';
import { useHrSituation } from '../../hooks/hrSituation';

/* ── Neon ikonkalar (dizayn tizimiga mos, gradient + glow) ── */

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

const IconUsers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconGaugeCircle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15.5a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 15.5l3.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    </svg>
);
const IconUserPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.5 8v5.5M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconGenders = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8.5" cy="15.5" r="4.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 11V4M6 6.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M19.8 4.2L23 1M23 1h-3M23 1v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCalendarX = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9.5 13.5l5 5M14.5 13.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconServerSync = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="7" cy="7" r="0.9" fill="currentColor" />
        <circle cx="7" cy="17" r="0.9" fill="currentColor" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconFactory = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21V11l5 3.5V11l5 3.5V9l6 4v8H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);

/* ── API javob turi (https://employees.uzkmt.uz/api/situation/hr) ── */

type HrSituation = {
    ok: boolean;
    generated_at: string;
    source: string;
    last_sync: { id: string; started_at: string; finished_at: string; status: string; message: string };
    period: { year: number; date_from: string; date_to: string };
    kpi: {
        employees_actual: number; employees_total: number; staff_plan: number;
        vacancies: number; staffing_percent: number; hired_period: number; dismissed_period: number;
    };
    movements_by_month: { period: string; label: string; hired: number; dismissed: number }[];
    demography: { male: number; female: number; unknown_gender: number; avg_age: number; age_groups: { name: string; value: number }[] };
    absences: { on_leave: number; sick_leave: number; absent_unconfirmed: number; unpaid_leave: number; maternity_leave: number };
};

const TABS = [
    { key: 'hr', label: 'HR' },
    { key: 'production', label: 'Производство' },
    { key: 'quality', label: 'Качество' },
    { key: 'procurement', label: 'Закупки' },
    { key: 'energy', label: 'Энергия' },
];

const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU');
};

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = '#4fb3d9', hint, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        {children}
    </div>
);

const StatTile: React.FC<{ label: string; value: React.ReactNode; sub?: string; color?: string }> = ({ label, value, sub, color = C.text }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 9px', minWidth: 0 }}>
        <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ color, fontSize: 14, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
        {sub && <div style={{ color: C.sub, fontSize: 9, marginTop: 1 }}>{sub}</div>}
    </div>
);

const HrAnalitika: React.FC = () => {
    const navigate = useNavigate();
    const { data } = useHrSituation();
    const [tab, setTab] = useState('hr');

    const HR: HrSituation | undefined = data;
    const today = HR ? fmtDate(HR.generated_at) : '—';

    const staffing = HR?.kpi.staffing_percent ?? 0;
    const netMovement = HR ? HR.kpi.hired_period - HR.kpi.dismissed_period : 0;
    const vacancyPct = HR ? +((HR.kpi.vacancies / HR.kpi.staff_plan) * 100).toFixed(1) : 0;
    const absencesTotal = HR ? Object.values(HR.absences).reduce((s, v) => s + v, 0) : 0;
    const malePct = HR ? Math.round((HR.demography.male / (HR.demography.male + HR.demography.female || 1)) * 100) : 0;

    const peakDismissMonth = useMemo(() => {
        if (!HR || HR.movements_by_month.length === 0) return null;
        return HR.movements_by_month.reduce((a, b) => (b.dismissed > a.dismissed ? b : a));
    }, [HR]);

    const movementBar = useMemo(() => ({
        labels: HR?.movements_by_month.map((m) => m.label) ?? [],
        datasets: [
            { label: 'Принято', data: HR?.movements_by_month.map((m) => m.hired) ?? [], backgroundColor: '#22c55e', borderRadius: 4, barPercentage: 0.6 },
            { label: 'Уволено', data: HR?.movements_by_month.map((m) => m.dismissed) ?? [], backgroundColor: '#f59e0b', borderRadius: 4, barPercentage: 0.6 },
        ],
    }), [HR]);

    const genderDonut = useMemo(() => ({
        labels: ['Мужчины', 'Женщины'],
        datasets: [{ data: [HR?.demography.male ?? 0, HR?.demography.female ?? 0], backgroundColor: ['#0ea8c7', '#c1358f'], borderColor: C.card, borderWidth: 2 }],
    }), [HR]);

    const staffingDonut = useMemo(() => ({
        labels: ['Укомплектовано', 'Вакансии'],
        datasets: [{ data: [staffing, Math.max(100 - staffing, 0)], backgroundColor: ['#22c55e', 'rgba(255,255,255,0.06)'], borderColor: C.card, borderWidth: 2 }],
    }), [staffing]);

    const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;
    const ageGroups = useMemo(() => [...(HR?.demography.age_groups ?? [])].sort((a, b) => b.value - a.value), [HR]);
    const maxAge = Math.max(...ageGroups.map((a) => a.value), 1);

    const ABSENCE_ITEMS = HR ? [
        { label: 'Ежегодный отпуск', value: HR.absences.on_leave, color: '#3b82f6' },
        { label: 'Больничный', value: HR.absences.sick_leave, color: '#22c55e' },
        { label: 'Неявка (не подтв.)', value: HR.absences.absent_unconfirmed, color: C.down },
        { label: 'За свой счёт', value: HR.absences.unpaid_leave, color: '#f59e0b' },
        { label: 'Декретный отпуск', value: HR.absences.maternity_leave, color: '#a855f7' },
    ] : [];

    const statusColor = HR?.last_sync.status === 'ok' ? '#22c55e' : '#eab308';
    const statusLabel = HR?.last_sync.status === 'ok' ? 'актуально' : (HR?.last_sync.status ?? '—');

    return (
        <div style={{ background: C.bg, minHeight: '100vh', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#4fb3d9" size={30}><IconUsers /></NeonIcon>
                    <div style={{ color: '#4fb3d9', fontSize: 17, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Корпоративный BI / HR / Финансы</div>
                </div>
                <button
                    onClick={() => navigate('/main/hr-bi-detail')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        background: 'linear-gradient(135deg, #1e4d7b, #0ea8c7)', border: 'none', borderRadius: 999,
                        color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '7px 14px',
                        boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                    Подробнее<IconArrowRight />
                </button>
            </div>

            {/* Tablar */}
            <div style={{ display: 'flex', gap: 6 }}>
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, fontWeight: 700,
                            letterSpacing: 0.3, textTransform: 'uppercase',
                            background: tab === t.key ? 'linear-gradient(135deg, #1e4d7b, #0ea8c7)' : C.card,
                            border: `1px solid ${tab === t.key ? '#0ea8c7' : C.border}`,
                            color: tab === t.key ? '#fff' : C.sub,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {t.key !== 'hr' && <IconFactory />}{t.label}
                    </button>
                ))}
            </div>

            {tab !== 'hr' ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                    <div style={{ color: C.sub, fontSize: 13, textAlign: 'center' }}>
                        Данные по разделу «{TABS.find((t) => t.key === tab)?.label}» пока не подключены к API.
                    </div>
                </div>
            ) : !HR ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
                    <div style={{ color: C.sub, fontSize: 13 }}>Загрузка данных HR из employees.uzkmt.uz…</div>
                </div>
            ) : (
                <>
                    {/* KPI qatori */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                        <StatTile label="Сотрудники" value={HR.kpi.employees_actual.toLocaleString('ru-RU')} sub={`снимок ${today}`} color="#4fb3d9" />
                        <StatTile label="Штатный план" value={HR.kpi.staff_plan.toLocaleString('ru-RU')} sub={`на ${today}`} color="#22c55e" />
                        <StatTile label="Вакансии" value={HR.kpi.vacancies.toLocaleString('ru-RU')} sub={`на ${today}`} color="#f59e0b" />
                        <StatTile label="Укомплект." value={`${HR.kpi.staffing_percent}%`} sub="факт / план" color="#22c55e" />
                        <StatTile label="Принято" value={HR.kpi.hired_period} sub={`${fmtDate(HR.period.date_from + 'T00:00:00')}–${today}`} color="#22c55e" />
                        <StatTile label="Уволено" value={HR.kpi.dismissed_period} sub={`${fmtDate(HR.period.date_from + 'T00:00:00')}–${today}`} color={C.down} />
                    </div>

                    {/* 3-qator */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>
                        <SectionCard title="Приём / увольнения" icon={<IconUserPlus />} hint={today} style={{ height: 268 }}>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <Bar data={movementBar} options={{
                                    ...chartBase,
                                    plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 10 } } } },
                                    scales: axis({ y: { beginAtZero: true } }),
                                } as any} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 8 }}>
                                <StatTile label="Принято" value={HR.kpi.hired_period} sub="за период" color="#22c55e" />
                                <StatTile label="Уволено" value={HR.kpi.dismissed_period} sub="за период" color={C.down} />
                                <StatTile label="Баланс" value={netMovement >= 0 ? `+${netMovement}` : netMovement} sub="чистый прирост" color={netMovement >= 0 ? '#22c55e' : C.down} />
                                <StatTile label="Пик увольнений" value={peakDismissMonth ? peakDismissMonth.label : '—'} sub={peakDismissMonth ? `${peakDismissMonth.dismissed} событий` : ''} color="#f59e0b" />
                            </div>
                        </SectionCard>

                        <SectionCard title="Демография / возраст" icon={<IconGenders />} hint={today} style={{ height: 268 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                                    <Doughnut data={genderDonut} options={donutOptions} plugins={[centerText(`${malePct}%`, 'мужчин')]} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                        <span style={{ color: C.text }}><span style={{ width: 7, height: 7, display: 'inline-block', borderRadius: '50%', background: '#0ea8c7', marginRight: 5 }} />Мужчины</span>
                                        <span style={{ color: C.sub, fontWeight: 700 }}>{HR.demography.male.toLocaleString('ru-RU')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                        <span style={{ color: C.text }}><span style={{ width: 7, height: 7, display: 'inline-block', borderRadius: '50%', background: '#c1358f', marginRight: 5 }} />Женщины</span>
                                        <span style={{ color: C.sub, fontWeight: 700 }}>{HR.demography.female.toLocaleString('ru-RU')}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                        <span style={{ color: C.sub }}>Средний возраст</span>
                                        <span style={{ color: C.text, fontWeight: 700 }}>{HR.demography.avg_age}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'auto', flex: 1 }}>
                                {ageGroups.map((g) => (
                                    <div key={g.name} style={{ minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 2 }}>
                                            <span style={{ color: C.sub }}>{g.name}</span>
                                            <span style={{ color: C.text, fontWeight: 600 }}>{g.value}</span>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(g.value / maxAge) * 100}%`, background: '#0ea8c7', borderRadius: 2 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="HR-фокус" icon={<IconGaugeCircle />} hint="короткий вывод" style={{ height: 268 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 84, height: 84 }}>
                                    <Doughnut data={staffingDonut} options={donutOptions} plugins={[centerText(`${staffing}%`, 'укомплект')]} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 8, flex: 1 }}>
                                <StatTile label="План / факт" value={`${HR.kpi.staff_plan} / ${HR.kpi.employees_actual}`} sub="штатное расписание" />
                                <StatTile label="Вакансии" value={HR.kpi.vacancies} sub={`${vacancyPct}% от плана`} color="#f59e0b" />
                                <StatTile label="Баланс движения" value={netMovement >= 0 ? `+${netMovement}` : netMovement} sub={`${HR.kpi.hired_period} принято / ${HR.kpi.dismissed_period} уволено`} color={netMovement >= 0 ? '#22c55e' : C.down} />
                                <StatTile label="Отсутствуют" value={absencesTotal} sub="на дату снимка" color="#eab308" />
                            </div>
                        </SectionCard>
                    </div>

                    {/* 2-qator */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>
                        <SectionCard title="Отсутствия" icon={<IconCalendarX />} hint="на дату снимка">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                                {ABSENCE_ITEMS.map((a) => (
                                    <StatTile key={a.label} label={a.label} value={a.value} color={a.color} />
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard title="Служебная информация" icon={<IconServerSync />} hint={HR.last_sync.status === 'ok' ? 'API отвечает' : 'ограниченная синхронизация'}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                <StatTile label="Синхронизация" value={fmtDate(HR.last_sync.started_at)} />
                                <StatTile label="Период" value={`${HR.period.date_from}–${HR.period.date_to}`} />
                                <StatTile label="Источник" value={HR.source} />
                                <StatTile label="Статус" value={statusLabel} color={statusColor} />
                            </div>
                            {HR.last_sync.message && (
                                <div style={{ color: C.sub, fontSize: 10, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                                    {HR.last_sync.message}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </>
            )}
        </div>
    );
};

export default HrAnalitika;
