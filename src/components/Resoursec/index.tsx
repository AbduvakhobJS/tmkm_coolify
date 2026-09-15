import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { fmt, chartBase, noLegend } from '../dashboardUI';
import {
    BigCard, BigKpiCard, axisLarge, legendLarge,
    bigHeaderTitle, bigHeaderPill, bigChip, bigFooter, BigLabelRow,
} from '../dashboardUILarge';
import {
    useElectricityByType, useElectricityByObject, useHydrogenMonthly,
    useGasDayLogs, useSolarStations, useSolarDbKpi,
} from '../../hooks/energyResources';
import { num } from '../../services/energyResources';
import type { ElectricityTypeRow, ElectricityObjectRow, HydrogenRow, GasDayLogRow, SolarStationRow, SolarKpiRow } from '../../services/energyResources';
import { GC, ACCENT_SERIES } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   ENERGETIKA VA RESURSLAR — elektr energiya, quyosh stansiyalari, vodorod, gaz.

   To'rtta bo'lim UCHTA turli backend modulidan o'qiladi (ENERGY_RESOURCES_API.md):
     • production-report → elektr, vodorod (xato HTTP statusida keladi)
     • gas-integration    → gaz hisoblagichi (xato ham HTTP 200 bilan keladi)
     • fusion-solar        → quyosh stansiyalari (xato ham HTTP 200 bilan keladi)

   Gazning ikkita mustaqil manbasi bor va ular qo'shilmaydi — bu yerda faqat
   hisoblagich (`gas-integration/day-logs`) ko'rsatiladi, hujjatning
   tavsiyasiga ko'ra ("Svodkada ... faqat hisoblagich raqami qoldirilgan").

   Ma'lumot bo'lmagan blok BO'SH qoladi — soxta raqam chizilmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

const EmptyBody: React.FC = () => <div style={{ flex: 1, minHeight: 0 }} />;

const pad2 = (n: number) => String(n).padStart(2, '0');
const isoDay = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const MONTH_NAMES = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const monthLabel = (m: string): string => {
    const [y, mm] = m.split('-');
    const idx = Number(mm) - 1;
    return `${MONTH_NAMES[idx] ?? mm} ${y}`;
};
const dayLabel = (d: string): string => {
    const [, mm, dd] = d.split('-');
    return `${dd}.${mm}`;
};

/* ── Elektr: tur kesimida ko'p-seriyali oylik pivot ── */
function buildElectricitySeries(rows: ElectricityTypeRow[]) {
    const months = Array.from(new Set(rows.map((r) => r.month).filter((m): m is string => !!m))).sort();
    const types = Array.from(new Set(rows.map((r) => r.type)));
    const series = types.map((type, i) => ({
        type,
        color: ACCENT_SERIES[i % ACCENT_SERIES.length],
        data: months.map((m) => rows.find((r) => r.month === m && r.type === type)?.kwh ?? null),
    }));
    const latestMonth = months[months.length - 1];
    const latestTotal = latestMonth
        ? rows.filter((r) => r.month === latestMonth).reduce((s, r) => s + (r.kwh ?? 0), 0)
        : null;
    return { months, series, latestMonth, latestTotal };
}

/* ── Elektr: eng so'nggi oy, obyekt (sex) kesimida ── */
function buildElectricityObjects(rows: ElectricityObjectRow[]) {
    const months = Array.from(new Set(rows.map((r) => r.month).filter((m): m is string => !!m))).sort();
    const latestMonth = months[months.length - 1];
    const items = (latestMonth ? rows.filter((r) => r.month === latestMonth) : [])
        .filter((r): r is ElectricityObjectRow & { kwh: number } => r.kwh !== null)
        .map((r) => ({ name: r.object, value: r.kwh }))
        .sort((a, b) => b.value - a.value);
    return { latestMonth, items };
}

/* ── Vodorod: bitta seriya, oylik ── */
function buildHydrogenSeries(rows: HydrogenRow[]) {
    const months = Array.from(new Set(rows.map((r) => r.month).filter((m): m is string => !!m))).sort();
    const data = months.map((m) => rows.find((r) => r.month === m)?.value ?? null);
    const latestMonth = months[months.length - 1];
    const latestValue = latestMonth ? rows.find((r) => r.month === latestMonth)?.value ?? null : null;
    return { months, data, latestMonth, latestValue };
}

/* ── Gaz hisoblagichi: kunlik, obyektlar bo'yicha yig'ilgan korreksiya hajmi ── */
function buildGasDaily(rows: GasDayLogRow[]) {
    const byDay = new Map<string, number>();
    for (const r of rows) {
        const v = num(r.tubehrdayCorrvolume);
        if (v === null) continue;
        byDay.set(r.tubehrdayDatehrday, (byDay.get(r.tubehrdayDatehrday) ?? 0) + v);
    }
    const days = Array.from(byDay.keys()).sort();
    const data = days.map((d) => byDay.get(d) ?? null);
    const latestDay = days[days.length - 1];
    const latestValue = latestDay ? byDay.get(latestDay) ?? null : null;
    return { days, data, latestDay, latestValue };
}

/** Gaz hisoblagichi: 30 kunlik oynada o'lchov nuqtasi (obyekt) bo'yicha jami. */
function buildGasByObject(rows: GasDayLogRow[]) {
    const byObj = new Map<string, number>();
    for (const r of rows) {
        const v = num(r.tubehrdayCorrvolume);
        if (v === null) continue;
        const name = r.gasObject?.objectName ?? "Noma'lum";
        byObj.set(name, (byObj.get(name) ?? 0) + v);
    }
    return Array.from(byObj.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/* ── Quyosh: kunlik, stansiyalar bo'yicha yig'ilgan inverterPower ── */
function buildSolarDaily(rows: SolarKpiRow[]) {
    const byDay = new Map<string, number>();
    for (const r of rows) {
        const v = num(r.inverterPower);
        if (v === null) continue;
        const day = r.collectDate.slice(0, 10);
        byDay.set(day, (byDay.get(day) ?? 0) + v);
    }
    const days = Array.from(byDay.keys()).sort();
    const data = days.map((d) => byDay.get(d) ?? null);
    const latestDay = days[days.length - 1];
    const latestValue = latestDay ? byDay.get(latestDay) ?? null : null;
    return { days, data, latestDay, latestValue };
}

/** Nazariy (`theoryPower`) va haqiqiy (`inverterPower`) ishlab chiqarishni
 *  kunlik qiyoslash — hujjat shu ikkisini taqqoslashni tavsiya qiladi. */
function buildSolarCompare(rows: SolarKpiRow[]) {
    const byDay = new Map<string, { theory: number | null; actual: number | null }>();
    for (const r of rows) {
        const day = r.collectDate.slice(0, 10);
        const cur = byDay.get(day) ?? { theory: null, actual: null };
        const theory = num(r.theoryPower);
        const actual = num(r.inverterPower);
        if (theory !== null) cur.theory = (cur.theory ?? 0) + theory;
        if (actual !== null) cur.actual = (cur.actual ?? 0) + actual;
        byDay.set(day, cur);
    }
    const days = Array.from(byDay.keys()).sort();
    return {
        days,
        theory: days.map((d) => byDay.get(d)!.theory),
        actual: days.map((d) => byDay.get(d)!.actual),
    };
}

function buildSolarStations(rows: SolarStationRow[]) {
    const totalCapacity = rows.reduce((s, r) => s + (num(r.capacity) ?? 0), 0);
    const list = [...rows].sort((a, b) => (num(b.capacity) ?? 0) - (num(a.capacity) ?? 0));
    return { count: rows.length, totalCapacity, list };
}

const Resoursec: React.FC = () => {
    const now = useMemo(() => new Date(), []);
    const yearStart = useMemo(() => `${now.getFullYear()}-01-01`, [now]);
    const today = useMemo(() => isoDay(now), [now]);
    const from30 = useMemo(() => isoDay(daysAgo(29)), [now]);

    const { data: elecRows } = useElectricityByType(yearStart, today);
    const { data: elecObjectRows } = useElectricityByObject(yearStart, today);
    const { data: hydroRows } = useHydrogenMonthly(yearStart, today);
    const { data: gasRows } = useGasDayLogs(from30, today);
    const { data: solarStations } = useSolarStations();
    const { data: solarKpiRows } = useSolarDbKpi(from30, today);

    const elec = useMemo(() => buildElectricitySeries(elecRows ?? []), [elecRows]);
    const elecObjects = useMemo(() => buildElectricityObjects(elecObjectRows ?? []), [elecObjectRows]);
    const hydro = useMemo(() => buildHydrogenSeries(hydroRows ?? []), [hydroRows]);
    const gas = useMemo(() => buildGasDaily(gasRows ?? []), [gasRows]);
    const gasByObject = useMemo(() => buildGasByObject(gasRows ?? []), [gasRows]);
    const solarDaily = useMemo(() => buildSolarDaily(solarKpiRows ?? []), [solarKpiRows]);
    const solarCompare = useMemo(() => buildSolarCompare(solarKpiRows ?? []), [solarKpiRows]);
    const stations = useMemo(() => buildSolarStations(solarStations ?? []), [solarStations]);

    const hasElec = elec.months.length > 0;
    const hasElecObjects = elecObjects.items.length > 0;
    const hasHydro = hydro.months.length > 0;
    const hasGas = gas.days.length > 0;
    const hasGasByObject = gasByObject.length > 0;
    const hasSolar = solarDaily.days.length > 0;
    const hasSolarCompare = solarCompare.days.length > 0;
    const hasStations = stations.list.length > 0;

    const elecLineData = {
        labels: elec.months.map(monthLabel),
        datasets: elec.series.map((s) => ({
            label: s.type, data: s.data, borderColor: s.color, backgroundColor: s.color,
            borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: s.color,
        })),
    };

    const elecObjectBarData = {
        labels: elecObjects.items.map((i) => i.name),
        datasets: [{ data: elecObjects.items.map((i) => i.value), backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.6 }],
    };

    const hydroBarData = {
        labels: hydro.months.map(monthLabel),
        datasets: [{ data: hydro.data, backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.6 }],
    };

    const gasBarData = {
        labels: gas.days.map(dayLabel),
        datasets: [{ data: gas.data, backgroundColor: GC.accent2, borderRadius: 4, barPercentage: 0.6 }],
    };

    const gasObjectBarData = {
        labels: gasByObject.map((o) => o.name),
        datasets: [{ data: gasByObject.map((o) => o.value), backgroundColor: GC.accent2, borderRadius: 4, barPercentage: 0.6 }],
    };

    const solarBarData = {
        labels: solarDaily.days.map(dayLabel),
        datasets: [{ data: solarDaily.data, backgroundColor: GC.accent3, borderRadius: 4, barPercentage: 0.6 }],
    };

    const solarCompareData = {
        labels: solarCompare.days.map(dayLabel),
        datasets: [
            { label: "Nazariy", data: solarCompare.theory, borderColor: GC.accent4, backgroundColor: GC.accent4, borderWidth: 2, tension: 0.35, pointRadius: 1.5, spanGaps: false },
            { label: 'Haqiqiy', data: solarCompare.actual, borderColor: GC.accent3, backgroundColor: GC.accent3, borderWidth: 2, tension: 0.35, pointRadius: 1.5, spanGaps: false },
        ],
    };

    return (
        <div style={{
            background: 'var(--gc-panel-bg)', padding: 'clamp(8px, 2cqmin, 16px)',
            border: '1px solid rgba(14,168,199,0.2)', borderRadius: '12px',
            width: '100%', height: '100%', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', overflow: 'auto',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            containerType: 'size', containerName: 'dash-root',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: 'clamp(5px, 1.4cqmin, 12px)', flexShrink: 0, flexWrap: 'wrap', gap: 'clamp(4px, 1cqmin, 8px)',
            }}>
                <div style={bigHeaderTitle}>Energetika va resurslar</div>
                <div style={bigHeaderPill}>Elektr · Quyosh · Vodorod · Gaz</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                <BigKpiCard
                    title={elec.latestMonth ? `Elektr energiya, ${monthLabel(elec.latestMonth)}` : 'Elektr energiya'}
                    value={elec.latestTotal != null ? `${fmt(elec.latestTotal, 0)} kVt·soat` : ''}
                    iconColor={GC.accent1}
                />
                <BigKpiCard
                    title={hydro.latestMonth ? `Vodorod, ${monthLabel(hydro.latestMonth)}` : 'Vodorod'}
                    value={hydro.latestValue != null ? `${fmt(hydro.latestValue, 0)} m³` : ''}
                    iconColor={GC.accent2}
                />
                <BigKpiCard
                    title={gas.latestDay ? `Gaz (hisoblagich), ${dayLabel(gas.latestDay)}` : 'Gaz (hisoblagich)'}
                    value={gas.latestValue != null ? `${fmt(gas.latestValue, 0)} m³` : ''}
                    iconColor={GC.accent3}
                />
                <BigKpiCard
                    title={solarDaily.latestDay ? `Quyosh, ${dayLabel(solarDaily.latestDay)} · ${stations.count} stansiya` : 'Quyosh stansiyalari'}
                    value={solarDaily.latestValue != null ? `${fmt(solarDaily.latestValue, 0)} kVt·soat` : ''}
                    iconColor={GC.accent4}
                />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: '1fr 1fr', gap: 10,
            }}>
                <BigCard title="Elektr energiya — turlar bo'yicha, kVt·soat">
                    {!hasElec ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line data={elecLineData} options={{ ...chartBase, plugins: legendLarge('top'), scales: axisLarge({ y: { beginAtZero: true } }) } as any} />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Vodorod sarfi, oylik, m³">
                    {!hasHydro ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar data={hydroBarData} options={{ ...chartBase, ...noLegend, scales: axisLarge({ y: { beginAtZero: true } }) } as any} />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Gaz — hisoblagich, kunlik, m³ (30 kun)">
                    {!hasGas ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar data={gasBarData} options={{ ...chartBase, ...noLegend, scales: axisLarge({ y: { beginAtZero: true } }) } as any} />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Quyosh — ishlab chiqarish, kunlik, kVt·soat (30 kun)">
                    {!hasSolar ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar data={solarBarData} options={{ ...chartBase, ...noLegend, scales: axisLarge({ y: { beginAtZero: true } }) } as any} />
                        </div>
                    )}
                </BigCard>

                <BigCard title={elecObjects.latestMonth ? `Elektr — obyektlar bo'yicha, ${monthLabel(elecObjects.latestMonth)}, kVt·soat` : "Elektr — obyektlar bo'yicha, kVt·soat"}>
                    {!hasElecObjects ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={elecObjectBarData}
                                options={{
                                    ...chartBase, indexAxis: 'y', ...noLegend,
                                    scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false } } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Quyosh — nazariy va haqiqiy, kVt·soat (30 kun)">
                    {!hasSolarCompare ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line
                                data={solarCompareData}
                                options={{ ...chartBase, plugins: legendLarge('top'), scales: axisLarge({ y: { beginAtZero: true } }) } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Gaz — o'lchov nuqtalari bo'yicha, m³ (30 kun)">
                    {!hasGasByObject ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={gasObjectBarData}
                                options={{
                                    ...chartBase, indexAxis: 'y', ...noLegend,
                                    scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false } } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Quyosh stansiyalari — ro'yxat va quvvat">
                    {!hasStations ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {stations.list.map((s, i) => (
                                <BigLabelRow
                                    key={s.id}
                                    label={s.stationName ?? s.stationCode}
                                    color={ACCENT_SERIES[i % ACCENT_SERIES.length]}
                                    value={num(s.capacity) != null ? `${fmt(num(s.capacity) as number, 2)} MVt` : '—'}
                                />
                            ))}
                        </div>
                    )}
                </BigCard>
            </div>

            <div style={bigFooter}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Manba: production-report / gas-integration / fusion-solar</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stations.count > 0 ? `${stations.count} stansiya · ${fmt(stations.totalCapacity, 1)} MVt o'rnatilgan quvvat` : ''}</span>
            </div>
        </div>
    );
};

export default Resoursec;
