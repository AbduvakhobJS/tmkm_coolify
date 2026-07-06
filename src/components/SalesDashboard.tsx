import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTH_COLORS, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, Badge, Gauge, DashHeader, DashFooter, DashRoot,
} from './dashboardUI';

/* Sotuv ma'lumotlari (mock) */
const METALS = [
    { name: 'Molibden', symbol: 'Mo', color: '#3b82f6', sold: 2580.0, revenue: 178.4, profit: 52.6, margin: 29.5, delta: 6.1 },
    { name: 'Volfram', symbol: 'W', color: '#22c55e', sold: 2245.0, revenue: 132.6, profit: 34.8, margin: 26.2, delta: 4.2 },
    { name: 'Titan', symbol: 'Ti', color: '#f59e0b', sold: 1460.0, revenue: 78.2, profit: 18.4, margin: 23.5, delta: -1.4 },
    { name: 'Tantal', symbol: 'Ta', color: '#a855f7', sold: 958.0, revenue: 62.4, profit: 15.2, margin: 24.4, delta: 5.3 },
    { name: 'Niobiy', symbol: 'Nb', color: '#06b6d4', sold: 505.0, revenue: 24.8, profit: 5.1, margin: 20.6, delta: -3.6 },
    { name: 'Boshqalar', symbol: '•••', color: '#94a3b8', sold: 232.0, revenue: 9.8, profit: 2.3, margin: 23.5, delta: -4.1 },
];
const TOTAL_SOLD = METALS.reduce((s, m) => s + m.sold, 0);
const TOTAL_REV = METALS.reduce((s, m) => s + m.revenue, 0);
const TOTAL_PROFIT = METALS.reduce((s, m) => s + m.profit, 0);

const MONTHLY_SOLD = [1285, 1304, 1330, 1358, 1387, 1316];
const MONTHLY_REV = [76.2, 78.4, 80.1, 82.6, 85.3, 83.6];
const MONTHLY_PROFIT = [19.8, 20.4, 21.0, 21.8, 22.9, 22.5];
const MONTHLY_COST = MONTHLY_REV.map((r, i) => +(r - MONTHLY_PROFIT[i]).toFixed(1));

const MARKETS = [
    { name: 'Mahalliy', color: '#3b82f6', pct: 37.5 },
    { name: 'Xitoy', color: '#f59e0b', pct: 24.0 },
    { name: 'Yevropa', color: '#22c55e', pct: 18.5 },
    { name: 'MDH', color: '#a855f7', pct: 12.0 },
    { name: 'Boshqa', color: '#94a3b8', pct: 8.0 },
];
const COMPARE = '01.01 - 19.06.2024 bilan solishtirganda';

const SalesDashboard: React.FC = () => {
    const donutData = {
        labels: METALS.map((m) => m.name),
        datasets: [{ data: METALS.map((m) => m.sold), backgroundColor: METALS.map((m) => m.color), borderColor: C.card, borderWidth: 2 }],
    };
    const soldBar = { labels: MONTHS, datasets: [{ data: MONTHLY_SOLD, backgroundColor: '#2563eb', borderRadius: 4, barPercentage: 0.6 }] };
    const revStack = {
        labels: METALS.map((m) => m.name),
        datasets: MONTHS.map((mo, mi) => ({ label: mo, data: METALS.map((m) => +(m.revenue * MONTHLY_REV[mi] / TOTAL_REV).toFixed(1)), backgroundColor: MONTH_COLORS[mi], stack: 's', borderWidth: 0 })),
    };
    const revBar = { labels: MONTHS, datasets: [{ data: MONTHLY_REV, backgroundColor: '#a855f7', borderRadius: 4, barPercentage: 0.6 }] };
    const compareData = {
        labels: MONTHS,
        datasets: [
            { label: 'Xarajat', data: MONTHLY_COST, backgroundColor: '#ef4444', borderRadius: 3, barPercentage: 0.8, categoryPercentage: 0.7 },
            { label: 'Foyda', data: MONTHLY_PROFIT, backgroundColor: '#22c55e', borderRadius: 3, barPercentage: 0.8, categoryPercentage: 0.7 },
        ],
    };
    const marketsDonut = {
        labels: MARKETS.map((m) => m.name),
        datasets: [{ data: MARKETS.map((m) => m.pct), backgroundColor: MARKETS.map((m) => m.color), borderColor: C.card, borderWidth: 2 }],
    };

    return (
        <DashRoot>
            <DashHeader title="Mahsulot sotuvi" subtitle="Sotuv dashboardi" dateRange="01.01.2025 - 19.06.2025" />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard title="Umumiy sotuv hajmi" value={`${fmt(TOTAL_SOLD)} t`} delta={6.4} compare={COMPARE}
                    badge={<div style={{ width: 34, height: 34, borderRadius: '50%', background: '#22c55e22', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛒</div>} />
                <KpiCard title="Sotuvdan tushum" value={`${fmt(TOTAL_REV)} mlrd`} delta={8.1} compare={COMPARE} badge={<Badge symbol="₮" color="#a855f7" />} />
                <KpiCard title="Sof foyda" value={`${fmt(TOTAL_PROFIT)} mlrd`} delta={11.3} compare={COMPARE} badge={<Badge symbol="F" color="#22c55e" />} />
                <KpiCard title="Rentabellik" value={`${fmt(TOTAL_PROFIT / TOTAL_REV * 100)}%`} delta={1.8} compare={COMPARE} badge={<Badge symbol="%" color="#3b82f6" />} />
                <KpiCard title="Buyurtmalar" value="1 264 ta" delta={4.2} compare={COMPARE} badge={<Badge symbol="B" color="#f59e0b" />} />
                <KpiCard title="Eksport ulushi" value="62,5%" delta={3.5} compare={COMPARE} badge={<Badge symbol="E" color="#06b6d4" />} />
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                <Card title="Sotuv tarkibi metallar bo'yicha, tonna">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(TOTAL_SOLD)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {METALS.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 11.5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.sold)}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>{fmt(m.sold / TOTAL_SOLD * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Oylar bo'yicha sotuv hajmi, tonna">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={soldBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(0)]} />
                    </div>
                </Card>

                <Card title="Metallar bo'yicha tushum, mlrd so'm">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={revStack} options={{ ...chartBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } } } } as any} />
                    </div>
                </Card>

                <Card title="Metallar bo'yicha sotuv natijalari">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                        <thead>
                            <tr style={{ color: C.sub, textAlign: 'left' }}>
                                <th style={{ padding: '4px 4px', fontWeight: 500 }}>Metall</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Sotildi</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Tushum</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Foyda</th>
                                <th style={{ padding: '4px 4px', fontWeight: 500, textAlign: 'right' }}>Rent.%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {METALS.slice(0, 4)?.map((m) => (
                                <tr key={m.name} style={{ borderTop: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '4px 4px', color: C.text }}>{m.name}</td>
                                    <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(m.sold)}</td>
                                    <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(m.revenue)}</td>
                                    <td style={{ padding: '4px 4px', color: C.up, textAlign: 'right' }}>{fmt(m.profit)}</td>
                                    <td style={{ padding: '4px 4px', textAlign: 'right', color: C.text }}>{fmt(m.margin)}%</td>
                                </tr>
                            ))}
                            <tr style={{ borderTop: `2px solid ${C.border}`, fontWeight: 700 }}>
                                <td style={{ padding: '4px 4px', color: C.text }}>Jami</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(TOTAL_SOLD)}</td>
                                <td style={{ padding: '4px 4px', color: C.text, textAlign: 'right' }}>{fmt(TOTAL_REV)}</td>
                                <td style={{ padding: '4px 4px', color: C.up, textAlign: 'right' }}>{fmt(TOTAL_PROFIT)}</td>
                                <td style={{ padding: '4px 4px', textAlign: 'right', color: C.text }}>{fmt(TOTAL_PROFIT / TOTAL_REV * 100)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>

                <Card title="Foyda va xarajat taqqoslash, mlrd so'm">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={compareData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 9, boxHeight: 9, font: { size: 10 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </Card>

                <Card title="Bozorlar bo'yicha sotuv, %">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={marketsDonut} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText('62,5%', 'Eksport')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {MARKETS.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 6, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1 }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.pct)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Oylar bo'yicha tushum, mlrd so'm">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={revBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>

                <Card title="Metallar bo'yicha rentabellik, %">
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8, flex: 1, minHeight: 0 }}>
                        {METALS.slice(0, 4)?.map((m) => (<Gauge key={m.name} label={m.name} value={m.margin} color={m.color} />))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Har bir metall bo'yicha sof foyda ulushi</div>
                </Card>
            </div>

            {/*<DashFooter left="Ma'lumotlar yangilangan: 19.06.2025 10:35" right="Tushum va foyda mlrd so'mda, hajm tonnada (t)" />*/}
        </DashRoot>
    );
};

export default SalesDashboard;
