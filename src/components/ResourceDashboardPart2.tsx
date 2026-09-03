import React, { useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    C, fmt, chartBase, noLegend, axis,
    barLabel, lineLabel, centerText,
    Card, Badge, Gauge, DashHeader, DashRoot,
} from './dashboardUI';
import PD from './resourceProfitDemoData.json';
import { GC } from '../theme/palette';

/* Oy nomlari — bu dashboard 4 oylik ma'lumot bilan ishlaydi (dashboardUI.MONTHS 6 oylik) */
const M = PD.monthsShort;

/* Aksent ranglar — MetalsDashboardMain paletrasi bilan bir xil uslubda:
   grafik seriyalari bitta ko'k oiladan, qizil/sariq/yashil esa faqat
   og'ish va status ko'rsatkichlari uchun qoldiriladi. */
const A = {
    revenue: GC.accent1,
    cost: GC.accent3,
    profit: GC.accent2,
    margin: GC.accent4,
    eff: GC.accent1,
    energy: GC.accent2,
    save: GC.accent3,
};
const COST_COLORS = [GC.accent1, GC.accent2, GC.accent3, GC.accent4];

/* x/y o'qlari — belgilar QIYA emas, doim GORIZONTAL */
const hAxis = (opts: any = {}) => {
    const a = axis(opts) as any;
    return {
        ...a,
        x: { ...a.x, ticks: { ...a.x.ticks, maxRotation: 0, minRotation: 0, autoSkip: false } },
    };
};

/* KpiCard (dashboardUI) bilan bir xil dizayn va o'lchamlar; yagona farqi —
   o'sish "yaxshi"mi yoki "yomon"mi ekanini alohida belgilash mumkin
   (masalan tannarxning o'sishi — yomon). Reja qiymati hover'da ko'rinadi. */
const KpiTile: React.FC<{
    title: string; value: string; delta: number; good: boolean;
    hint?: string; badge?: React.ReactNode;
}> = ({ title, value, delta, good, hint, badge }) => (
    <div title={hint} style={{
        flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '8px 13px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: C.sub, fontSize: 12, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            {badge}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ color: C.text, fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap' }}>{value}</span>
            <span style={{ color: good ? C.up : C.down, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {delta >= 0 ? '↑' : '↓'} {fmt(Math.abs(delta))}%
            </span>
        </div>
    </div>
);

const ResourceDashboardPart2: React.FC = () => {
    const eff = PD.efficiency;
    const p = PD.profit;
    const s = PD.monthlySummary;

    /* ── Tushum / tannarx / foyda dinamikasi ── */
    const dynamicsData = useMemo(() => ({
        labels: M,
        datasets: [
            { label: 'Tushum', data: p.monthly.revenue, backgroundColor: A.revenue, borderRadius: 4, barPercentage: 0.8 },
            { label: 'Tannarx', data: p.monthly.cost, backgroundColor: A.cost, borderRadius: 4, barPercentage: 0.8 },
            { label: 'Foyda', data: p.monthly.profit, backgroundColor: A.profit, borderRadius: 4, barPercentage: 0.8 },
        ],
    }), [p.monthly]);

    /* ── Tannarx tarkibi ── */
    const costLabels = p.costDistribution.labels.map(l => l.split(':')[0]);
    const costDonut = {
        labels: costLabels,
        datasets: [{ data: p.costDistribution.data, backgroundColor: COST_COLORS, borderColor: C.cardAlt, borderWidth: 2 }],
    };

    /* ── 1 tonnaga energiya sarfi ── */
    const energyLine = {
        labels: M,
        datasets: [{
            data: eff.energyPerTon.data, borderColor: A.energy, backgroundColor: `${A.energy}22`,
            borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3,
            pointBackgroundColor: eff.energyPerTon.data.map((_, i) => (i === eff.energyPerTon.warnIdx ? C.down : A.energy)),
        }],
    };

    /* ── CO₂ chiqindisi ── */
    const worstCo2 = Math.max(...eff.co2.data);
    const co2Bar = {
        labels: M,
        datasets: [{
            data: eff.co2.data,
            /* Oddiy ustunlar — ko'k, faqat eng yomon oy qizil bilan ajratiladi. */
            backgroundColor: eff.co2.data.map(v => (v === worstCo2 ? C.down : GC.accent1)),
            borderRadius: 4, barPercentage: 0.6,
        }],
    };

    return (
        <DashRoot>
            <DashHeader
                title="Samaradorlik va foyda ko'rsatkichlari"
                subtitle="Zavod KPI dashboardi"
                dateRange="01.01.2025 - 30.04.2025"
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                {p.kpi.map((k, i) => (
                    <KpiTile
                        key={k.label}
                        title={k.label}
                        value={k.value}
                        delta={k.delta}
                        good={k.up}
                        hint={`reja: ${k.plan}`}
                        badge={<Badge symbol={['$', '∑', '◆', '%'][i] ?? '•'} color={[A.revenue, A.cost, A.profit, A.margin][i] ?? C.sub} />}
                    />
                ))}
                <KpiTile
                    title={p.savings.label}
                    value={p.savings.value}
                    delta={p.savings.delta}
                    good
                    hint={p.savings.note}
                    badge={<Badge symbol="↯" color={A.save} />}
                />
            </div>

            {/* minmax(0,1fr) — kartalar ichidagi matn qatorlar balandligini "itarib" yubormasligi uchun */}
            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8 }}>
                <Card title="Zavod samaradorlik indeksi, %">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minHeight: 0 }}>
                        {/*<div style={{ flexShrink: 0 }}>*/}
                        {/*    <Gauge label="Joriy indeks" value={eff.index.value} color={A.eff} />*/}
                        {/*</div>*/}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                            {M.map((m, i) => {
                                const v = eff.index.monthly[i];
                                const col = i === eff.index.warnIdx ? C.down : A.eff;
                                return (
                                    <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                                        <span style={{ color: C.sub, width: 30, flexShrink: 0 }}>{m}</span>
                                        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', minWidth: 0 }}>
                                            <div style={{ height: '100%', width: `${v}%`, background: col, borderRadius: 4 }} />
                                        </div>
                                        <span style={{ color: col, fontWeight: 600, width: 32, textAlign: 'right', flexShrink: 0 }}>{v}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                <Card title="Tushum, tannarx va foyda dinamikasi, $ ming">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={dynamicsData}
                            options={{
                                ...chartBase,
                                plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } },
                                scales: hAxis({ y: { beginAtZero: true } }),
                            } as any}
                        />
                    </div>
                </Card>

                <Card title="Tannarx tarkibi, %">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        {/* to'liq o'lchamda 138px (Metals bilan bir xil), tor konteynerda proporsional kichrayadi */}
                        <div style={{ width: 'clamp(44px, 72cqmin, 138px)', height: 'clamp(44px, 72cqmin, 138px)', flexShrink: 0 }}>
                            <Doughnut
                                data={costDonut}
                                options={{ ...chartBase, cutout: '65%', ...noLegend } as any}
                                plugins={[centerText(p.costDistribution.badge.split('/')[0].trim(), 'Oylik tannarx')]}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {costLabels.map((l, i) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: COST_COLORS[i], marginRight: 6, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{p.costDistribution.data[i]}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="1 tonnaga energiya sarfi, kVt·soat/t">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line
                            data={energyLine}
                            options={{ ...chartBase, ...noLegend, scales: hAxis({ y: { beginAtZero: false } }) } as any}
                            plugins={[lineLabel(0)]}
                        />
                    </div>
                </Card>

                <Card title="CO₂ chiqindisi, tonna/sutka">
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={co2Bar}
                            options={{ ...chartBase, ...noLegend, scales: hAxis({ y: { beginAtZero: true } }) } as any}
                            plugins={[barLabel(0)]}
                        />
                    </div>
                </Card>

                <Card title="Oy yakunlari — foyda va samaradorlik">
                    <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 6 }}>
                        {s.items.map(it => {
                            const col = it.tone === 'crit' ? C.down : it.tone === 'warn' ? GC.amber : C.up;
                            return (
                                <div key={it.label} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    textAlign: 'center', background: `${col}11`, border: `1px solid ${col}33`,
                                    borderRadius: 8, padding: '4px 3px', minWidth: 0,
                                }}>
                                    <div style={{ fontSize: 10, color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{it.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: col }}>{it.pct}</div>
                                    <div style={{ fontSize: 9.5, color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{it.value}</div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </DashRoot>
    );
};

export default ResourceDashboardPart2;
