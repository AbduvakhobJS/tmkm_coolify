import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTH_COLORS, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, Badge, Gauge, DashHeader, DashFooter, DashRoot,
} from './dashboardUI';
import { GC, alpha } from '../theme/palette';

/* Konsentrat qazib olish ma'lumotlari (mock) */
const METALS = [
    { name: 'Molibden', symbol: 'Mo', color: GC.blue, value: 2812.0, plan: 2700, delta: 5.2, recovery: 92.4, dyn: [452, 458, 468, 472, 482, 480] },
    { name: 'Volfram', symbol: 'W', color: GC.green, value: 2456.0, plan: 2400, delta: 2.8, recovery: 90.1, dyn: [396, 402, 408, 414, 420, 416] },
    { name: 'Titan', symbol: 'Ti', color: GC.amber, value: 1604.0, plan: 1650, delta: -1.6, recovery: 88.6, dyn: [258, 262, 266, 270, 276, 272] },
    { name: 'Tantal', symbol: 'Ta', color: GC.violet, value: 1042.0, plan: 1000, delta: 4.1, recovery: 91.3, dyn: [168, 170, 173, 176, 179, 176] },
    { name: 'Niobiy', symbol: 'Nb', color: GC.cyan, value: 548.0, plan: 580, delta: -3.2, recovery: 87.2, dyn: [88, 89, 91, 92, 94, 94] },
    { name: 'Boshqalar', symbol: '•••', color: GC.slate, value: 296.0, plan: 320, delta: -5.4, recovery: 85.5, dyn: [47, 48, 49, 50, 51, 51] },
];
const TOTAL = METALS.reduce((s, m) => s + m.value, 0);
const MONTHLY_ORE = [72.4, 76.8, 80.2, 84.6, 88.1, 84.4];
const ORE_SUM = MONTHLY_ORE.reduce((a, b) => a + b, 0);
const AVG_DAILY_ORE = [2.35, 2.48, 2.59, 2.72, 2.84, 2.72];
const COMPARE = '01.01 - 19.06.2024 bilan solishtirganda';

const ExtractionDashboard: React.FC = () => {
    const totalPlan = METALS.reduce((s, m) => s + m.plan, 0);

    const donutData = {
        labels: METALS.map((m) => m.name),
        datasets: [{ data: METALS.map((m) => m.value), backgroundColor: METALS.map((m) => m.color), borderColor: C.card, borderWidth: 2 }],
    };
    const lineData = {
        labels: MONTHS,
        datasets: METALS.map((m) => ({ label: m.name, data: m.dyn, borderColor: m.color, backgroundColor: m.color, borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: m.color })),
    };
    const mineData = {
        labels: METALS.map((m, i) => `${i + 1}-kon`),
        datasets: MONTHS.map((mo, mi) => ({ label: mo, data: METALS.map((m) => +(m.value * MONTHLY_ORE[mi] / ORE_SUM).toFixed(1)), backgroundColor: MONTH_COLORS[mi], stack: 's', borderWidth: 0 })),
    };
    const oreBar = { labels: MONTHS, datasets: [{ data: MONTHLY_ORE, backgroundColor: GC.blue, borderRadius: 4, barPercentage: 0.6 }] };
    const avgBar = { labels: MONTHS, datasets: [{ data: AVG_DAILY_ORE, backgroundColor: GC.green, borderRadius: 4, barPercentage: 0.6 }] };

    return (
        <DashRoot>
            <DashHeader title="Metallarni qazib chiqarish ko'rsatkichlari" subtitle="Qazib olish dashboardi" dateRange="01.01.2025 - 19.06.2025" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard title="Umumiy qazib olingan konsentrat" value={`${fmt(TOTAL)} t`} delta={4.6} compare={COMPARE}
                    badge={<div style={{ width: 34, height: 34, borderRadius: '50%', background: alpha(GC.green, 0.13), color: GC.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⛏</div>} />
                {METALS.map((m) => (
                    <KpiCard key={m.name} title={m.name} value={`${fmt(m.value)} t`} delta={m.delta} compare={COMPARE} badge={<Badge symbol={m.symbol} color={m.color} />} />
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                <Card title="Qazib olish tarkibi, tonna (konsentrat)">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(TOTAL)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {METALS.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.value)}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>{fmt(m.value / TOTAL * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Qazib olish dinamikasi, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={lineData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </Card>

                <Card title="Konlar bo'yicha qazib olish, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={mineData} options={{ ...chartBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } } } } as any} />
                    </div>
                </Card>

                <Card title="Qazib olish rejasining bajarilishi">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 4px', fontWeight: 500 }}>Metall</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Reja</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Fakt</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>%</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Chetl.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {METALS?.slice(0, 4)?.map((m) => {
                                const dev = m.value - m.plan; const ok = dev >= 0;
                                return (
                                    <tr key={m.name} style={{ borderTop: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '4px 4px', color: C.text }}>{m.name}</td>
                                        <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(m.plan)}</td>
                                        <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(m.value)}</td>
                                        <td style={{ padding: '4px 4px', textAlign: 'right', color: ok ? C.up : C.down }}>{fmt(m.value / m.plan * 100)}%</td>
                                        <td style={{ padding: '4px 4px', textAlign: 'right', color: ok ? C.up : C.down }}>{ok ? '+' : ''}{fmt(dev)}</td>
                                    </tr>
                                );
                            })}
                            <tr style={{ borderTop: `2px solid ${C.border}`, fontWeight: 700 }}>
                                <td style={{ padding: '4px 4px', color: C.text }}>Jami</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(totalPlan)}</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(TOTAL)}</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.up }}>{fmt(TOTAL / totalPlan * 100)}%</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.up }}>+{fmt(TOTAL - totalPlan)}</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>

                <Card title="Oylar bo'yicha qazib olingan ruda, ming t">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={oreBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>

                <Card title="Qazib olish tuzilmasi, %">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(TOTAL)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {METALS.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 6, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1 }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.value / TOTAL * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="O'rtacha kunlik qazib olish, ming t">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={avgBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(2)]} />
                    </div>
                </Card>

                <Card title="Metall ajratib olish darajasi (recovery), %">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: 1, minHeight: 0 }}>
                        {METALS.slice(0, 4)?.map((m) => (<Gauge key={m.name} label={m.name} value={m.recovery} color={m.color} />))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', marginTop: 12 }}>Rudadan foydali metallni ajratib olish ulushi</div>
                </Card>
            </div>

            {/*<DashFooter left="Ma'lumotlar yangilangan: 19.06.2025 10:31" right="Konsentrat — tonnada (t), ruda — ming tonnada" />*/}
        </DashRoot>
    );
};

export default ExtractionDashboard;
