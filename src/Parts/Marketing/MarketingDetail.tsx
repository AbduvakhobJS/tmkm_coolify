import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText, Badge } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';

/* ── Mock ma'lumotlar (Маркетинг / Бренд / PR / Инвесторы — to'liq ko'rinish) ── */

const KPI_ITEMS = [
    { label: 'Индекс репутации бренда', value: '78.4', sub: '▲ 5.2', symbol: '⭐', color: GC.cyan },
    { label: 'Тональность публикаций', value: '68%', sub: 'позитив', symbol: '💬', color: GC.green },
    { label: 'Медиаохват', value: '256M', sub: '▲ 6.3%', symbol: '📡', color: GC.blue },
    { label: 'Доверие инвесторов', value: '82.1', sub: '▲ 6.3%', symbol: '🤝', color: GC.violet },
    { label: 'Посещаемость сайта', value: '128K', sub: '▲ 12.4%', symbol: '🌐', color: GC.cyan },
    { label: 'Активные партнёрства', value: '31', sub: '▲ 6', symbol: '🔗', color: GC.amber },
    { label: 'Мероприятия / форумы', value: '18', sub: '▲ 4', symbol: '📅', color: GC.magenta },
    { label: 'Статус системы', value: 'OK', sub: 'в норме', symbol: '✔', color: GC.green },
];

const REPUTATION = [
    { label: 'Индекс бренда', value: '78.4', delta: '▲ 5.2', symbol: '⭐' },
    { label: 'Share of voice', value: '12.6%', delta: '▲ 2.1 п.п.', symbol: '💬' },
    { label: 'Упоминания в мире', value: '18.7K', delta: '▲ 8.1%', symbol: '🌐' },
];

const MEDIA_CHANNELS = [
    { label: 'Онлайн СМИ', value: 42, color: GC.blue },
    { label: 'Социальные сети', value: 31, color: GC.cyan },
    { label: 'ТВ и радио', value: 18, color: GC.violet },
    { label: 'Печатные издания', value: 9, color: GC.amber },
];

const FUNNEL = [
    { label: 'Лиды инвесторов', value: 156, width: 100 },
    { label: 'Due diligence', value: 78, width: 78 },
    { label: 'NDA signed', value: 42, width: 56 },
    { label: 'MOU', value: 24, width: 40 },
    { label: 'Инвестпроекты', value: 9, width: 26 },
];

const EVENTS = [
    { name: 'TIIF 2026', date: '15–17 июн 2026' },
    { name: 'PDAC 2026', date: '1–4 мар 2026' },
    { name: 'Mining World Asia', date: '9–11 сен 2026' },
];

const CRISIS = [
    { label: 'Мониторинг 24/7', value: 'активно', color: C.up },
    { label: 'Репутационные события', value: '3', color: C.text },
    { label: 'Медиа-инциденты', value: '2', color: C.text },
    { label: 'Fake News', value: '1 под контролем', color: C.text },
];
const CRISIS_TOTAL = 18;

const DIGITAL_STATS = [
    { label: 'Посетители', value: '128K' },
    { label: 'Страны', value: '86' },
    { label: 'Page views', value: '312K' },
    { label: 'Bounce rate', value: '32%' },
];
const COUNTRIES = [
    { label: 'Узбекистан', value: '28%' },
    { label: 'Казахстан', value: '14%' },
    { label: 'США', value: '11%' },
    { label: 'Германия', value: '7%' },
];
const PAGES = [
    { label: '/investors', value: '18.7K' },
    { label: '/projects', value: '15.2K' },
    { label: '/sustainability', value: '12.9K' },
    { label: '/media', value: '10.1K' },
];

const AI_INSIGHTS = [
    { label: 'AI sentiment', value: 'Позитивный', color: C.up },
    { label: 'Investor sentiment', value: 'Позитивный', color: C.up },
    { label: 'ESG perception', value: 'Позитивный', color: C.up },
    { label: 'Market trend', value: 'Растущий', color: GC.cyan },
    { label: 'Репутационный риск', value: 'Низкий', color: C.up },
];

const SUMMARY = [
    { label: 'Репутационный индекс', value: '78.4', symbol: '🏅' },
    { label: 'Глобальные упоминания', value: '18.7K', symbol: '🌐' },
    { label: 'Лиды инвесторов', value: '156', symbol: '👥' },
    { label: 'ESG Score', value: 'A−', symbol: '🌱' },
    { label: 'Трафик сайта', value: '128K', symbol: '📈' },
    { label: 'Партнёрства', value: '31', symbol: '🔗' },
    { label: 'Среднее время ответа', value: '18 мин', symbol: '⏱' },
    { label: 'Brand equity', value: '84/100', symbol: '💎' },
    { label: 'Кампания', value: 'OK', symbol: '🚩' },
];

/* ── Yordamchi komponentlar (HSE komponentlari bilan bir xil uslub) ── */

const SectionCard: React.FC<{ title: string; icon?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ color: GC.cyan, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {icon && <span>{icon}</span>}{title}
        </div>
        {children}
    </div>
);

const MiniBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(max ? (value / max) * 100 : 0), 60);
        return () => clearTimeout(t);
    }, [value, max]);
    return (
        <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>{label}</span>
                <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{value}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

const MarketingDetail: React.FC = () => {
    const navigate = useNavigate();
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const crisisDonut = {
        labels: ['Активные'],
        datasets: [{ data: [CRISIS_TOTAL, 100 - CRISIS_TOTAL], backgroundColor: [C.up, 'rgba(255,255,255,0.06)'], borderColor: C.card, borderWidth: 2 }],
    };
    const donutOptions = { ...chartBase, cutout: '70%', ...noLegend } as any;

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge symbol="📊" color={GC.blue} />
                    <div>
                        <div style={{ color: GC.cyan, fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Маркетинг / Бренд / PR / Инвесторы</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2, maxWidth: 620 }}>
                            Сводный экран репутации, инвесторов, цифрового бренда и кризисных коммуникаций
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: C.sub, fontSize: 11 }}>{now.toLocaleDateString('ru-RU')}, {now.toLocaleTimeString('ru-RU')}</span>
                    <span style={{ color: C.up, background: `${C.up}18`, border: `1px solid ${C.up}44`, borderRadius: 999, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>Общий статус: на правильном пути</span>
                    <button
                        onClick={() => navigate('/main/marketing')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, border: 'none', borderRadius: 8,
                            color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px',
                            boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Назад
                    </button>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {KPI_ITEMS.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</div>
                        <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
                        <div style={{ color: k.symbol === '✔' ? C.up : C.sub, fontSize: 10.5 }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* 1-qator: reputatsiya / media kanallar / investorlar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>

                <SectionCard title="Центр контроля репутации" style={{ height: 260 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {REPUTATION.map((r) => (
                            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px' }}>
                                <Badge symbol={r.symbol} color={GC.cyan} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3 }}>{r.label}</div>
                                    <div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{r.value}</div>
                                </div>
                                <div style={{ color: C.up, fontSize: 10.5, fontWeight: 600, flexShrink: 0 }}>{r.delta}</div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Медиапокрытие по каналам" icon="📡" style={{ height: 260 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
                        {MEDIA_CHANNELS.map((m) => (
                            <MiniBar key={m.label} label={m.label} value={m.value} max={100} color={m.color} />
                        ))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 10.5, textAlign: 'center', marginTop: 8 }}>Доля упоминаний по типу канала за период</div>
                </SectionCard>

                <SectionCard title="Центр коммуникации с инвесторами" style={{ height: 260 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, marginBottom: 8 }}>
                        {FUNNEL.map((f) => (
                            <div key={f.label} style={{ width: `${f.width}%`, height: 14, borderRadius: 3, background: `linear-gradient(90deg, #1e4d7b, ${GC.cyan})` }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', flex: 1 }}>
                        {FUNNEL.map((f) => (
                            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                <span style={{ color: C.sub }}>{f.label}</span>
                                <span style={{ color: C.text, fontWeight: 700 }}>{f.value}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {EVENTS.map((e) => (
                                <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
                                    <span style={{ color: C.text }}>{e.name}</span>
                                    <span style={{ color: C.sub }}>{e.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* 2-qator: kризis / raqamli brend / AI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>

                <SectionCard title="Кризисные коммуникации" style={{ height: 236 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                            <Doughnut data={crisisDonut} options={donutOptions} plugins={[centerText(String(CRISIS_TOTAL), '')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                            {CRISIS.map((c) => (
                                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                    <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>{c.label}</span>
                                    <span style={{ color: c.color, fontWeight: 700, flexShrink: 0 }}>{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Шкала риска</div>
                        <div style={{ height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${GC.green}, ${GC.amber}, ${GC.amber}, ${GC.red})` }} />
                    </div>
                </SectionCard>

                <SectionCard title="Цифровой бренд и аналитика" style={{ height: 236 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                        {DIGITAL_STATS.map((d) => (
                            <div key={d.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', minWidth: 0 }}>
                                <div style={{ color: C.text, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.value}</div>
                                <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase' }}>{d.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, flex: 1, minHeight: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {COUNTRIES.map((c) => (
                                <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                    <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                                    <span style={{ color: C.sub, flexShrink: 0 }}>{c.value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {PAGES.map((p) => (
                                <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                    <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label}</span>
                                    <span style={{ color: C.sub, flexShrink: 0 }}>{p.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="AI Marketing Intelligence" style={{ height: 236 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: '50%', background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, boxShadow: '0 8px 20px rgba(14,168,199,0.35)' }}>
                            AI
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {AI_INSIGHTS.map((a) => (
                                <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                    <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 6 }}>{a.label}</span>
                                    <span style={{ color: a.color, fontWeight: 700, flexShrink: 0 }}>{a.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Yakuniy ko'rsatkichlar */}
            <SectionCard title="Сводные показатели">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 8 }}>
                    {SUMMARY.map((s) => (
                        <div key={s.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', minWidth: 0 }}>
                            <div style={{ fontSize: 12 }}>{s.symbol}</div>
                            <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
                            <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default MarketingDetail;
