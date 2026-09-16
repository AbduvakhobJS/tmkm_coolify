import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { C, fmt, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, axisLarge, legendLarge, bigBarLabel,
    bigCenterText, bigDonutBoxStyle, BigLabelRow, BigLabelStack,
} from '../../components/dashboardUILarge';
import treasuryData from './singleTreasuryDemoData.json';
import { GC } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   YAGONA G'AZNACHILIK — to'lov so'rovlari holati

   Uslub MetalsDashboardMain bilan bir xil: `BigDashRoot` + `DashHeader` +
   `BigKpiCard` qatori + 3x2 `BigCard` to'ri — ekran to'liq to'ladi, scroll yo'q.

   MA'LUMOT: g'aznachilik bo'yicha API yo'q, barcha ko'rsatkichlar namuna
   ma'lumotdan quriladi — shu sabab kartalar SARIQ ramka bilan belgilanadi.
   ══════════════════════════════════════════════════════════════════════════ */

const DATA = treasuryData;
type StatusKey = 'new' | 'inWork' | 'approved' | 'overdue';
const STATUS_ORDER: StatusKey[] = ['new', 'inWork', 'approved', 'overdue'];

const demoCardStyle: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

const fmt1 = (n: number): string => n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* So'nggi 9 haftalik dinamika — namuna. */
const WEEK_LABELS = ['1-h', '2-h', '3-h', '4-h', '5-h', '6-h', '7-h', '8-h', '9-h'];
const WEEK_INCOMING = [42, 51, 47, 58, 63, 55, 68, 72, 66];
const WEEK_APPROVED = [31, 38, 40, 44, 51, 47, 55, 61, 58];

/* Sun'iy intellekt prognozlari — namuna. */
const AI_FORECASTS: { text: string; detail: string; confidence: number; color: string }[] = [
    { text: "Muddati o'tgan so'rovlar kamayadi", detail: "Joriy sur'atda 2 hafta ichida −18%", confidence: 72, color: GC.green },
    { text: 'Kelgusi haftada ~70 ta yangi so\'rov', detail: 'Oxirgi 9 hafta trendi bo\'yicha', confidence: 81, color: GC.accent1 },
    { text: "Tasdiqlash o'rtacha 4,2 kun davom etadi", detail: 'Zam. raislar bosqichi eng uzun', confidence: 66, color: GC.accent2 },
    { text: 'Bir yo\'nalishda yuklama oshib ketmoqda', detail: "Turdibayev A. — 77 ta muddati o'tgan", confidence: 88, color: GC.red },
];

const SingleTreasury: React.FC = () => {
    const directions = DATA.directions;
    const statuses = DATA.statuses as Record<StatusKey, { label: string; color: string }>;
    const amounts = DATA.amounts as Record<StatusKey, number>;

    /* Holatlar bo'yicha so'rovlar soni (barcha yo'nalishlar yig'indisi). */
    const statusCounts = useMemo(() => {
        const acc: Record<StatusKey, number> = { new: 0, inWork: 0, approved: 0, overdue: 0 };
        directions.forEach((d) => {
            STATUS_ORDER.forEach((k) => { acc[k] += (d.counts as Record<StatusKey, number>)[k] ?? 0; });
        });
        return acc;
    }, [directions]);

    const totalCount = STATUS_ORDER.reduce((s, k) => s + statusCounts[k], 0);
    const totalAmount = STATUS_ORDER.reduce((s, k) => s + (amounts[k] ?? 0), 0);

    /* 1 — Holatlar bo'yicha donut */
    const statusDonut = {
        labels: STATUS_ORDER.map((k) => statuses[k].label),
        datasets: [{
            data: STATUS_ORDER.map((k) => statusCounts[k]),
            backgroundColor: STATUS_ORDER.map((k) => statuses[k].color),
            borderWidth: 0,
        }],
    };

    /* 2 — Yo'nalishlar bo'yicha summa */
    const directionBars = useMemo(() => {
        const sorted = [...directions].sort((a, b) => b.amount - a.amount);
        return {
            labels: sorted.map((d) => d.name.split(' ')[0]),
            datasets: [{
                data: sorted.map((d) => d.amount),
                backgroundColor: sorted.map((d) => d.color),
                borderRadius: 4,
                barPercentage: 0.7,
            }],
        };
    }, [directions]);

    /* 3 — Haftalik oqim */
    const weeklyFlow = {
        labels: WEEK_LABELS,
        datasets: [
            { label: 'Kelib tushgan', data: WEEK_INCOMING, borderColor: GC.accent1, backgroundColor: `${GC.accent1}33`, borderWidth: 2, tension: 0.35, pointRadius: 3, fill: true },
            { label: 'Tasdiqlangan', data: WEEK_APPROVED, borderColor: GC.green, backgroundColor: `${GC.green}33`, borderWidth: 2, tension: 0.35, pointRadius: 3, fill: false },
        ],
    };

    /* 4 — Kelishuv bosqichlari */
    const approvalBars = {
        labels: DATA.approvalStatus.map((a) => (a.label.length > 26 ? `${a.label.slice(0, 25)}…` : a.label)),
        datasets: [{
            data: DATA.approvalStatus.map((a) => a.value),
            backgroundColor: DATA.approvalStatus.map((a) => a.color),
            borderRadius: 4,
            barPercentage: 0.75,
        }],
    };

    return (
        <BigDashRoot>
            <DashHeader
                title={DATA.meta.title}
                subtitle={DATA.meta.subtitle}
                dateRange={DATA.meta.periodLabel}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Jami so'rovlar" value={String(totalCount)} iconColor={GC.accent1} />
                {STATUS_ORDER.map((k) => (
                    <BigKpiCard
                        key={k}
                        title={statuses[k].label}
                        value={String(statusCounts[k])}
                        iconColor={statuses[k].color}
                    />
                ))}
                <BigKpiCard title={`Jami summa, ${DATA.meta.unit}`} value={fmt1(totalAmount)} iconColor={GC.accent2} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10,
            }}>
                {/* 1 — Holatlar bo'yicha taqsimot */}
                <BigCard title="So'rovlar holati bo'yicha" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
                        <div style={{ flex: '0 0 46%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', overflow: 'hidden' }}>
                            {STATUS_ORDER.map((k) => (
                                <BigLabelStack
                                    key={k}
                                    label={statuses[k].label}
                                    color={statuses[k].color}
                                    value={`${statusCounts[k]} ta`}
                                    sub={`${fmt1(amounts[k] ?? 0)} ${DATA.meta.unit}`}
                                />
                            ))}
                        </div>
                        <div style={bigDonutBoxStyle}>
                            <Doughnut
                                data={statusDonut}
                                options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                plugins={[bigCenterText(String(totalCount), "so'rov")]}
                            />
                        </div>
                    </div>
                </BigCard>

                {/* 2 — Yo'nalishlar bo'yicha summa */}
                <BigCard title={`Yo'nalishlar bo'yicha summa, ${DATA.meta.unit}`} style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={directionBars}
                            options={{
                                ...chartBase, ...noLegend,
                                scales: axisLarge({ x: { ticks: { font: { size: 11 } } }, y: { beginAtZero: true } }),
                            } as any}
                            plugins={[bigBarLabel(1)]}
                        />
                    </div>
                </BigCard>

                {/* 3 — Haftalik oqim */}
                <BigCard title="Haftalik oqim — kelgan va tasdiqlangan" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line
                            data={weeklyFlow}
                            options={{
                                ...chartBase,
                                plugins: legendLarge('top'),
                                scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 4 — Kelishuv bosqichlari */}
                <BigCard title="Kelishuv bosqichlari bo'yicha" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={approvalBars}
                            options={{
                                ...chartBase, indexAxis: 'y', ...noLegend,
                                scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 5 — Yo'nalishlar bo'yicha yuklama */}
                <BigCard title="Yo'nalishlar bo'yicha yuklama" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 8, overflow: 'hidden' }}>
                        {directions.map((d) => {
                            const counts = d.counts as Record<StatusKey, number>;
                            const total = STATUS_ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0);
                            return (
                                <div key={d.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                            <span style={{
                                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'clamp(9px, 1.8cqmin, 12px)', fontWeight: 700, color: d.color,
                                                background: `${d.color}22`, border: `1px solid ${d.color}66`,
                                            }}>{d.initials}</span>
                                            <span style={{ color: C.text, fontSize: 'clamp(10px, 2.1cqmin, 15px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name.split(' ')[0]}</span>
                                        </span>
                                        <span style={{ color: C.sub, fontSize: 'clamp(9px, 1.9cqmin, 13px)', flexShrink: 0 }}>{total} ta · {fmt1(d.amount)} {DATA.meta.unit}</span>
                                    </div>
                                    {/* Holatlar ulushi — bitta stacked bar */}
                                    <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                                        {STATUS_ORDER.map((k) => (
                                            (counts[k] ?? 0) > 0 && (
                                                <div
                                                    key={k}
                                                    title={`${statuses[k].label}: ${counts[k]}`}
                                                    style={{ width: `${(counts[k] / total) * 100}%`, background: statuses[k].color }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </BigCard>

                {/* 6 — Sun'iy intellekt prognozlari */}
                <BigCard title="Sun'iy intellekt prognozlari" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 8, overflow: 'hidden' }}>
                        {AI_FORECASTS.map((f, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                                        <span style={{ color: C.text, fontSize: 'clamp(11px, 2.3cqmin, 16px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.text}</span>
                                    </span>
                                    <span style={{ color: f.color, fontWeight: 700, fontSize: 'clamp(11px, 2.3cqmin, 16px)', flexShrink: 0 }}>{f.confidence}%</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 3 }}>
                                    <div style={{ width: `${f.confidence}%`, height: '100%', borderRadius: 3, background: f.color }} />
                                </div>
                                <div style={{ color: C.sub, fontSize: 'clamp(9px, 1.9cqmin, 13px)', marginLeft: 17 }}>{f.detail}</div>
                            </div>
                        ))}
                    </div>
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default SingleTreasury;
