import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTHS_SHORT, baseOpts, wrap, twoCol, colFlex,
    SectionHeader, Card, KpiRow, badge, NeonIcon,
    MiniLine, DonutChart, GaugeChart,
    IconDollar, IconGauge, IconCloud, IconChip, IconFactory,
} from './ResourceDashboard';
import PD from './resourceProfitDemoData.json';

/* ── Foyda/samaradorlik KPI kartasi (reja/fakt taqqoslash bilan) ── */
const ProfitKpiTile: React.FC<{ label: string; value: string; plan: string; delta: number; up: boolean }> = ({ label, value, plan, delta, up }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', minWidth: 0 }}>
        <div style={{ fontSize: 9, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{value}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: up ? C.ok : C.crit }}>{up ? '▲' : '▼'} {Math.abs(delta)}%</span>
        </div>
        <div style={{ fontSize: 9.5, color: C.sub, marginTop: 2 }}>reja: {plan}</div>
    </div>
);

/* ══════════════════════════════════════════
   ROW A — Samaradorlik (KPI) | Foyda va byudjet nazorati
══════════════════════════════════════════ */
const RowSamaradorlik: React.FC = () => {
    const eff = PD.efficiency;
    return (
        <div style={colFlex}>
            <SectionHeader title="Samaradorlik KPI" color={C.sub} icon={""} />

            <Card title="Zavod samaradorlik indeksi, %" accent={C.eff} icon={<IconGauge />} extra={badge(C.ok, eff.index.badge)}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: '0 0 110px', position: 'relative' }}>
                        <GaugeChart value={eff.index.value} color={C.eff} label="Joriy indeks" height={138} />
                    </div>
                    <div style={{ flex: 1 }}>
                        {MONTHS_SHORT.map((m, i) => {
                            const vals = eff.index.monthly;
                            return (
                                <div key={m} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '9px', color: C.sub, width: '24px' }}>{m}</span>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${vals[i]}%`, background: i === eff.index.warnIdx ? C.crit : C.eff, borderRadius: '4px' }} />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: i === eff.index.warnIdx ? C.crit : C.eff, width: '34px', textAlign: 'right' }}>{vals[i]}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
            <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Card title="1 tonnaga energiya, kVt·soat/t" accent={C.eff} icon={<IconGauge />} extra={badge(C.ok, 'Yaxshilanish ↓')} style={{ height: '100%' }}>
                        <KpiRow value={eff.energyPerTon.value} unit={eff.energyPerTon.unit} color={C.eff} trend={eff.energyPerTon.deltaText} up={eff.energyPerTon.up}
                            sub={eff.energyPerTon.sub}
                            right={<div style={{ textAlign: 'right', background: `${C.crit}11`, borderRadius: '8px', padding: '6px 8px', border: `1px solid ${C.crit}33` }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: C.crit }}>{eff.energyPerTon.worstLabel}</div>
                            </div>} />
                        <MiniLine data={eff.energyPerTon.data} color={C.eff} warnIdx={eff.energyPerTon.warnIdx} height={65} />
                    </Card>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Card title="CO₂ chiqindisi, tonna/sutka" accent={C.co2} icon={<IconCloud />} extra={badge(C.crit, eff.co2.badge)} style={{ height: '100%' }}>
                        <KpiRow value={eff.co2.value} unit={eff.co2.unit} color={C.co2} trend={eff.co2.deltaText} up={eff.co2.up}
                            right={<div style={{ textAlign: 'right', background: `${C.co2}11`, borderRadius: '8px', padding: '6px 8px', border: `1px solid ${C.co2}33` }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: C.co2 }}>{eff.co2.worstLabel}</div>
                            </div>} />
                        <div style={wrap(100)}>
                            <Line data={{
                                labels: MONTHS, datasets: [{
                                    data: eff.co2.data, borderColor: C.co2, backgroundColor: `${C.co2}18`,
                                    borderWidth: 2, pointRadius: [3, 3, 5, 3], pointBackgroundColor: [C.co2, C.co2, '#fff', C.co2],
                                    tension: 0.4, fill: true,
                                }],
                            }} options={baseOpts() as any} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const RowFoyda: React.FC = () => {
    const p = PD.profit;
    return (
        <div style={colFlex}>
            <SectionHeader title="Foyda va byudjet nazorati" color={C.text} icon={""} right={badge(C.ok, `Marja: ${p.kpi[3].value}`)} />

            <Card title="Zavod foyda asosiy ko'rsatkichlari" accent={C.cost} icon={<IconDollar />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '6px' }}>
                    {p.kpi.map(k => <ProfitKpiTile key={k.label} label={k.label} value={k.value} plan={k.plan} delta={k.delta} up={k.up} />)}
                </div>
            </Card>

            <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Card title="Tannarx tarkibi" accent={C.cost} icon={<IconChip />} extra={badge(C.cost, p.costDistribution.badge)} style={{ height: '100%' }}>
                        <DonutChart data={p.costDistribution.data} labels={p.costDistribution.labels} colors={[C.electric, C.gas, C.water, C.chemical]} height={150} flex />
                    </Card>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Card title={p.savings.label} accent={C.eff} icon={<IconGauge />} extra={badge(C.ok, `+${p.savings.delta}%`)} style={{ height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6 }}>
                            <div style={{ fontSize: 30, fontWeight: 700, color: C.eff }}>{p.savings.value}</div>
                            <div style={{ fontSize: 10.5, color: C.sub, textAlign: 'center', padding: '0 6px' }}>{p.savings.note}</div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   ROW B — Tushum, tannarx va foyda dinamikasi
══════════════════════════════════════════ */
const ProfitDynamics: React.FC = () => {
    const p = PD.profit;
    const chartData = useMemo(() => ({
        labels: MONTHS,
        datasets: [
            { label: "Tushum, $ming", data: p.monthly.revenue, backgroundColor: `${C.electric}bb`, borderRadius: 4 },
            { label: "Tannarx, $ming", data: p.monthly.cost, backgroundColor: `${C.crit}bb`, borderRadius: 4 },
            { label: "Foyda, $ming", data: p.monthly.profit, backgroundColor: `${C.eff}bb`, borderRadius: 4 },
        ],
    }), [p.monthly]);
    return (
        <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <NeonIcon color={C.cost} size={22}><IconFactory /></NeonIcon>
                    <span style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tushum, tannarx va foyda dinamikasi</span>
                </div>
                <span style={{ color: C.sub, fontSize: 9.5 }}>$ ming / oy</span>
            </div>
            <div style={wrap(200)}>
                <Bar data={chartData} options={baseOpts('bottom') as any} />
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   OY YAKUNLARI
══════════════════════════════════════════ */
const MonthlySummary: React.FC = () => {
    const s = PD.monthlySummary;
    return (
        <div style={{ background: 'rgba(34,197,94,0.06)', border: `1px solid ${C.ok}33`, borderRadius: '12px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <NeonIcon color={C.ok} size={24}><IconDollar /></NeonIcon>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: C.ok, letterSpacing: '1px' }}>{s.title}</div>
                </div>
                <div style={{ fontSize: '11px', color: C.sub }}>{s.subtitle}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '6px' }}>
                {s.items.map(it => {
                    const col = it.tone === 'crit' ? C.crit : it.tone === 'warn' ? C.warn : C.ok;
                    return (
                        <div key={it.label} style={{ textAlign: 'center', background: `${col}11`, border: `1px solid ${col}33`, borderRadius: '8px', padding: '7px 4px' }}>
                            <div style={{ fontSize: '10px', color: C.sub, marginBottom: '2px' }}>{it.label}</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: col }}>{it.pct}</div>
                            <div style={{ fontSize: '9px', color: C.sub }}>{it.value}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   EXPORT
══════════════════════════════════════════ */
const ResourceDashboardPart2: React.FC = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto', overflowX: 'hidden', paddingRight: 2 }}>
        {/*<div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: -4 }}>*/}
        {/*    <NeonIcon color={C.cost} size={30}><IconDollar /></NeonIcon>*/}
        {/*    <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: '#4fb3d9', textTransform: 'uppercase' }}>*/}
        {/*        Samaradorlik va foyda KPI*/}
        {/*    </div>*/}
        {/*</div>*/}
        <div style={twoCol}>
            <RowSamaradorlik />
            <RowFoyda />
        </div>
        <ProfitDynamics />
        <MonthlySummary />
    </div>
);

export default ResourceDashboardPart2;
