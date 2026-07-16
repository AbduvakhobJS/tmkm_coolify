import React, {useEffect, useMemo, useState} from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, axis, centerText } from '../../components/dashboardUI';
import { useSituationSummary } from '../../hooks/hr';
import hrDemoData from './hrDemoData.json';
import axios from "axios";

/* ── Neon ikonkalar ── */

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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconUserPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.5 8v5.5M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconUserMinus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconBriefcase = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="7.5" width="19" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 7.5V5.5a2 2 0 012-2h4a2 2 0 012 2v2M2.5 12.5h19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconWalk = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13.5" cy="4" r="1.8" fill="currentColor" />
        <path d="M11 8l-2.5 3 2 2-1 6M11 8l4 1 2.5 4M9 12l4.5.5M14.5 21l2-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconIdCard = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="5" width="19" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 16.2c.4-1.6 1.4-2.5 2.5-2.5s2.1.9 2.5 2.5M13.5 10h6M13.5 13.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconBuilding = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="10" height="18" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="9" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 7h1.5M11 7h1.5M7 11h1.5M11 11h1.5M7 15h1.5M11 15h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconTrend = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChevronLeft = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChevronRight = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconSitemap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="2.5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="2.5" y="16.5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="15.5" y="16.5" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v4M12 11H5.5v5.5M12 11h6.5v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconCalendarClock = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="15" cy="15.5" r="4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M15 13.6v1.9l1.3 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);
const IconCalendarRange = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 14h3M13.5 14h3M7.5 17h3M13.5 17h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconGauge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15.5a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 15.5l3.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
        <path d="M4 15.5h1.2M18.8 15.5H20M6.5 8.5l.9.9M17.5 8.5l-.9.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconBookOpen = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5c-1.6-1.3-3.7-2-6.5-2-1 0-1.5.2-1.5.2v13.3s.5-.2 1.5-.2c2.8 0 4.9.7 6.5 2 1.6-1.3 3.7-2 6.5-2 1 0 1.5.2 1.5.2V4.7s-.5-.2-1.5-.2c-2.8 0-4.9.7-6.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 6.5v13.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);

/* ── API javob turlari (situation.uzkmt.uz /api/v1/summary) ── */

type HrData = {
    generatedAt: string;
    period: { dateFrom: string; dateTo: string };
    totals: Record<string, number | boolean>;
    overviewCards: { label: string; value: number; unit: string; sub: string; negative?: boolean }[];
    endpoints: { label: string; value: number; sub: string }[];
    charts: {
        staff: { label: string; value: number }[];
        gender: { label: string; value: number }[];
        age: { label: string; value: number; sub: string }[];
        movementByPeriod: { period: string; label: string; hired: number; terminated: number; net: number }[];
        topVacancies: { label: string; value: number; sub: string }[];
        topActualHeadcount: { label: string; value: number; sub: string }[];
        currentAbsences: { key: string; label: string; value: number }[];
        periodAbsences: { key: string; label: string; value: number }[];
        absenceUnitsToday: { label: string; value: number; sub: string }[];
        absenceUnitsPeriod: { label: string; value: number; sub: string }[];
        employeesByPosition: { label: string; value: number; sub: string }[];
        departmentDashboard: { unit_id: string; unit_name: string; planned: number; actual: number; vacancy: number; annual_leave: number; sick_leave: number; absence_total: number; fill: number }[];
        turnover: { unit_id: string; label: string; value: number; sub: string }[];
    };
    drilldown: {
        units: {
            unit_id: string; unit_name: string; level: string; depth: number;
            planned: number; actual: number; vacancy: number; fill: number;
            male: number; female: number;
            employees: { employee_id: string; full_name: string; personnel_code: string; gender: string; age: number; position_name: string }[];
        }[];
    };
};

const ABSENCE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#22c55e', '#0ea8c7', '#eab308', C.down];

/* ── Yordamchi komponentlar ── */

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = '#4fb3d9', hint, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>{hint}</div>}
        </div>
        {children}
    </div>
);

const ProgressRow: React.FC<{ name: string; sub?: string; value: number; max: number; color: string }> = ({ name, sub, value, max, color }) => (
    <div style={{ marginBottom: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }} title={name}>{name}</span>
            <span style={{ color: C.sub, fontWeight: 700, flexShrink: 0 }}>{value}</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: 3, boxShadow: `0 0 5px ${color}88` }} />
        </div>
        {sub && <div style={{ color: C.sub, fontSize: 9.5, marginTop: 2 }}>{sub}</div>}
    </div>
);

const Pager: React.FC<{ page: number; totalPages: number; onChange: (p: number) => void; total: number; pageSize: number }> = ({ page, totalPages, onChange, total, pageSize }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
        <span style={{ color: C.sub, fontSize: 10.5 }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} из {total}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
                onClick={() => onChange(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, background: C.cardAlt, border: `1px solid ${C.border}`, color: page === 1 ? C.sub : C.text, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
            >
                <IconChevronLeft />
            </button>
            <span style={{ color: C.text, fontSize: 11, fontWeight: 700, minWidth: 54, textAlign: 'center' }}>{page} / {totalPages}</span>
            <button
                onClick={() => onChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, background: C.cardAlt, border: `1px solid ${C.border}`, color: page === totalPages ? C.sub : C.text, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
            >
                <IconChevronRight />
            </button>
        </div>
    </div>
);

const PAGE_SIZE = 20;

function usePaged<T>(items: T[], page: number) {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const slice = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { totalPages, slice };
}

/* ── Yuklanish / xatolik holatlari ── */

const DEMO_HR = hrDemoData as unknown as HrData;

const HrAnalitikaDetail: React.FC = () => {


    useEffect(() =>{

        axios.get('http://xxx.xxx.uz/api/v1/summary', {headers: {Authorization: `Bearer ${localStorage.getItem("tmk-token")}`}})
            .then((res) => {
                console.log(res)
            })
            .catch((err) => {
                console.log(err)
            })

    }, [])
    const { data, isSuccess } = useSituationSummary();

    const [unitsPage, setUnitsPage] = useState(1);
    const [empPage, setEmpPage] = useState(1);
    const [todayAbsPage, setTodayAbsPage] = useState(1);
    const [periodAbsPage, setPeriodAbsPage] = useState(1);

    // API javob berguncha demo (na'muna) ma'lumot ko'rsatiladi;
    // so'rov muvaffaqiyatli bo'lishi bilan komponent avtomatik jonli ma'lumotga o'tadi.
    const liveHR: HrData | undefined = data?.data?.payload?.summary?.hrZup;
    const isLive = isSuccess && !!liveHR;
    const HR: HrData = liveHR ?? DEMO_HR;

    const units = useMemo(() => HR?.drilldown.units ?? [], [HR]);
    const { totalPages: unitsTotalPages, slice: unitsSlice } = usePaged(units, unitsPage);

    const employees = useMemo(
        () => units.flatMap((u) => u.employees.map((e) => ({ ...e, unit_name: u.unit_name }))),
        [units]
    );
    const { totalPages: empTotalPages, slice: empSlice } = usePaged(employees, empPage);

    const absToday = HR?.charts.absenceUnitsToday ?? [];
    const { totalPages: todayAbsTotalPages, slice: todayAbsSlice } = usePaged(absToday, todayAbsPage);

    const absPeriod = HR?.charts.absenceUnitsPeriod ?? [];
    const { totalPages: periodAbsTotalPages, slice: periodAbsSlice } = usePaged(absPeriod, periodAbsPage);

    const statesList = useMemo(() => {
        if (!HR) return [];
        const map = new Map<string, { key: string; label: string; today: number; period: number }>();
        HR.charts.currentAbsences.forEach((a) => map.set(a.key, { key: a.key, label: a.label, today: a.value, period: 0 }));
        HR.charts.periodAbsences.forEach((a) => {
            const ex = map.get(a.key);
            if (ex) ex.period = a.value;
            else map.set(a.key, { key: a.key, label: a.label, today: 0, period: a.value });
        });
        return Array.from(map.values()).sort((a, b) => b.period - a.period);
    }, [HR]);

    const maxVacancy = HR ? Math.max(...HR.charts.topVacancies.map((v) => v.value), 1) : 1;
    const maxHeadcount = HR ? Math.max(...HR.charts.topActualHeadcount.map((v) => v.value), 1) : 1;
    const maxTurnover = HR ? Math.max(...HR.charts.turnover.map((v) => v.value), 1) : 1;
    const currentAbsTotal = HR ? HR.charts.currentAbsences.reduce((s, a) => s + a.value, 0) : 0;
    const periodAbsMax = HR ? Math.max(...HR.charts.periodAbsences.map((a) => a.value), 1) : 1;

    const staffDonut = useMemo(() => ({
        labels: HR?.charts.staff.map((s) => s.label) ?? [],
        datasets: [{ data: HR?.charts.staff.map((s) => s.value) ?? [], backgroundColor: ['#22c55e', '#f59e0b'], borderColor: C.card, borderWidth: 2 }],
    }), [HR]);
    const genderDonut = useMemo(() => ({
        labels: HR?.charts.gender.map((s) => s.label) ?? [],
        datasets: [{ data: HR?.charts.gender.map((s) => s.value) ?? [], backgroundColor: ['#3b82f6', '#ec4899'], borderColor: C.card, borderWidth: 2 }],
    }), [HR]);
    const absenceDonut = useMemo(() => ({
        labels: HR?.charts.currentAbsences.map((s) => s.label) ?? [],
        datasets: [{ data: HR?.charts.currentAbsences.map((s) => s.value) ?? [], backgroundColor: ABSENCE_COLORS, borderColor: C.card, borderWidth: 2 }],
    }), [HR]);
    const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

    const ageBar = useMemo(() => ({
        labels: HR?.charts.age.map((a) => a.label) ?? [],
        datasets: [{ data: HR?.charts.age.map((a) => a.value) ?? [], backgroundColor: '#4fb3d9', borderRadius: 4, barPercentage: 0.6 }],
    }), [HR]);
    const movementBar = useMemo(() => ({
        labels: HR?.charts.movementByPeriod.map((m) => m.label) ?? [],
        datasets: [
            { label: 'Принято', data: HR?.charts.movementByPeriod.map((m) => m.hired) ?? [], backgroundColor: '#22c55e', borderRadius: 4 },
            { label: 'Уволено', data: HR?.charts.movementByPeriod.map((m) => -m.terminated) ?? [], backgroundColor: C.down, borderRadius: 4 },
        ],
    }), [HR]);
    const posBar = useMemo(() => ({
        labels: (HR?.charts.employeesByPosition ?? []).slice(0, 10).map((p) => p.label.length > 26 ? p.label.slice(0, 24) + '…' : p.label),
        datasets: [{ data: (HR?.charts.employeesByPosition ?? []).slice(0, 10).map((p) => p.value), backgroundColor: '#a855f7', borderRadius: 4, barPercentage: 0.6 }],
    }), [HR]);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#4fb3d9" size={36}><IconUsers /></NeonIcon>
                    <div>
                        <div style={{ color: '#4fb3d9', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>HR Аналитика</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                            Источник: 1C:ЗУП · Период: {HR.period.dateFrom} — {HR.period.dateTo}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                        color: isLive ? '#22c55e' : '#eab308',
                        background: isLive ? '#22c55e18' : '#eab30818',
                        border: `1px solid ${isLive ? '#22c55e44' : '#eab30844'}`,
                        borderRadius: 999, padding: '5px 12px',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#22c55e' : '#eab308', boxShadow: `0 0 6px ${isLive ? '#22c55e' : '#eab308'}` }} />
                        {isLive ? 'Живые данные API' : 'Демо-данные'}
                    </span>
                    <span style={{ color: C.sub, fontSize: 11, background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, padding: '5px 12px' }}>
                        Обновлено: {HR.generatedAt.replace('T', ', ').slice(0, 19)}
                    </span>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {[
                    { label: 'Плановая численность', value: HR.totals.planned as number, sub: 'штат', icon: <IconBriefcase />, color: '#4fb3d9', bad: false },
                    { label: 'Фактическая численность', value: HR.totals.actual as number, sub: `${HR.totals.loadPct}% от штата`, icon: <IconUsers />, color: '#22c55e', bad: false },
                    { label: 'Вакансии', value: HR.totals.vacancy as number, sub: `${HR.totals.vacancyPct}% от штата`, icon: <IconBriefcase />, color: '#f59e0b', bad: true },
                    { label: 'Принято за период', value: HR.totals.hired as number, sub: 'сотрудников', icon: <IconUserPlus />, color: '#22c55e', bad: false },
                    { label: 'Уволено за период', value: HR.totals.terminated as number, sub: 'сотрудников', icon: <IconUserMinus />, color: C.down, bad: true },
                    { label: 'Чистое движение', value: HR.totals.net as number, sub: 'за период', icon: <IconTrend />, color: (HR.totals.net as number) >= 0 ? '#22c55e' : C.down, bad: (HR.totals.net as number) < 0 },
                    { label: 'Подразделений', value: HR.totals.orgUnits as number, sub: 'в оргструктуре', icon: <IconSitemap />, color: '#a855f7', bad: false },
                    { label: 'Отсутствуют сегодня', value: HR.totals.absenceOnDateTotal as number, sub: 'статусов', icon: <IconWalk />, color: '#eab308', bad: true },
                ].map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${k.bad ? `${k.color}44` : C.border}`, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <NeonIcon color={k.color} size={22}>{k.icon}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                        </div>
                        <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{k.label === 'Чистое движение' && k.value >= 0 ? `+${k.value}` : k.value}</div>
                        <div style={{ color: k.bad ? k.color : C.sub, fontSize: 10 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* 1-qator: shtat / jins / yosh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Штат: факт / вакансии" icon={<IconBriefcase />} style={{ height: 230 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <Doughnut data={staffDonut} options={donutOptions} plugins={[centerText(String(HR.totals.planned), 'план')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            {HR.charts.staff.map((s, i) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#22c55e', '#f59e0b'][i], marginRight: 6, boxShadow: `0 0 5px ${['#22c55e', '#f59e0b'][i]}` }} />
                                    <span style={{ color: C.text, flex: 1 }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 700 }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Пол сотрудников" icon={<IconUsers />} style={{ height: 230 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <Doughnut data={genderDonut} options={donutOptions} plugins={[centerText(String(HR.totals.actual), 'всего')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            {HR.charts.gender.map((s, i) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#3b82f6', '#ec4899'][i], marginRight: 6, boxShadow: `0 0 5px ${['#3b82f6', '#ec4899'][i]}` }} />
                                    <span style={{ color: C.text, flex: 1 }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 700 }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Возрастная структура" icon={<IconTrend />} style={{ height: 230 }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={ageBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </SectionCard>
                <SectionCard title="Движение персонала по месяцам" icon={<IconTrend />} style={{ height: 230 }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={movementBar} options={{
                            ...chartBase,
                            plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 10 } } } },
                            scales: { x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } }, stacked: false }, y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } } },
                        } as any} />
                    </div>
                </SectionCard>
                <SectionCard title="Отсутствия сегодня" icon={<IconWalk />} style={{ height: 230 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 96, height: 96, flexShrink: 0 }}>
                            <Doughnut data={absenceDonut} options={donutOptions} plugins={[centerText(String(currentAbsTotal), 'всего')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                            {HR.charts.currentAbsences.map((a, i) => (
                                <div key={a.key} style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: ABSENCE_COLORS[i], marginRight: 5, flexShrink: 0, boxShadow: `0 0 5px ${ABSENCE_COLORS[i]}` }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 600 }}>{a.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* 2-qator: harakat / tekuchest */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, alignItems: 'stretch' }}>


                <SectionCard title="Текучесть по подразделениям" icon={<IconSitemap />} hint="топ-8" style={{ height: 250 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {HR.charts.turnover.slice(0, 8).map((t) => (
                            <ProgressRow key={t.unit_id} name={t.label} sub={t.sub} value={t.value} max={maxTurnover} color="#a855f7" />
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="Топ вакансий по подразделениям" icon={<IconBriefcase />} hint="топ-10" style={{ height: 250 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {HR.charts.topVacancies.slice(0, 10).map((v, i) => (
                            <ProgressRow key={i} name={v.label} sub={v.sub} value={v.value} max={maxVacancy} color="#f59e0b" />
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="Топ подразделений по факт. численности" icon={<IconUsers />} hint="топ-10" style={{ height: 250 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {HR.charts.topActualHeadcount.slice(0, 10).map((v, i) => (
                            <ProgressRow key={i} name={v.label} sub={v.sub} value={v.value} max={maxHeadcount} color="#22c55e" />
                        ))}
                    </div>
                </SectionCard>
                <SectionCard title="Отсутствия за период" icon={<IconWalk />} hint={`${HR.totals.absencePeriodTotal} всего`} style={{ height: 250 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {HR.charts.periodAbsences.map((a, i) => (
                            <ProgressRow key={a.key} name={a.label} value={a.value} max={periodAbsMax} color={ABSENCE_COLORS[i % ABSENCE_COLORS.length]} />
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* 3-qator: top vakansiyalar / top xodimlar soni */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, alignItems: 'stretch' }}>

                <SectionCard title="Таблица отсутствий на дату" icon={<IconCalendarClock />} hint={`${absToday.length} записей`}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                            <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Подразделение</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Статус отсутствия</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Количество</th>
                            </tr>
                            </thead>
                            <tbody>
                            {todayAbsSlice.map((a, idx) => (
                                <tr key={idx} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text, maxWidth: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.label}>{a.label}</td>
                                    <td style={{ padding: '6px 6px', color: '#eab308' }}>{a.sub}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 700 }}>{a.value}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={todayAbsPage} totalPages={todayAbsTotalPages} onChange={setTodayAbsPage} total={absToday.length} pageSize={PAGE_SIZE} />
                </SectionCard>

                <SectionCard title="Таблица отсутствий за период" icon={<IconCalendarRange />} hint={`${absPeriod.length} записей`}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                            <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Подразделение</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Статус отсутствия</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Количество</th>
                            </tr>
                            </thead>
                            <tbody>
                            {periodAbsSlice.map((a, idx) => (
                                <tr key={idx} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text, maxWidth: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.label}>{a.label}</td>
                                    <td style={{ padding: '6px 6px', color: '#f59e0b' }}>{a.sub}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 700 }}>{a.value}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={periodAbsPage} totalPages={periodAbsTotalPages} onChange={setPeriodAbsPage} total={absPeriod.length} pageSize={PAGE_SIZE} />
                </SectionCard>
            </div>

            {/* 4-qator: yo'qliklar (qisqa ko'rinish) */}


            {/* Таблица отсутствий на дату — pagination 20 ta */}


            {/* Таблица отсутствий за период — pagination 20 ta */}


            {/* Агрегатор метрик / Справочник состояний */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Агрегатор метрик" icon={<IconGauge />} hint="1C:ЗУП endpoints">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Endpoint</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Записей</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Статус / время</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HR.endpoints.map((e) => (
                                <tr key={e.label} style={{ borderTop: `1px solid ${C.border}` }}
                                    onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text, fontFamily: 'monospace', fontSize: 11 }}>{e.label}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 700 }}>{e.value}</td>
                                    <td style={{ padding: '6px 6px', textAlign: 'right' }}>
                                        <span style={{ color: e.sub.includes('200') ? '#22c55e' : C.down, fontSize: 10.5 }}>{e.sub}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>

                <SectionCard title="Справочник состояний сотрудников" icon={<IconBookOpen />} hint={`${statesList.length} из ${HR.totals.states}`}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Статус</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Сегодня</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>За период</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statesList.map((s, i) => (
                                <tr key={s.key} style={{ borderTop: `1px solid ${C.border}` }}
                                    onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text }}>
                                        <span style={{ width: 7, height: 7, display: 'inline-block', borderRadius: '50%', background: ABSENCE_COLORS[i % ABSENCE_COLORS.length], marginRight: 6, boxShadow: `0 0 5px ${ABSENCE_COLORS[i % ABSENCE_COLORS.length]}` }} />
                                        {s.label}
                                    </td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right' }}>{s.today || '—'}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 700 }}>{s.period || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ color: C.sub, fontSize: 9.5, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                        Показаны состояния, обнаруженные в текущей выгрузке. Полный справочник ЗУП содержит {HR.totals.states} состояний.
                    </div>
                </SectionCard>
            </div>

            {/* 5-qator: lavozimlar / bo'limlar jadvali */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Топ должностей" icon={<IconIdCard />} hint="топ-10" style={{ height: 280 }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={posBar} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: { x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9.5 } } }, y: { grid: { display: false }, ticks: { color: C.sub, font: { size: 9.5 } } } } } as any} />
                    </div>
                </SectionCard>

                <SectionCard title="Подразделения: план / факт / отпуска" icon={<IconBuilding />} hint={`${HR.charts.departmentDashboard.length} записей`} style={{ height: 280 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                                <tr style={{ color: C.sub, textAlign: 'left', position: 'sticky', top: 0, background: C.card }}>
                                    <th style={{ padding: '3px 4px', fontWeight: 500 }}>Подразделение</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, textAlign: 'right' }}>План</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, textAlign: 'right' }}>Факт</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, textAlign: 'right' }}>Вакансии</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, textAlign: 'right' }}>Заполн.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {HR.charts.departmentDashboard.map((d) => (
                                    <tr key={d.unit_id} style={{ borderTop: `1px solid ${C.border}` }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '5px 4px', color: C.text, maxWidth: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.unit_name}>{d.unit_name}</td>
                                        <td style={{ padding: '5px 4px', color: C.sub, textAlign: 'right' }}>{d.planned}</td>
                                        <td style={{ padding: '5px 4px', color: C.text, textAlign: 'right', fontWeight: 600 }}>{d.actual}</td>
                                        <td style={{ padding: '5px 4px', color: '#f59e0b', textAlign: 'right' }}>{d.vacancy}</td>
                                        <td style={{ padding: '5px 4px', textAlign: 'right', color: d.fill >= 70 ? '#22c55e' : d.fill >= 40 ? '#f59e0b' : C.down, fontWeight: 700 }}>{d.fill}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>

            {/* Оргструктура — pagination 20 ta */}
            <SectionCard title="Оргструктура" icon={<IconSitemap />} hint={`${units.length} подразделений`}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Подразделение</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Уровень</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>План</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Факт</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Вакансии</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Заполн.</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>М / Ж</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unitsSlice.map((u) => (
                                <tr key={u.unit_id} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text, paddingLeft: 6 + u.depth * 12 }}>{u.unit_name}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textTransform: 'capitalize' }}>{u.level}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right' }}>{u.planned}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, textAlign: 'right', fontWeight: 600 }}>{u.actual}</td>
                                    <td style={{ padding: '6px 6px', color: '#f59e0b', textAlign: 'right' }}>{u.vacancy}</td>
                                    <td style={{ padding: '6px 6px', textAlign: 'right', color: u.fill >= 70 ? '#22c55e' : u.fill >= 40 ? '#f59e0b' : C.down, fontWeight: 700 }}>{u.fill}%</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right' }}>{u.male} / {u.female}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={unitsPage} totalPages={unitsTotalPages} onChange={setUnitsPage} total={units.length} pageSize={PAGE_SIZE} />
            </SectionCard>

            {/* Сотрудники — pagination 20 ta */}
            <SectionCard title="Сотрудники" icon={<IconIdCard />} hint={`${employees.length} записей (из ${HR.totals.employeesRowCount})`}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>ФИО</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Таб. №</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Пол</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Возраст</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Должность</th>
                                <th style={{ padding: '4px 6px', fontWeight: 500 }}>Подразделение</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empSlice.map((e) => (
                                <tr key={e.employee_id} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                    onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '6px 6px', color: C.text, whiteSpace: 'nowrap' }}>{e.full_name.trim()}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub }}>{e.personnel_code}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub }}>{e.gender === 'male' ? 'М' : 'Ж'}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right' }}>{e.age}</td>
                                    <td style={{ padding: '6px 6px', color: C.text, maxWidth: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.position_name}>{e.position_name}</td>
                                    <td style={{ padding: '6px 6px', color: C.sub, maxWidth: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.unit_name}>{e.unit_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={empPage} totalPages={empTotalPages} onChange={setEmpPage} total={employees.length} pageSize={PAGE_SIZE} />
            </SectionCard>
        </div>
    );
};

export default HrAnalitikaDetail;
