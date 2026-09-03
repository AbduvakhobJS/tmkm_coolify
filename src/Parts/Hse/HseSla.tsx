import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';

/* ── Mock ma'lumotlar (Guard HSE reyestri) ── */

interface Incident {
    time: string;
    site: string;
    event: string;
    severity: 'Критическая' | 'Средняя' | 'Низкая';
    overdue: boolean;
}

const STATUS_BREAKDOWN = [
    { label: 'В работе HR', value: 2, color: GC.blue },
    { label: 'Направлено в HR', value: 2, color: GC.green },
    { label: 'Черновик', value: 1, color: GC.slate },
];

const SEVERITY_BREAKDOWN = [
    { label: 'Критическая', value: 1, color: GC.red },
    { label: 'Средняя', value: 3, color: GC.amber },
    { label: 'Низкая', value: 1, color: GC.green },
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

const VIOLATIONS = [
    { name: 'Нарушение инструкций по технике безопасности', value: 2 },
    { name: 'Нарушение требований пожарной безопасности', value: 1 },
    { name: 'Нарушение инструкций по охране труда', value: 1 },
    { name: 'Без СИЗ', value: 1 },
];

const INCIDENTS: Incident[] = [
    { time: '04.04, 11:00', site: 'Центральный Аппарат Управления', event: 'Нарушение инструкций по технике безопасности', severity: 'Критическая', overdue: true },
    { time: '04.04, 11:00', site: 'Центральный Аппарат Управления', event: 'Нарушение инструкций по технике безопасности', severity: 'Низкая', overdue: true },
    { time: '05.05, 10:00', site: 'Центральный Аппарат Управления', event: 'Нарушение требований пожарной безопасности', severity: 'Средняя', overdue: true },
    { time: '22.04, 19:01', site: 'Центральный Аппарат Управления', event: 'Нарушение инструкций по охране труда', severity: 'Средняя', overdue: true },
    { time: '22.04, 19:01', site: 'Чирчик', event: 'Без СИЗ', severity: 'Средняя', overdue: false },
];

const SUMMARY = [
    { label: 'Всего случаев', value: '5' },
    { label: 'Открыто', value: '5' },
    { label: 'Завершено', value: '0' },
    { label: 'Просрочено', value: '4' },
    { label: 'Критические', value: '1' },
    { label: 'Площадки', value: '13' },
    { label: 'Сотрудники', value: '945' },
    { label: 'Статус API', value: 'данные получены' },
];

const API_FIELDS: { key: string; value: string; tag: string }[] = [
    { key: 'root', value: '11', tag: 'полей' },
    { key: 'ok', value: 'true', tag: 'значение' },
    { key: 'service', value: 'guard-platform', tag: 'значение' },
    { key: 'domain', value: 'guard.uzkmt.uz', tag: 'значение' },
    { key: 'generatedAt', value: '2026-07-07T13:20:50.797Z', tag: 'значение' },
    { key: 'cards', value: '4', tag: 'массив' },
    { key: 'cards[0]', value: '4', tag: 'полей' },
    { key: 'totals', value: '14', tag: 'полей' },
    { key: 'totals.totalCases', value: '5', tag: 'значение' },
    { key: 'totals.openCases', value: '0', tag: 'значение' },
    { key: 'totals.completedCases', value: '0', tag: 'значение' },
    { key: 'totals.overdueCases', value: '0', tag: 'значение' },
    { key: 'totals.totalTasks', value: '4', tag: 'значение' },
    { key: 'totals.openTasks', value: '4', tag: 'значение' },
    { key: 'totals.overdueTasks', value: '4', tag: 'значение' },
    { key: 'totals.criticalCases', value: '1', tag: 'значение' },
    { key: 'totals.sitesTotal', value: '13', tag: 'значение' },
    { key: 'totals.workersTotal', value: '945', tag: 'значение' },
    { key: 'objects', value: '8', tag: 'массив' },
    { key: 'objects[0]', value: '3', tag: 'полей' },
    { key: 'scheme', value: '5', tag: 'полей' },
    { key: 'scheme.sites', value: '13', tag: 'значение' },
];

type Filter = 'all' | 'open' | 'overdue' | 'critical';

const severityColor = (s: Incident['severity']) => s === 'Критическая' ? C.down : s === 'Средняя' ? GC.amber : C.up;

/* ── Kichik yordamchi komponentlar ── */

const SectionLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ color: C.text, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3 }}>{children}</div>
        {hint && <div style={{ color: C.sub, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{hint}</div>}
    </div>
);

const SectionCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        {children}
    </div>
);

const StatCard: React.FC<{ label: string; value: string; sub: string; color: string; active: boolean; onClick: () => void }> = ({ label, value, sub, color, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer',
            background: active ? `${color}14` : C.card,
            border: `1px solid ${active ? color : C.border}`,
            borderRadius: 12, padding: '10px 13px',
            transition: 'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
            transform: active ? 'translateY(-1px)' : 'none',
            boxShadow: active ? `0 8px 20px ${color}22` : 'none',
        }}
    >
        <div style={{ color: C.sub, fontSize: 11.5, marginBottom: 4 }}>{label}</div>
        <div style={{ color: active ? color : C.text, fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ color: C.sub, fontSize: 10.5, marginTop: 4 }}>{sub}</div>
    </button>
);

const ProgressRow: React.FC<{ name: string; value: number; max: number; color: string }> = ({ name, value, max, color }) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(max ? (value / max) * 100 : 0), 60);
        return () => clearTimeout(t);
    }, [value, max]);
    return (
        <div style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                <span style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>{name}</span>
                <span style={{ color: C.sub, fontWeight: 600, flexShrink: 0 }}>{value}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

const SeverityPill: React.FC<{ s: Incident['severity'] }> = ({ s }) => {
    const color = severityColor(s);
    return (
        <span style={{ color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {s}
        </span>
    );
};

const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

const HseSla: React.FC = () => {
    const [filter, setFilter] = useState<Filter>('all');
    const [now, setNow] = useState(() => new Date());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const filteredIncidents = useMemo(() => {
        if (filter === 'overdue') return INCIDENTS.filter((i) => i.overdue);
        if (filter === 'critical') return INCIDENTS.filter((i) => i.severity === 'Критическая');
        return INCIDENTS;
    }, [filter]);

    const handleCopy = (key: string, value: string) => {
        navigator.clipboard?.writeText(value).catch(() => {
            /* clipboard unavailable */
        });
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
    };

    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU');

    const statusDonut = {
        labels: STATUS_BREAKDOWN.map((s) => s.label),
        datasets: [{ data: STATUS_BREAKDOWN.map((s) => s.value), backgroundColor: STATUS_BREAKDOWN.map((s) => s.color), borderColor: C.card, borderWidth: 2 }],
    };
    const severityDonut = {
        labels: SEVERITY_BREAKDOWN.map((s) => s.label),
        datasets: [{ data: SEVERITY_BREAKDOWN.map((s) => s.value), backgroundColor: SEVERITY_BREAKDOWN.map((s) => s.color), borderColor: C.card, borderWidth: 2 }],
    };
    const totalCases = STATUS_BREAKDOWN.reduce((s, x) => s + x.value, 0);
    const maxSite = Math.max(...SITES.map((s) => s.value), 1);
    const maxViolation = Math.max(...VIOLATIONS.map((s) => s.value), 1);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ color: GC.cyan, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Guard · Инциденты и задачи</div>
                    <div style={{ color: C.text, fontSize: 21, fontWeight: 700, marginTop: 2 }}>HSE контроль и SLA</div>
                    <div style={{ color: C.sub, fontSize: 12, marginTop: 2, maxWidth: 560 }}>
                        Подробная оперативная сводка по HSE: случаи, критичность, статусы, SLA, площадки, объекты и последние события.
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ color: C.up, background: `${C.up}18`, border: `1px solid ${C.up}44`, borderRadius: 999, padding: '3px 11px', fontSize: 11, fontWeight: 700 }}>Нормальный режим</span>
                    <span style={{ color: C.sub, fontSize: 11 }}>{dateStr}, {timeStr}</span>
                </div>
            </div>

            {/* KPI qatorlari — filtrlash mumkin */}
            <div style={{ display: 'flex', gap: 8 }}>
                <StatCard label="Всего случаев" value="5" sub="в реестре Guard" color={GC.cyan} active={filter === 'all'} onClick={() => setFilter('all')} />
                <StatCard label="Открытые случаи" value="5" sub="0 закрыто" color={GC.blue} active={filter === 'open'} onClick={() => setFilter('open')} />
                <StatCard label="Просрочено SLA" value="4" sub="0 случаев / 4 задач" color={GC.amber} active={filter === 'overdue'} onClick={() => setFilter('overdue')} />
                <StatCard label="Критические" value="1" sub="по уровню риска" color={C.down} active={filter === 'critical'} onClick={() => setFilter('critical')} />
            </div>

            {/* Statuslar, kritiklik, plosщадкalar va buzilish turlari — bitta qatorda */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard style={{ height: 216 }}>
                    <SectionLabel hint="open / done / overdue">Статусы случаев HSE</SectionLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                            <Doughnut data={statusDonut} options={donutOptions} plugins={[centerText(String(totalCases), 'случаев')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {STATUS_BREAKDOWN.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 600 }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard style={{ height: 216 }}>
                    <SectionLabel hint="severity">Критичность</SectionLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                            <Doughnut data={severityDonut} options={donutOptions} plugins={[centerText(String(totalCases), 'случаев')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {SEVERITY_BREAKDOWN.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 600 }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>

                <SectionCard style={{ height: 216 }}>
                    <SectionLabel hint={`${SITES.length} объектов`}>Площадки и объекты</SectionLabel>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: 2 }}>
                        {SITES.map((s) => (
                            <ProgressRow key={s.name} name={s.name} value={s.value} max={maxSite} color={GC.cyan} />
                        ))}
                    </div>
                </SectionCard>

                <SectionCard style={{ height: 216 }}>
                    <SectionLabel hint="breakdown">Типы нарушений</SectionLabel>
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: 2 }}>
                        {VIOLATIONS.map((v) => (
                            <ProgressRow key={v.name} name={v.name} value={v.value} max={maxViolation} color={GC.amber} />
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* Guard umumiy ko'rsatkichlari */}
            <SectionCard>
                <SectionLabel>Итоговые показатели Guard</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                    {SUMMARY.map((s) => (
                        <div key={s.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 11px', minWidth: 0 }}>
                            <div style={{ color: C.sub, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>{s.label}</div>
                            <div style={{ color: C.text, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Oxirgi hodisalar */}
            <SectionCard>
                <SectionLabel hint={filter !== 'all' ? 'фильтр faol — tozalash uchun bosing' : undefined}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Последние инциденты
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                style={{ background: 'none', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 999, padding: '1px 8px', fontSize: 10, cursor: 'pointer' }}
                            >
                                ✕ фильтр: {filter === 'overdue' ? 'просрочено' : 'критические'}
                            </button>
                        )}
                    </span>
                </SectionLabel>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ color: C.sub, textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Время</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Объект</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500 }}>Событие</th>
                            <th style={{ padding: '4px 6px', fontWeight: 500, textAlign: 'right' }}>Уровень / статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIncidents.map((i, idx) => (
                            <tr key={idx} style={{ borderTop: `1px solid ${C.border}`, transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                <td style={{ padding: '6px 6px', color: C.sub, whiteSpace: 'nowrap' }}>{i.time}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{i.site}</td>
                                <td style={{ padding: '6px 6px', color: C.text }}>{i.event}</td>
                                <td style={{ padding: '6px 6px', textAlign: 'right' }}><SeverityPill s={i.severity} /></td>
                            </tr>
                        ))}
                        {filteredIncidents.length === 0 && (
                            <tr><td colSpan={4} style={{ padding: '10px 6px', color: C.sub, textAlign: 'center' }}>Ushbu filtr bo'yicha hodisa topilmadi</td></tr>
                        )}
                    </tbody>
                </table>
            </SectionCard>

            {/* API manba maydonlari */}
            <SectionCard>
                <SectionLabel hint="структура данных · bosib nusxa oling">API-поля источника</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
                    {API_FIELDS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => handleCopy(f.key, f.value)}
                            title="Nusxa olish uchun bosing"
                            style={{
                                textAlign: 'left', cursor: 'pointer', background: C.cardAlt,
                                border: `1px solid ${copiedKey === f.key ? GC.cyan : C.border}`,
                                borderRadius: 10, padding: '8px 10px', minWidth: 0, transition: 'border-color 0.15s ease',
                            }}
                        >
                            <div style={{ color: GC.cyan, fontSize: 10.5, fontFamily: 'monospace', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.key}</div>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.value}</div>
                            <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>
                                {copiedKey === f.key ? '✓ nusxalandi' : f.tag}
                            </div>
                        </button>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default HseSla;
