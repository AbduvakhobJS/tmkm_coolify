import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { C, chartBase, Badge } from '../../components/dashboardUI';

/* ── Mock ma'lumotlar (Guard HSE reyestri — umumiy ko'rinish) ── */

const KPI_ITEMS = [
    { label: 'Всего случаев', value: '5', sub: 'в реестре Guard', symbol: '📦', color: '#4fb3d9' },
    { label: 'Открытые случаи', value: '5', sub: '0 закрыто', symbol: '📂', color: '#3b82f6' },
    { label: 'Просрочено SLA', value: '4', sub: '0 случаев / 4 задач', symbol: '⏱', color: '#f59e0b' },
    { label: 'Критические', value: '1', sub: 'по уровню риска', symbol: '⚠', color: '#ef4444' },
];

const SITES = [
    { name: 'Центральный Аппарат Управления', value: 4 },
    { name: 'Чирчик', value: 1 },
    { name: 'Ангрен', value: 0 },
    { name: 'Ахангаран', value: 0 },
    { name: 'Ингичка', value: 0 },
    { name: 'Мискон', value: 0 },
    { name: 'Навои ГТР 1', value: 0 },
    { name: 'Нурабад', value: 0 },
];

const MINI_STATS = [
    { label: 'Площадки', value: '13', symbol: '📍', color: '#0ea8c7' },
    { label: 'Отделы', value: '70', symbol: '🏢', color: '#3b82f6' },
    { label: 'Фото/видео', value: '1 / 1', symbol: '📷', color: '#a855f7' },
    { label: 'Пользователи', value: '7', symbol: '👥', color: '#22c55e' },
];

const CASE_TOTALS = [
    { label: 'Открытые случаи', value: 5, max: 5, color: '#3b82f6' },
    { label: 'Просрочено SLA', value: 0, max: 5, color: '#f59e0b' },
    { label: 'Закрыто', value: 0, max: 5, color: '#22c55e' },
    { label: 'Критические', value: 1, max: 5, color: '#ef4444' },
];

const RISK_LEVELS = [
    { label: 'Критическая', value: 1, color: '#ef4444' },
    { label: 'Низкая', value: 1, color: '#22c55e' },
    { label: 'Средняя', value: 3, color: '#f59e0b' },
];

const VIOLATIONS = [
    { label: 'Нарушение инструкций по технике безопасности', value: 2, color: '#f59e0b' },
    { label: 'Нарушение требований пожарной безопасности', value: 1, color: '#f59e0b' },
    { label: 'Нарушение инструкций по охране труда', value: 1, color: '#f59e0b' },
    { label: 'Без СИЗ', value: 1, color: '#f59e0b' },
];

const STATUSES = [
    { label: 'В работе HR', value: 2, color: '#3b82f6' },
    { label: 'Направлено в HR', value: 2, color: '#22c55e' },
    { label: 'Черновик', value: 1, color: '#94a3b8' },
];

const CHART_LABELS = ['29.04', '30.04', '01.05', '02.05', '03.05', '04.05', '05.05'];
const CHART_TOTAL = [1, 1, 2, 2, 3, 4, 5];
const CHART_CRITICAL = [0, 0, 0, 0, 0, 1, 1];

interface Row {
    date: string;
    site: string;
    type: string;
    level: 'Критическая' | 'Средняя' | 'Низкая';
    status: string;
}

const ROWS: Row[] = [
    { date: '04.04, 11:00', site: 'Центральный Аппарат Управления', type: 'Нарушение инструкций по технике безопасности', level: 'Критическая', status: 'В работе HR' },
    { date: '04.04, 11:00', site: 'Центральный Аппарат Управления', type: 'Нарушение инструкций по технике безопасности', level: 'Низкая', status: 'Направлено в HR' },
    { date: '05.05, 10:00', site: 'Центральный Аппарат Управления', type: 'Нарушение требований пожарной безопасности', level: 'Средняя', status: 'Направлено в HR' },
    { date: '22.04, 19:01', site: 'Центральный Аппарат Управления', type: 'Нарушение инструкций по охране труда', level: 'Средняя', status: 'В работе HR' },
    { date: '22.04, 19:01', site: 'Чирчик', type: 'Без СИЗ', level: 'Средняя', status: 'Черновик' },
];

const levelColor = (l: Row['level']) => l === 'Критическая' ? C.down : l === 'Средняя' ? '#f59e0b' : C.up;

/* ── Yordamchi komponentlar ── */

const SectionCard: React.FC<{ title: string; icon?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {icon && <span>{icon}</span>}{title}
        </div>
        {children}
    </div>
);

const MiniBar: React.FC<{ label: string; value: number; max: number; color: string; rightAlignValue?: boolean }> = ({ label, value, max, color }) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(max ? (value / max) * 100 : 0), 60);
        return () => clearTimeout(t);
    }, [value, max]);
    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>{label}</span>
                <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{value}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

const LevelPill: React.FC<{ l: Row['level'] }> = ({ l }) => {
    const color = levelColor(l);
    return (
        <span style={{ color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {l}
        </span>
    );
};

const HseSlaBig: React.FC = () => {
    const navigate = useNavigate();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const maxRisk = Math.max(...RISK_LEVELS.map((s) => s.value), 1);
    const maxViolation = Math.max(...VIOLATIONS.map((s) => s.value), 1);
    const maxStatus = Math.max(...STATUSES.map((s) => s.value), 1);

    const chartData = useMemo(() => ({
        labels: CHART_LABELS,
        datasets: [
            { label: 'Всего', data: CHART_TOTAL, borderColor: '#4fb3d9', backgroundColor: '#4fb3d922', borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: '#4fb3d9', fill: true },
            { label: 'Критические', data: CHART_CRITICAL, borderColor: C.down, backgroundColor: `${C.down}22`, borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: C.down, fill: true },
        ],
    }), []);

    const chartOptions = {
        ...chartBase,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } },
            y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } }, beginAtZero: true },
        },
    } as any;

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#4fb3d9', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>HSE контроль и SLA</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/*<span style={{ color: C.sub, fontSize: 11 }}>{now.toLocaleDateString('ru-RU')}, {now.toLocaleTimeString('ru-RU')}</span>*/}
                    <button
                        onClick={() => navigate('/main/hse')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            background: 'linear-gradient(135deg, #1e4d7b, #0ea8c7)', border: 'none', borderRadius: 8,
                            color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px',
                            boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                        Подробнее
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'flex', gap: 8 }}>
                {KPI_ITEMS.map((k) => (
                    <div key={k.label} style={{ flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 13px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Badge symbol={k.symbol} color={k.color} />
                            <span style={{ color: C.sub, fontSize: 11.5 }}>{k.label}</span>
                        </div>
                        <div>
                            <span style={{ color: C.text, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{k.value}</span>
                            <div style={{ color: C.sub, fontSize: 10.5, marginTop: 4 }}>{k.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Asosiy 3 ustunli qism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 8, alignItems: 'stretch' }}>

                {/* Площадки / случаи HSE */}
                <SectionCard title="Площадки / случаи HSE" style={{ height: 340 }}>
                    <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
                        {SITES.map((s) => (
                            <div key={s.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                <span style={{ color: '#4fb3d9', marginRight: 6, flexShrink: 0 }}>📍</span>
                                <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
                                <span style={{ color: C.sub, fontWeight: 600 }}>{s.value}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
                        <span style={{ color: '#f59e0b', marginRight: 6 }}>🗂</span>
                        <span style={{ color: C.text, flex: 1 }}>Площадок в справочнике</span>
                        <span style={{ color: C.text, fontWeight: 700 }}>13</span>
                    </div>
                </SectionCard>

                {/* Сводка Guard из реестра */}
                <SectionCard title="Сводка Guard из реестра" style={{ height: 340 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 12px', marginBottom: 8 }}>
                        <Badge symbol="👤" color="#0ea8c7" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Персонал под HSE-контролем</div>
                            <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>945 сотрудников</div>
                            <div style={{ color: C.sub, fontSize: 10.5, marginTop: 2 }}>13 площадок • 70 отделов • 7 пользователей</div>
                        </div>
                        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
                            <div style={{ color: '#4fb3d9', fontSize: 16, fontWeight: 700 }}>5</div>
                            <div style={{ color: C.sub, fontSize: 9 }}>HSE</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                        {MINI_STATS.map((m) => (
                            <div key={m.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', minWidth: 0 }}>
                                <div style={{ fontSize: 12 }}>{m.symbol}</div>
                                <div style={{ color: C.text, fontSize: 13, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.value}</div>
                                <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase' }}>{m.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
                        {CASE_TOTALS.map((c) => (
                            <MiniBar key={c.label} label={c.label} value={c.value} max={c.max} color={c.color} />
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, flex: 1, minHeight: 0 }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>▲</span>Уровни риска
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {RISK_LEVELS.map((r) => (
                                    <MiniBar key={r.label} label={r.label} value={r.value} max={maxRisk} color={r.color} />
                                ))}
                            </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>⚑</span>Типы нарушений
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {VIOLATIONS.map((v) => (
                                    <MiniBar key={v.label} label={v.label} value={v.value} max={maxViolation} color={v.color} />
                                ))}
                            </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span>☰</span>Статусы
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {STATUSES.map((s) => (
                                    <MiniBar key={s.label} label={s.label} value={s.value} max={maxStatus} color={s.color} />
                                ))}
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* График случаев HSE */}
                <SectionCard title="График случаев HSE" style={{ height: 340 }}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.sub }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4fb3d9' }} />Всего
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.sub }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.down }} />Критические
                        </span>
                    </div>
                </SectionCard>
            </div>

            {/* Jadval */}
            <SectionCard title="Последние случаи HSE">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ color: C.sub, textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Дата</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Площадка</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Тип</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Уровень</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((r, idx) => (
                            <tr key={idx} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '6px 6px', color: C.sub, whiteSpace: 'nowrap' }}>{r.date}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{r.site}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{r.type}</td>
                                <td style={{ padding: '6px 6px' }}><LevelPill l={r.level} /></td>
                                <td style={{ padding: '6px 6px', color: C.sub, textAlign: 'right', whiteSpace: 'nowrap' }}>{r.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </SectionCard>
        </div>
    );
};

export default HseSlaBig;
