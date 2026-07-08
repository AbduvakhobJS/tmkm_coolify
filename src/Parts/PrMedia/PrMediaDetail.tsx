import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, axis, centerText } from '../../components/dashboardUI';

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

const IconMegaphone = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 11v2a2 2 0 002 2h1l1 5h2l-1-5h2l8 4V6l-8 4H6a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M20 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconTarget = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);
const IconNewspaper = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M7 8h6M7 11.5h6M7 15h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTv = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 22h8M8 3l4 3 4-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGlobe = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);
const IconSmile = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 14c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.5 9.5h.01M15.5 9.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);
const IconLinkedIn = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3.4a1.96 1.96 0 100 3.92 1.96 1.96 0 000-3.92zM20.5 20h-3.37v-5.93c0-1.41-.03-3.23-1.97-3.23-1.98 0-2.28 1.55-2.28 3.13V20H9.5V8.5h3.24v1.57h.05c.45-.86 1.56-1.76 3.2-1.76 3.42 0 4.05 2.25 4.05 5.18V20z" />
    </svg>
);
const IconTelegram = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.5 3.5L2.7 10.9c-1.1.45-1.1 1.08-.2 1.36l4.8 1.5 1.8 5.7c.22.6.38.85.78.85.3 0 .44-.14.6-.3l2.6-2.5 4.9 3.6c.66.37 1.13.18 1.3-.6l3.4-15.9c.24-1.08-.42-1.6-1.2-1.16z" />
    </svg>
);
const IconInstagram = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
);
const IconYouTube = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10.5 9.3v5.4l4.8-2.7z" />
    </svg>
);
const IconMic = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="2.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M9 21h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconCheckCircle = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.5 12.3l2.3 2.3L15.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 9.5v4.2M12 16.7h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconClockCircle = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconFileText = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2.5h9l4 4V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 12h6M9 16h6M9 8h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconVideo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M15.5 10.2l6-3v9.6l-6-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);
const IconStar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l2.6 5.8 6.2.6-4.7 4.2 1.4 6.2L12 16.9 6.5 19.8l1.4-6.2-4.7-4.2 6.2-.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconFlagAlert = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 9.5v4.2M12 16.7h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconClipboard = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 11.5h7M8.5 15h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconDocCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2.5h9l4 4V21a1 1 0 01-1 1H6a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9 13.5l1.8 1.8L15 11.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconArrowLeft = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── Mock ma'lumotlar (PR / Медиа и репутация — to'liq ko'rinish) ── */

const KPI_ITEMS = [
    { label: 'Медиаохват', value: '86/100', sub: '+12', icon: <IconTarget />, color: '#4fb3d9', bad: false },
    { label: 'Нац. СМИ', value: '12/10', sub: '120%', icon: <IconNewspaper />, color: '#22c55e', bad: false },
    { label: 'Центральное ТВ', value: '2/5', sub: 'квартал', icon: <IconTv />, color: C.down, bad: true },
    { label: 'Международные СМИ', value: '1/4', sub: 'квартал', icon: <IconGlobe />, color: C.down, bad: true },
    { label: 'Позитив', value: '89%', sub: '+14%', icon: <IconSmile />, color: '#22c55e', bad: false },
    { label: 'LinkedIn', value: '+38%', sub: 'цель 50%', icon: <IconLinkedIn />, color: '#0a66c2', bad: false },
    { label: 'Telegram охват', value: '31%', sub: 'цель ≥30%', icon: <IconTelegram />, color: '#29a9eb', bad: false },
    { label: 'Публичные выступления', value: '7', sub: '+2', icon: <IconMic />, color: '#a855f7', bad: false },
];

type KpiStatus = 'done' | 'warn' | 'progress';
const KPI_EXEC: { label: string; value: string; pct: number; color: string; status: KpiStatus }[] = [
    { label: 'Публикации в СМИ (нац.)', value: '12/10', pct: 100, color: '#22c55e', status: 'done' },
    { label: 'Выходы на ТВ (квартал)', value: '2/5', pct: 40, color: C.down, status: 'warn' },
    { label: 'Публикации в межд. СМИ', value: '1/4', pct: 25, color: C.down, status: 'warn' },
    { label: 'LinkedIn рост (год)', value: '+38%', pct: 76, color: '#22c55e', status: 'done' },
    { label: 'Telegram охват', value: '31%', pct: 100, color: '#22c55e', status: 'done' },
    { label: 'Контент-план', value: '41/57', pct: 72, color: '#f59e0b', status: 'progress' },
];

type PlanStatus = 'ВЫПОЛНЕНО' | 'В ГРАФИКЕ' | 'ТРЕБУЕТ РЕШЕНИЯ' | 'В РАБОТЕ' | 'ЕСТЬ РИСК';
const PLAN_COLOR: Record<PlanStatus, string> = {
    'ВЫПОЛНЕНО': '#22c55e',
    'В ГРАФИКЕ': '#3b82f6',
    'ТРЕБУЕТ РЕШЕНИЯ': C.down,
    'В РАБОТЕ': '#f59e0b',
    'ЕСТЬ РИСК': '#f59e0b',
};
const MEDIA_PLAN: { topic: string; owner: string; status: PlanStatus }[] = [
    { topic: "O'zbekiston24 / Studio24 podcast", owner: 'А. Раупов', status: 'ВЫПОЛНЕНО' },
    { topic: 'Статьи и интервью: Kun.uz / Uza.uz / Gazeta.uz', owner: 'Т. Хикматуллаев', status: 'В ГРАФИКЕ' },
    { topic: 'Пресс-конференция «ТМК — отчёт и планы»', owner: 'А. Раупов', status: 'ТРЕБУЕТ РЕШЕНИЯ' },
    { topic: 'Международные и национальные форумы / спикеры', owner: 'А. Раупов', status: 'В ГРАФИКЕ' },
    { topic: 'LinkedIn-публикации от имени руководства', owner: 'Т. Хикматуллаев', status: 'В РАБОТЕ' },
    { topic: 'Mining Journal — интервью / статья', owner: 'Т. Хикматуллаев', status: 'ЕСТЬ РИСК' },
];

const SOCIAL_DIGITAL = [
    { label: 'LinkedIn', sub: 'рост подписчиков, англ. посты', delta: '+38%', value: '6/8', pct: 75, icon: <IconLinkedIn />, color: '#0a66c2' },
    { label: 'Telegram', sub: 'рост подписчиков, охват', delta: '+14%', value: '31%', pct: 31, icon: <IconTelegram />, color: '#29a9eb' },
    { label: 'Instagram / Facebook', sub: 'контент', delta: '', value: '16/20', pct: 80, icon: <IconInstagram />, color: '#c1358f' },
    { label: 'YouTube', sub: 'видео', delta: '', value: '8/10', pct: 80, icon: <IconYouTube />, color: '#ff0000' },
    { label: 'Личный бренд руководства', sub: 'упоминания / реакции', delta: '', value: '2.9K', pct: 60, icon: <IconStar />, color: '#eab308' },
];

const CORP_CONTENT = [
    { label: 'Новости', value: '18/20', icon: <IconFileText />, color: '#4fb3d9' },
    { label: 'Видео', value: '8/10', icon: <IconVideo />, color: '#a855f7' },
    { label: 'Интервью', value: '4/5', icon: <IconMic />, color: '#22c55e' },
    { label: 'Спецрепортажи', value: '1/2', icon: <IconStar />, color: '#f59e0b' },
];

const TONALITY = [
    { label: 'Позитив', value: 21, pct: 75, color: '#22c55e' },
    { label: 'Нейтрально', value: 5, pct: 18, color: '#3b82f6' },
    { label: 'Негатив', value: 2, pct: 7, color: C.down },
];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
const REACH_TREND = [12, 15, 18, 22, 25, 28];

type RiskLevel = 'СРЕДНИЙ РИСК' | 'ТРЕБУЕТ РЕШЕНИЯ' | 'НИЗКИЙ РИСК';
const RISK_COLOR: Record<RiskLevel, string> = { 'СРЕДНИЙ РИСК': '#f59e0b', 'ТРЕБУЕТ РЕШЕНИЯ': C.down, 'НИЗКИЙ РИСК': '#22c55e' };
const RISKS: { text: string; level: RiskLevel }[] = [
    { text: 'Недобор международных СМИ: 1 из 4', level: 'СРЕДНИЙ РИСК' },
    { text: 'До пресс-конференции осталось 3 дня — требуется финализация тезисов', level: 'ТРЕБУЕТ РЕШЕНИЯ' },
    { text: 'Низкий темп ТВ-выходов — усилить координацию', level: 'СРЕДНИЙ РИСК' },
    { text: 'Telegram KPI выполняется, удерживать темп', level: 'НИЗКИЙ РИСК' },
];

const TODAY_ACTIONS = [
    'Ускорить международные публикации',
    'Утвердить тезисы пресс-конференции',
    'Усилить выходы на центральное ТВ',
];

/* ── Yordamchi komponentlar ── */

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = '#4fb3d9', children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
        </div>
        {children}
    </div>
);

const MiniBar: React.FC<{ value: number; color: string }> = ({ value, color }) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(Math.min(value, 100)), 60);
        return () => clearTimeout(t);
    }, [value]);
    return (
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', flex: 1 }}>
            <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease', boxShadow: `0 0 6px ${color}88` }} />
        </div>
    );
};

const StatusIcon: React.FC<{ status: KpiStatus }> = ({ status }) => {
    if (status === 'done') return <span style={{ color: '#22c55e' }}><IconCheckCircle /></span>;
    if (status === 'warn') return <span style={{ color: C.down }}><IconAlertTriangle /></span>;
    return <span style={{ color: '#f59e0b' }}><IconClockCircle /></span>;
};

const Pill: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <span style={{ color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999, padding: '2px 9px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {label}
    </span>
);

const PrMediaDetail: React.FC = () => {
    const navigate = useNavigate();
    const [now, setNow] = useState(() => new Date());
    const [doneActions, setDoneActions] = useState<boolean[]>(() => TODAY_ACTIONS.map(() => false));

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const toggleAction = (idx: number) => {
        setDoneActions((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    };

    const tonalityTotal = TONALITY.reduce((s, t) => s + t.value, 0);
    const doneCount = MEDIA_PLAN.filter((m) => m.status === 'ВЫПОЛНЕНО').length;
    const onTrackCount = MEDIA_PLAN.filter((m) => m.status === 'В ГРАФИКЕ').length;
    const riskCount = MEDIA_PLAN.filter((m) => m.status === 'ЕСТЬ РИСК').length;
    const blockedCount = MEDIA_PLAN.filter((m) => m.status === 'ТРЕБУЕТ РЕШЕНИЯ').length;

    const tonalityDonut = {
        labels: TONALITY.map((t) => t.label),
        datasets: [{ data: TONALITY.map((t) => t.value), backgroundColor: TONALITY.map((t) => t.color), borderColor: C.card, borderWidth: 2 }],
    };
    const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

    const reachLine = {
        labels: MONTHS,
        datasets: [{ data: REACH_TREND, borderColor: '#4fb3d9', backgroundColor: '#4fb3d922', borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#4fb3d9', fill: true }],
    };
    const reachOptions = { ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any;

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#4fb3d9" size={36}><IconMegaphone /></NeonIcon>
                    <div>
                        <div style={{ color: '#4fb3d9', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>PR / Медиа и репутация</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2, maxWidth: 620 }}>
                            Экран для председателя · медиаактивность, KPI, риски и поручения
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/*<span style={{ color: C.sub, fontSize: 11 }}>{now.toLocaleDateString('ru-RU')}, {now.toLocaleTimeString('ru-RU')}</span>*/}
                    <span style={{ color: C.up, background: `${C.up}18`, border: `1px solid ${C.up}44`, borderRadius: 999, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>Общий статус: в работе</span>
                    <button
                        onClick={() => navigate('/main/pr-media')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            background: 'linear-gradient(135deg, #1e4d7b, #0ea8c7)', border: 'none', borderRadius: 8,
                            color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px',
                            boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                        <IconArrowLeft />Назад
                    </button>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {KPI_ITEMS.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${k.bad ? `${C.down}55` : C.border}`, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <NeonIcon color={k.color} size={22}>{k.icon}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                        </div>
                        <div style={{ color: k.bad ? C.down : C.text, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
                        <div style={{ color: k.bad ? C.down : C.up, fontSize: 10 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* 1-qator: KPI ijrosi / media reja / raqamli охват */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, alignItems: 'stretch' }}>

                <SectionCard title="Исполнение KPI" icon={<IconTarget />} style={{ height: 300 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                        {KPI_EXEC.map((k) => (
                            <div key={k.label}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, marginBottom: 3 }}>
                                    <StatusIcon status={k.status} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 700, flexShrink: 0 }}>{k.value}</span>
                                </div>
                                <MiniBar value={k.pct} color={k.color} />
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Ключевые темы и медиаплан" icon={<IconClipboard />} style={{ height: 300 }}>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                            <thead>
                                <tr style={{ color: C.sub, textAlign: 'left' }}>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, width: 20 }}>№</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500 }}>Тема / активность</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500 }}>Ответственный</th>
                                    <th style={{ padding: '3px 4px', fontWeight: 500, textAlign: 'right' }}>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MEDIA_PLAN.map((m, idx) => (
                                    <tr key={m.topic} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '5px 4px', color: C.sub }}>{idx + 1}</td>
                                        <td style={{ padding: '5px 4px', color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 1 }} title={m.topic}>{m.topic}</td>
                                        <td style={{ padding: '5px 4px', color: C.sub, whiteSpace: 'nowrap' }}>{m.owner}</td>
                                        <td style={{ padding: '5px 4px', textAlign: 'right' }}><Pill label={m.status} color={PLAN_COLOR[m.status]} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10.5, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
                        <span style={{ color: '#22c55e' }}>Выполнено: {doneCount}</span>
                        <span style={{ color: '#3b82f6' }}>В графике: {onTrackCount}</span>
                        <span style={{ color: '#f59e0b' }}>Риск: {riskCount}</span>
                        <span style={{ color: C.down }}>Требует решения: {blockedCount}</span>
                    </div>
                </SectionCard>

                <SectionCard title="Соцсети и цифровой охват" icon={<IconGlobe />} style={{ height: 300 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', flex: 1 }}>
                        {SOCIAL_DIGITAL.map((s) => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <NeonIcon color={s.color} size={26}>{s.icon}</NeonIcon>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                                        <span style={{ color: C.text, fontWeight: 600 }}>{s.label}{s.delta && <span style={{ color: C.up, fontWeight: 400 }}> {s.delta}</span>}</span>
                                        <span style={{ color: C.sub, fontWeight: 700 }}>{s.value}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                        <MiniBar value={s.pct} color={s.color} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* 2-qator: korporativ kontent / tonallik+охват / risklar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 8, alignItems: 'stretch' }}>

                <SectionCard title="Корпоративный контент" icon={<IconFileText />} style={{ height: 236 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
                        {CORP_CONTENT.map((c) => (
                            <div key={c.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                                <NeonIcon color={c.color} size={26}>{c.icon}</NeonIcon>
                                <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{c.value}</div>
                                <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase' }}>{c.label}</div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Тональность / динамика медиаохвата" icon={<IconSmile />} style={{ height: 236 }}>
                    <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 82, height: 82, flexShrink: 0, alignSelf: 'center' }}>
                            <Doughnut data={tonalityDonut} options={donutOptions} plugins={[centerText(String(tonalityTotal), 'публик.')]} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center', flexShrink: 0 }}>
                            {TONALITY.map((t) => (
                                <div key={t.label} style={{ display: 'flex', alignItems: 'center', fontSize: 10.5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, marginRight: 5, flexShrink: 0, boxShadow: `0 0 5px ${t.color}` }} />
                                    <span style={{ color: C.text }}>{t.pct}% ({t.value})</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Line data={reachLine} options={reachOptions} />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Риски и поручения председателя" icon={<IconAlertTriangle />} iconColor="#f59e0b" style={{ height: 236 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }}>
                        {RISKS.map((r) => (
                            <div key={r.text} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, fontSize: 10.5 }}>
                                <span style={{ color: C.text, flex: 1 }}>{r.text}</span>
                                <Pill label={r.level} color={RISK_COLOR[r.level]} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 8px', fontSize: 10, color: C.text }}>
                            <IconClipboard />Поручения председателя <b style={{ marginLeft: 'auto' }}>4</b>
                        </span>
                        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 8px', fontSize: 10, color: C.text }}>
                            <IconDocCheck />Материалы на согласовании <b style={{ marginLeft: 'auto' }}>9</b>
                        </span>
                    </div>
                </SectionCard>
            </div>

            {/* Bugungi e'tibor talab qiladigan masalalar */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <div style={{ width: 190, flexShrink: 0, background: `${C.down}12`, border: `1px solid ${C.down}44`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <NeonIcon color={C.down} size={30}><IconFlagAlert /></NeonIcon>
                    <div style={{ color: C.down, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Что требует внимания сегодня</div>
                </div>
                {TODAY_ACTIONS.map((a, idx) => (
                    <button
                        key={a}
                        onClick={() => toggleAction(idx)}
                        style={{
                            flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                            background: doneActions[idx] ? `${C.up}14` : C.card,
                            border: `1px solid ${doneActions[idx] ? `${C.up}55` : C.border}`,
                            borderRadius: 12, padding: '10px 13px', transition: 'background 0.15s ease, border-color 0.15s ease',
                        }}
                    >
                        <span style={{
                            width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: doneActions[idx] ? '#22c55e' : 'rgba(255,255,255,0.08)', color: doneActions[idx] ? '#fff' : C.sub, fontSize: 11, fontWeight: 700,
                        }}>
                            {doneActions[idx] ? '✓' : idx + 1}
                        </span>
                        <span style={{ fontSize: 11.5, color: doneActions[idx] ? C.sub : C.text, textDecoration: doneActions[idx] ? 'line-through' : 'none' }}>{a}</span>
                    </button>
                ))}
                <div style={{ width: 220, flexShrink: 0, background: `${C.up}14`, border: `1px solid ${C.up}44`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center' }}>
                    <NeonIcon color={C.up} size={26}><IconCheckCircle /></NeonIcon>
                    <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>Статус PR-функции</div>
                    <div style={{ color: C.up, fontSize: 13, fontWeight: 700 }}>Удовлетворительно</div>
                </div>
            </div>
        </div>
    );
};

export default PrMediaDetail;
