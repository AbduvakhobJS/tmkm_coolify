import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, axisLarge, legendLarge, bigBarLabel,
    bigCenterText, bigDonutBoxStyle, BigLabelRow, BigLabelStack,
} from '../../components/dashboardUILarge';
import investingData from './investingDemoData.json';
import { useGetAllInvesting } from '../../hooks/investing';
import { GC } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   INVESTITSIYA DASTURI

   Uslub MetalsDashboardMain bilan bir xil: `BigDashRoot` + `DashHeader` +
   `BigKpiCard` qatori + 3x2 `BigCard` to'ri — ekran to'liq to'ladi, scroll yo'q.

   MA'LUMOT: investitsiya loyihalari kesimida alohida API yo'q
   (`useGetAllInvesting` — `/factory/all/`, ya'ni zavodlar ro'yxati, bu ekranga
   mos kelmaydi). Shu sabab ko'rsatkichlar namuna ma'lumotdan quriladi va
   kartalar SARIQ ramka bilan belgilanadi.
   ══════════════════════════════════════════════════════════════════════════ */

type InvestingData = typeof investingData;
const DATA = investingData as InvestingData;
const FUND_COLORS = DATA.fundingColors;

/** Namuna kartalar uchun sariq ramka. */
const demoCardStyle: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

const fmt1 = (n: number): string => n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/* Sun'iy intellekt prognozlari — manbada model yo'q, namuna. */
const AI_FORECASTS: { text: string; detail: string; confidence: number; color: string }[] = [
    { text: "Yillik reja 4-chorakda bajariladi", detail: '4-chorak rejasi 98,5 mln $', confidence: 63, color: GC.amber },
    { text: 'Jamg\'arma mablag\'lari to\'liq o\'zlashtiriladi', detail: "Ulushi 87,2% — asosiy manba", confidence: 79, color: GC.green },
    { text: "«Miskon» loyihasida kechikish xavfi", detail: '3-chorak fakti rejadan past', confidence: 54, color: GC.amber },
    { text: 'Xorijiy investitsiya ulushi oshadi', detail: "Yangi kredit liniyalari", confidence: 71, color: GC.accent1 },
];

const Investing: React.FC = () => {
    /* Endpoint bu ekranga mos ma'lumot bermaydi, lekin ulanish holatini
       kuzatish uchun chaqiruv saqlanadi. */
    useGetAllInvesting();

    const projects = DATA.projects;
    const execPct = (DATA.totals.yearFact / DATA.totals.yearPlan) * 100;

    /* ── Moliyalashtirish manbalari donuti ── */
    const fundingDonut = {
        labels: DATA.fundingSources.map((f) => f.label),
        datasets: [{
            data: DATA.fundingSources.map((f) => f.value),
            backgroundColor: DATA.fundingSources.map((f) => f.color),
            borderWidth: 0,
        }],
    };

    /* ── Choraklar bo'yicha reja/fakt ── */
    const quarterBars = {
        labels: DATA.quarterLabels,
        datasets: [
            { label: 'Reja', data: DATA.totals.quartersPlan, backgroundColor: GC.accent3, borderRadius: 4, barPercentage: 0.7 },
            { label: 'Fakt', data: DATA.totals.quartersActual, backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.7 },
        ],
    };

    /* ── Loyihalar bo'yicha yillik reja (eng yiriklari tepada) ── */
    const projectBars = useMemo(() => {
        const sorted = [...projects].sort((a, b) => b.yearPlan - a.yearPlan);
        return {
            labels: sorted.map((p) => p.name.length > 34 ? `${p.name.slice(0, 33)}…` : p.name),
            datasets: [{
                data: sorted.map((p) => p.yearPlan),
                backgroundColor: sorted.map((p) => p.color),
                borderRadius: 4,
                barPercentage: 0.75,
            }],
        };
    }, [projects]);

    /* ── O'zlashtirishning to'planib borishi (kumulyativ reja va fakt) ── */
    const cumulative = useMemo(() => {
        const cum = (arr: number[]) => arr.reduce<number[]>((acc, v, i) => [...acc, (acc[i - 1] ?? 0) + v], []);
        return {
            labels: DATA.quarterLabels,
            datasets: [
                { label: 'Reja (jami)', data: cum(DATA.totals.quartersPlan), borderColor: GC.accent3, backgroundColor: `${GC.accent3}33`, borderWidth: 2, tension: 0.35, pointRadius: 3, fill: false },
                { label: 'Fakt (jami)', data: cum(DATA.totals.quartersActual), borderColor: GC.accent1, backgroundColor: `${GC.accent1}33`, borderWidth: 2, tension: 0.35, pointRadius: 3, fill: true },
            ],
        };
    }, []);

    /* ── Loyihalar bajarilishi (fakt/reja %) ── */
    const projectProgress = useMemo(() => projects.map((p) => {
        const fact = p.quartersActual.reduce((s, v) => s + v, 0);
        const pct = p.yearPlan ? (fact / p.yearPlan) * 100 : 0;
        return { name: p.name, color: p.color, pct, fact, plan: p.yearPlan };
    }).sort((a, b) => b.pct - a.pct), [projects]);

    return (
        <BigDashRoot>
            <DashHeader
                title="Investitsiya dasturi — o'zlashtirish"
                subtitle={DATA.meta.titleLine2}
                dateRange={DATA.meta.periodLabel}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Loyihalar soni" value={String(DATA.kpi.projectsCount)} iconColor={GC.accent1} />
                <BigKpiCard title="Umumiy qiymati, mln $" value={fmt1(DATA.kpi.totalValue)} iconColor={GC.accent2} />
                <BigKpiCard title="Yillik reja, mln $" value={fmt1(DATA.kpi.yearPlan)} iconColor={GC.accent3} />
                <BigKpiCard title="Fakt, mln $" value={fmt1(DATA.kpi.yearFact)} delta={execPct - 100} iconColor={GC.green} />
                <BigKpiCard title="Bajarilish" value={`${fmt1(execPct)}%`} iconColor={execPct >= 80 ? GC.green : GC.amber} />
                <BigKpiCard title="Qolgan, mln $" value={fmt1(DATA.totals.yearPlan - DATA.totals.yearFact)} iconColor={GC.amber} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10,
            }}>
                {/* 1 — Moliyalashtirish manbalari */}
                <BigCard title="Moliyalashtirish manbalari, mln $" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
                        <div style={{ flex: '0 0 50%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', overflowY: 'auto' }}>
                            {DATA.fundingSources.map((f) => (
                                <BigLabelStack
                                    key={f.label}
                                    label={f.label}
                                    color={f.color}
                                    value={`${fmt1(f.value)} mln $`}
                                    sub={`${fmt1(f.pct)}%`}
                                />
                            ))}
                        </div>
                        <div style={bigDonutBoxStyle}>
                            <Doughnut
                                data={fundingDonut}
                                options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                plugins={[bigCenterText(fmt1(DATA.kpi.totalValue), 'mln $')]}
                            />
                        </div>
                    </div>
                </BigCard>

                {/* 2 — Choraklar bo'yicha reja/fakt */}
                <BigCard title="Choraklar bo'yicha reja va fakt, mln $" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={quarterBars}
                            options={{
                                ...chartBase,
                                plugins: legendLarge('top'),
                                scales: axisLarge({ y: { beginAtZero: true } }),
                            } as any}
                            plugins={[bigBarLabel(1)]}
                        />
                    </div>
                </BigCard>

                {/* 3 — Loyihalar bo'yicha yillik reja */}
                <BigCard title="Loyihalar bo'yicha yillik reja, mln $" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={projectBars}
                            options={{
                                ...chartBase, indexAxis: 'y', ...noLegend,
                                scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 4 — Kumulyativ o'zlashtirish */}
                <BigCard title="O'zlashtirishning to'planishi, mln $" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line
                            data={cumulative}
                            options={{
                                ...chartBase,
                                plugins: legendLarge('top'),
                                scales: axisLarge({ y: { beginAtZero: true } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 5 — Loyihalar bajarilishi */}
                <BigCard title="Loyihalar bajarilishi (fakt / reja)" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 6, overflow: 'hidden' }}>
                        {projectProgress.map((p) => {
                            const color = p.pct >= 80 ? GC.green : p.pct >= 40 ? GC.accent1 : p.pct > 0 ? GC.amber : GC.slate;
                            return (
                                <div key={p.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                        <span style={{ color: C.text, fontSize: 'clamp(10px, 2.1cqmin, 15px)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                        <span style={{ color: C.sub, fontSize: 'clamp(9px, 1.9cqmin, 13px)', flexShrink: 0 }}>{fmt1(p.fact)} / {fmt1(p.plan)}</span>
                                        <span style={{ color, fontWeight: 700, fontSize: 'clamp(10px, 2.1cqmin, 15px)', flexShrink: 0, width: 52, textAlign: 'right' }}>{fmt1(p.pct)}%</span>
                                    </div>
                                    <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min(p.pct, 100)}%`, height: '100%', borderRadius: 4, background: color }} />
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

export default Investing;
