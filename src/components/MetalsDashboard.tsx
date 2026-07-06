import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTH_COLORS, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, Badge, Gauge, DashHeader, DashFooter, DashRoot,
} from './dashboardUI';

/* Metall ishlab chiqarish (rasm ma'lumotlari, mock) */
const METALS = [
    { name: 'Molibden', symbol: 'Mo', color: '#3b82f6', value: 2650.4, pct: 32.1, delta: 6.8, plan: 2500, quality: 98.6, dyn: [812, 828, 845, 872, 918, 895] },
    { name: 'Volfram', symbol: 'W', color: '#22c55e', value: 2312.7, pct: 28.0, delta: 3.4, plan: 2250, quality: 97.9, dyn: [602, 624, 641, 663, 701, 688] },
    { name: 'Titan', symbol: 'Ti', color: '#f59e0b', value: 1498.6, pct: 18.2, delta: -1.2, plan: 1550, quality: 96.4, dyn: [378, 388, 398, 408, 421, 414] },
    { name: 'Tantal', symbol: 'Ta', color: '#a855f7', value: 987.3, pct: 12.0, delta: 5.1, plan: 950, quality: 98.1, dyn: [148, 153, 159, 164, 171, 167] },
    { name: 'Niobiy', symbol: 'Nb', color: '#06b6d4', value: 521.1, pct: 6.3, delta: -4.3, plan: 550, quality: 97.2, dyn: [84, 87, 89, 92, 96, 93] },
    { name: 'Boshqalar', symbol: '•••', color: '#94a3b8', value: 277.4, pct: 3.4, delta: -6.8, plan: 300, quality: 95.3, dyn: [44, 45, 46, 47, 49, 48] },
];
const TOTAL = 8247.5;
const MONTHLY = [1245.6, 1289.4, 1356.7, 1412.8, 1487.2, 1455.8];
const AVG_DAILY = [40.2, 46.0, 43.8, 47.1, 48.0, 48.5];
const COMPARE = '01.01 - 19.06.2024 bilan solishtirganda';

const MetalsDashboard: React.FC = () => {
    const totalPlan = METALS.reduce((s, m) => s + m.plan, 0);
    const totalFact = METALS.reduce((s, m) => s + m.value, 0);

    const donutData = {
        labels: METALS.map((m) => m.name),
        datasets: [{ data: METALS.map((m) => m.value), backgroundColor: METALS.map((m) => m.color), borderColor: C.card, borderWidth: 2 }],
    };
    const lineData = {
        labels: MONTHS,
        datasets: METALS.map((m) => ({ label: m.name, data: m.dyn, borderColor: m.color, backgroundColor: m.color, borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: m.color })),
    };
    const factoryData = {
        labels: METALS.map((m, i) => `${i + 1}-zavod`),
        datasets: MONTHS.map((mo, mi) => ({ label: mo, data: METALS.map((m) => +(m.value * MONTHLY[mi] / TOTAL).toFixed(1)), backgroundColor: MONTH_COLORS[mi], stack: 's', borderWidth: 0 })),
    };
    const monthlyBar = { labels: MONTHS, datasets: [{ data: MONTHLY, backgroundColor: '#2563eb', borderRadius: 4, barPercentage: 0.6 }] };
    const avgBar = { labels: MONTHS, datasets: [{ data: AVG_DAILY, backgroundColor: '#22c55e', borderRadius: 4, barPercentage: 0.6 }] };

    return (
        <DashRoot>
            <DashHeader title="Texnologik metallar ishlab chiqarish" subtitle="Ko'rsatkichlar dashboardi" dateRange="01.01.2025 - 19.06.2025" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard title="Umumiy ishlab chiqarish hajmi" value={`${fmt(TOTAL)} t`} delta={7.3} compare={COMPARE}
                    badge={<div style={{ width: 34, height: 34, borderRadius: '50%', background: '#22c55e22', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▤</div>} />
                {METALS.map((m) => (
                    <KpiCard key={m.name} title={m.name} value={`${fmt(m.value)} t`} delta={m.delta} compare={COMPARE} badge={<Badge symbol={m.symbol} color={m.color} />} />
                ))}
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                <Card title="Metallar bo'yicha ishlab chiqarish, tonna">
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
                                    <span style={{ color: C.sub, marginLeft: 4 }}>{fmt(m.pct)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Ishlab chiqarish dinamikasi, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={lineData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </Card>

                <Card title="Zavodlar bo'yicha ishlab chiqarish, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={factoryData} options={{ ...chartBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } } } } as any} />
                    </div>
                </Card>

                <Card title="Rejaning bajarilishi">
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
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(totalFact)}</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.up }}>{fmt(totalFact / totalPlan * 100)}%</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.up }}>+{fmt(totalFact - totalPlan)}</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>

                <Card title="Oylar bo'yicha ishlab chiqarish, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={monthlyBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>

                <Card title="Ishlab chiqarish tuzilmasi, %">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(TOTAL)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {METALS.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 6, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1 }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.pct)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="O'rtacha kunlik ishlab chiqarish, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={avgBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>

                <Card title="Mahsulot sifati (standartlarga muvofiqligi)">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: 1, minHeight: 0 }}>
                        {METALS?.slice(0, 4)?.map((m) => (<Gauge key={m.name} label={m.name} value={m.quality} />))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', marginTop: 12 }}>Sifat standartlariga mos mahsulot ulushi</div>
                </Card>
            </div>

            {/*<DashFooter left="Ma'lumotlar yangilangan: 19.06.2025 10:30" right="Barcha qiymatlar tonnada (t) ko'rsatilgan" />*/}
        </DashRoot>
    );
};

export default MetalsDashboard;
