import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTH_COLORS, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, Badge, Gauge, DashHeader, DashFooter, DashRoot,
} from './dashboardUI';
import { GC, alpha } from '../theme/palette';

/* Xarajat moddalari (mlrd so'm) — mock */
const COSTS = [
    { name: 'Xom ashyo', symbol: 'X', color: GC.blue, value: 58.4, plan: 56.0, delta: 6.2, eff: 88.5, dyn: [9.2, 9.4, 9.6, 9.9, 10.2, 10.1] },
    { name: 'Elektr energiya', symbol: '⚡', color: GC.amber, value: 32.6, plan: 30.0, delta: 8.4, eff: 82.1, dyn: [5.1, 5.2, 5.4, 5.5, 5.7, 5.7] },
    { name: 'Tabiiy gaz', symbol: 'G', color: GC.green, value: 18.2, plan: 18.0, delta: 3.1, eff: 90.3, dyn: [2.9, 2.95, 3.0, 3.05, 3.15, 3.15] },
    { name: 'Ish haqi', symbol: 'H', color: GC.violet, value: 21.4, plan: 21.0, delta: 4.5, eff: 94.0, dyn: [3.4, 3.45, 3.55, 3.6, 3.7, 3.7] },
    { name: "Yoqilg'i", symbol: 'Y', color: GC.cyan, value: 7.8, plan: 8.2, delta: -2.2, eff: 79.6, dyn: [1.25, 1.28, 1.3, 1.31, 1.33, 1.33] },
    { name: 'Boshqa', symbol: '•••', color: GC.slate, value: 4.4, plan: 4.6, delta: 1.0, eff: 85.2, dyn: [0.7, 0.71, 0.73, 0.74, 0.76, 0.76] },
];
const TOTAL = COSTS.reduce((s, c) => s + c.value, 0);
const ELEC = [6.1, 6.2, 6.4, 6.6, 6.7, 6.6];
const GAS = [1.9, 2.0, 2.05, 2.1, 2.15, 2.2];
const STAFF = [3380, 3410, 3440, 3460, 3470, 3480];
const MONTHLY = [22.6, 23.0, 23.4, 23.9, 24.6, 25.3];
const COMPARE = '01.01 - 19.06.2024 bilan solishtirganda';

const ExpensesDashboard: React.FC = () => {
    const totalPlan = COSTS.reduce((s, c) => s + c.plan, 0);

    const donutData = {
        labels: COSTS.map((c) => c.name),
        datasets: [{ data: COSTS.map((c) => c.value), backgroundColor: COSTS.map((c) => c.color), borderColor: C.card, borderWidth: 2 }],
    };
    const lineData = {
        labels: MONTHS,
        datasets: COSTS.map((c) => ({ label: c.name, data: c.dyn, borderColor: c.color, backgroundColor: c.color, borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: c.color })),
    };
    const shopData = {
        labels: COSTS.map((c, i) => `${i + 1}-sex`),
        datasets: MONTHS.map((mo, mi) => ({ label: mo, data: COSTS.map((c) => +(c.value * MONTHLY[mi] / TOTAL).toFixed(2)), backgroundColor: MONTH_COLORS[mi], stack: 's', borderWidth: 0 })),
    };
    const elecBar = { labels: MONTHS, datasets: [{ data: ELEC, backgroundColor: GC.amber, borderRadius: 4, barPercentage: 0.6 }] };
    const gasBar = { labels: MONTHS, datasets: [{ data: GAS, backgroundColor: GC.blue, borderRadius: 4, barPercentage: 0.6 }] };
    const staffBar = { labels: MONTHS, datasets: [{ data: STAFF, backgroundColor: GC.green, borderRadius: 4, barPercentage: 0.6 }] };

    return (
        <DashRoot>
            <DashHeader title="Ishlab chiqarish xarajatlari" subtitle="Xarajatlar dashboardi" dateRange="01.01.2025 - 19.06.2025" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard title="Umumiy xarajat" value={`${fmt(TOTAL)} mlrd so'm`} delta={5.8} compare={COMPARE}
                    badge={<div style={{ width: 34, height: 34, borderRadius: '50%', background: alpha(GC.red, 0.13), color: GC.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>₮</div>} />
                <KpiCard title="Elektr energiya" value="38,6 mln kWt·s" delta={8.4} compare={COMPARE} badge={<Badge symbol="⚡" color={GC.amber} />} />
                <KpiCard title="Tabiiy gaz" value="12,4 mln m³" delta={3.1} compare={COMPARE} badge={<Badge symbol="G" color={GC.green} />} />
                <KpiCard title="Yoqilg'i (dizel)" value="1 240 t" delta={-2.2} compare={COMPARE} badge={<Badge symbol="Y" color={GC.cyan} />} />
                <KpiCard title="Suv sarfi" value="860 ming m³" delta={1.4} compare={COMPARE} badge={<Badge symbol="S" color={GC.blue} />} />
                <KpiCard title="Xodimlar soni" value="3 480 kishi" delta={2.1} compare={COMPARE} badge={<Badge symbol="👤" color={GC.violet} />} />
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                <Card title="Xarajatlar tarkibi, mlrd so'm">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(TOTAL)}`, "mlrd so'm")]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {COSTS.map((c) => (
                                <div key={c.name} style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(c.value)}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>{fmt(c.value / TOTAL * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Xarajat dinamikasi, mlrd so'm">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={lineData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </Card>

                <Card title="Sexlar bo'yicha xarajat, mlrd so'm">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={shopData} options={{ ...chartBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } } } } as any} />
                    </div>
                </Card>

                <Card title="Xarajat moddalari bo'yicha reja/fakt">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 4px', fontWeight: 500 }}>Modda</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Reja</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Fakt</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>%</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Chetl.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COSTS?.slice(0, 4)?.map((c) => {
                                const dev = c.value - c.plan; const over = dev > 0;
                                return (
                                    <tr key={c.name} style={{ borderTop: `1px solid ${C.border}` }}>
                                        <td style={{ padding: '4px 4px', color: C.text }}>{c.name}</td>
                                        <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(c.plan)}</td>
                                        <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(c.value)}</td>
                                        <td style={{ padding: '4px 4px', textAlign: 'right', color: over ? C.down : C.up }}>{fmt(c.value / c.plan * 100)}%</td>
                                        <td style={{ padding: '4px 4px', textAlign: 'right', color: over ? C.down : C.up }}>{over ? '+' : ''}{fmt(dev)}</td>
                                    </tr>
                                );
                            })}
                            <tr style={{ borderTop: `2px solid ${C.border}`, fontWeight: 700 }}>
                                <td style={{ padding: '4px 4px', color: C.text }}>Jami</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(totalPlan)}</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(TOTAL)}</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.down }}>{fmt(TOTAL / totalPlan * 100)}%</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.down }}>+{fmt(TOTAL - totalPlan)}</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>

                <Card title="Elektr energiya sarfi, mln kWt·s">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={elecBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>

                <Card title="Tabiiy gaz sarfi, mln m³">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={gasBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(2)]} />
                    </div>
                </Card>

                <Card title="Jalb qilingan xodimlar, kishi">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={staffBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: false } }) } as any} plugins={[barLabel(0)]} />
                    </div>
                </Card>

                <Card title="Resurslardan foydalanish samaradorligi, %">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: 1, minHeight: 0 }}>
                        {COSTS.slice(0, 4)?.map((c) => (<Gauge key={c.name} label={c.name} value={c.eff} color={c.color} />))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Rejalashtirilgan resursdan samarali foydalanish darajasi</div>
                </Card>
            </div>

            {/*<DashFooter left="Ma'lumotlar yangilangan: 19.06.2025 10:33" right="Pul qiymatlari mlrd so'mda ko'rsatilgan" />*/}
        </DashRoot>
    );
};

export default ExpensesDashboard;
