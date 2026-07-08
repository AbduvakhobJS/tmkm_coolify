import React from 'react';
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

const IconAudience = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);

const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);

const IconArrowRight = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

/* ── Mock ma'lumotlar (PR / Медиа — qisqa ko'rinish) ── */

const KPI_ITEMS = [
    { label: 'Публикации', value: '28', delta: '▲ 27%', icon: <IconNewspaper />, color: '#4fb3d9' },
    { label: 'Выходы на ТВ', value: '6', delta: '▲ 20%', icon: <IconTv />, color: '#3b82f6' },
    { label: 'Международ. СМИ', value: '7', delta: '▲ 40%', icon: <IconGlobe />, color: '#a855f7' },
    { label: 'Охват аудитории', value: '3.2 млн', delta: '', icon: <IconAudience />, color: '#22c55e' },
];

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
const SERIES_SMI = [10, 12, 14, 16, 20, 24];
const SERIES_TV = [3, 3, 4, 4, 5, 6];
const SERIES_INTL = [2, 2, 3, 4, 5, 7];

const TONALITY = [
    { label: 'Позитив', value: 21, pct: 75, color: '#22c55e' },
    { label: 'Нейтрально', value: 5, pct: 18, color: '#3b82f6' },
    { label: 'Негатив', value: 2, pct: 7, color: C.down },
];

const SOCIAL = [
    { label: 'LinkedIn', value: '24 560', delta: '▲ 52% к году', icon: <IconLinkedIn />, color: '#0a66c2' },
    { label: 'Telegram', value: '18 920', delta: '▲ 21% к году', icon: <IconTelegram />, color: '#29a9eb' },
    { label: 'Instagram / Facebook', value: '22 / 20', delta: 'контент / план', icon: <IconInstagram />, color: '#c1358f' },
];

const PrMedia: React.FC = () => {
    const navigate = useNavigate();
    const tonalityTotal = TONALITY.reduce((s, t) => s + t.value, 0);

    const lineData = {
        labels: MONTHS,
        datasets: [
            { label: 'СМИ', data: SERIES_SMI, borderColor: '#4fb3d9', backgroundColor: '#4fb3d922', borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#4fb3d9' },
            { label: 'ТВ', data: SERIES_TV, borderColor: '#22c55e', backgroundColor: '#22c55e22', borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#22c55e' },
            { label: 'Межд. СМИ', data: SERIES_INTL, borderColor: '#eab308', backgroundColor: '#eab30822', borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#eab308' },
        ],
    };
    const lineOptions = {
        ...chartBase,
        plugins: { legend: { display: false } },
        scales: axis({ y: { beginAtZero: true } }),
    } as any;

    const donutData = {
        labels: TONALITY.map((t) => t.label),
        datasets: [{ data: TONALITY.map((t) => t.value), backgroundColor: TONALITY.map((t) => t.color), borderColor: C.card, borderWidth: 2 }],
    };
    const donutOptions = { ...chartBase, cutout: '70%', ...noLegend } as any;

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#4fb3d9" size={36}><IconMegaphone /></NeonIcon>
                    <div>
                        <div style={{ color: '#4fb3d9', fontSize: 15, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>PR / Медиа</div>
                        <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 }}>Ключевые показатели</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 11, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 11px' }}>
                        <IconCalendar />18 июня 2026 · 15:17
                    </span>
                    <button
                        onClick={() => navigate('/main/pr-media-detail')}
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
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {KPI_ITEMS.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <NeonIcon color={k.color}>{k.icon}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                        </div>
                        <div>
                            <span style={{ color: C.text, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{k.value}</span>
                            {k.delta && <div style={{ color: C.up, fontSize: 10.5, marginTop: 4 }}>{k.delta}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dinamika va tonallik */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 10, alignItems: 'stretch' }}>
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', height: 260 }}>
                    <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Динамика публикаций</div>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: C.sub }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fb3d9' }} />СМИ</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: C.sub }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />ТВ</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: C.sub }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308' }} />Межд. СМИ</span>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={lineData} options={lineOptions} />
                    </div>
                </div>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', height: 260 }}>
                    <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Тональность публикаций</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 108, height: 108, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={donutOptions} plugins={[centerText(String(tonalityTotal), 'всего')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            {TONALITY.map((t) => (
                                <div key={t.label} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, marginRight: 6, flexShrink: 0, boxShadow: `0 0 5px ${t.color}` }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label.slice(0, 1)}. {t.pct}%</span>
                                    <span style={{ color: C.sub, fontWeight: 600 }}>({t.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ijtimoiy tarmoqlar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {SOCIAL.map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 13px' }}>
                        <NeonIcon color={s.color} size={38}>{s.icon}</NeonIcon>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#4fb3d9', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>{s.label}</div>
                            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
                            <div style={{ color: C.up, fontSize: 10.5, marginTop: 1 }}>{s.delta}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrMedia;
