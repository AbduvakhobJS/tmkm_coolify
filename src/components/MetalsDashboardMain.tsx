import React, { useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    C, MONTHS as MOCK_MONTHS, MONTH_COLORS, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, Badge, DashHeader, DashRoot,
} from './dashboardUI';
import { useProductionDashboard } from '../hooks/production';
import type { DashboardData, DashboardMetal } from '../services/production';

type ViewMetal = {
    name: string; symbol: string; color: string;
    value: number; pct: number; delta: number | null; plan: number | null;
    dyn: number[] | null;
};

/* ── Mock data ──
   API'dan kelmagan bloklar shu qiymatlarda qoladi va sariq ramka bilan
   belgilanadi (`Card mock` / `KpiCard mock`). */
const MOCK_METALS: ViewMetal[] = [
    { name: 'Molibden', symbol: 'Mo', color: '#3b82f6', value: 2650.4, pct: 32.1, delta: 6.8, plan: 2500, dyn: [812, 828, 845, 872, 918, 895] },
    { name: 'Volfram', symbol: 'W', color: '#22c55e', value: 2312.7, pct: 28.0, delta: 3.4, plan: 2250, dyn: [602, 624, 641, 663, 701, 688] },
    { name: 'Titan', symbol: 'Ti', color: '#f59e0b', value: 1498.6, pct: 18.2, delta: -1.2, plan: 1550, dyn: [378, 388, 398, 408, 421, 414] },
    { name: 'Boshqalar', symbol: '•••', color: '#94a3b8', value: 277.4, pct: 3.4, delta: -6.8, plan: 300, dyn: [44, 45, 46, 47, 49, 48] },
];
const MOCK_TOTAL = 8247.5;
const MOCK_MONTHLY = [1245.6, 1289.4, 1356.7, 1412.8, 1487.2, 1455.8];
const MOCK_AVG_DAILY = [40.2, 46.0, 43.8, 47.1, 48.0, 48.5];
const MOCK_PLANTS = MOCK_METALS.map((m, i) => ({
    name: `${i + 1}-zavod`,
    monthly: MOCK_MONTHLY.map((mo) => +(m.value * mo / MOCK_TOTAL).toFixed(1)),
}));
const COMPARE = 'Avvalgi davr bilan solishtirganda';

/* ── Material → nom / rang (frontend tomonda) ── */
const NAMES: Record<string, string> = {
    Mo: 'Molibden', W: 'Volfram', Ti: 'Titan', Cu: 'Mis',
    Re: 'Reniy', Bi: 'Vismut', Pb: "Qo'rg'oshin", Zn: 'Rux', Ag: 'Kumush',
};
const COLORS: Record<string, string> = {
    Mo: '#3b82f6', W: '#22c55e', Ti: '#f59e0b', Cu: '#ec4899',
    Re: '#a855f7', Bi: '#eab308', Pb: '#64748b', Zn: '#06b6d4', Ag: '#cbd5e1',
};
/* Lug'atda yo'q materiallar uchun — donut bo'laklari bir-biridan ajralib
   tursin uchun kulrang emas, navbatma-navbat rang beriladi. */
const FALLBACK_COLORS = ['#14b8a6', '#f43f5e', '#8b5cf6', '#0ea5e9', '#84cc16'];
const GREY = '#94a3b8';

/* ── Qiymat tekshiruvchilari ── */
const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

/** Massivda kamida bitta haqiqiy son bo'lsa — `null` lar 0 ga aylantirilib qaytariladi. */
const numList = (v: unknown): number[] | null => {
    if (!Array.isArray(v) || v.length === 0) return null;
    if (!v.some((x) => num(x) !== null)) return null;
    return v.map((x) => num(x) ?? 0);
};

const mapMetal = (m: DashboardMetal, i: number): ViewMetal => {
    const key = (m.material ?? '').trim();
    return {
        name: NAMES[key] ?? (key || 'Aniqlanmagan'),
        symbol: key || '•••',
        color: COLORS[key] ?? (key ? FALLBACK_COLORS[i % FALLBACK_COLORS.length] : GREY),
        value: num(m.value) ?? 0,
        pct: num(m.pct) ?? 0,
        delta: num(m.delta),
        plan: num(m.plan),
        dyn: numList(m.dyn),
    };
};

/**
 * API javobidan ekran modelini yig'adi. Har bir blok alohida tekshiriladi:
 * ma'lumot bor bo'lsa real, yo'q bo'lsa mock + `*Mock: true`.
 */
function buildView(data?: DashboardData) {
    const months = data?.months?.map((m) => m?.label).filter((l): l is string => !!l) ?? [];
    const monthsOk = months.length > 0;

    const rawMetals = Array.isArray(data?.metals) ? data!.metals! : [];
    const metalsOk = rawMetals.some((m) => num(m?.value) !== null);
    const metals: ViewMetal[] = metalsOk ? rawMetals.map(mapMetal) : MOCK_METALS.map((m) => ({ ...m }));

    /* Jami: API bermasa metallar yig'indisidan hisoblanadi. Ikkalasi ham
       bo'lmasagina mock qiymatga tushiladi. */
    const apiTotal = num(data?.total);
    const total = apiTotal ?? (metalsOk ? metals.reduce((s, m) => s + m.value, 0) : MOCK_TOTAL);
    const totalMock = apiTotal === null && !metalsOk;

    /* Ulush: API bermasa qiymat/jami dan hisoblanadi. */
    if (metalsOk && total > 0) {
        for (const m of metals) if (!m.pct) m.pct = +(m.value / total * 100).toFixed(1);
    }

    /* Dinamika — kamida bitta metalda oylik massiv bo'lishi kerak. */
    const dynOk = metalsOk && monthsOk && metals.some((m) => m.dyn !== null);

    const rawPlants = Array.isArray(data?.plants) ? data!.plants! : [];
    const plantsList = rawPlants
        .map((p) => ({ name: p?.name || 'Aniqlanmagan', monthly: numList(p?.monthly) }))
        .filter((p) => p.monthly !== null) as { name: string; monthly: number[] }[];
    const plantsOk = monthsOk && plantsList.length > 0;

    const monthly = numList(data?.monthly);
    const avgDaily = numList(data?.avgDaily);

    return {
        months: monthsOk ? months : MOCK_MONTHS,
        metals, metalsMock: !metalsOk,
        total, totalMock,
        dynMonths: dynOk ? months : MOCK_MONTHS,
        dynMetals: dynOk ? metals : MOCK_METALS,
        dynMock: !dynOk,
        plants: plantsOk ? plantsList : MOCK_PLANTS,
        plantMonths: plantsOk ? months : MOCK_MONTHS,
        plantsMock: !plantsOk,
        monthly: monthly && monthsOk ? monthly : MOCK_MONTHLY,
        monthlyMonths: monthly && monthsOk ? months : MOCK_MONTHS,
        monthlyMock: !(monthly && monthsOk),
        avgDaily: avgDaily && monthsOk ? avgDaily : MOCK_AVG_DAILY,
        avgMonths: avgDaily && monthsOk ? months : MOCK_MONTHS,
        avgMock: !(avgDaily && monthsOk),
    };
}

/* ── Sana oralig'i ── */
const isoDay = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtDots = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
};

type Props = {
    /** `YYYY-MM-DD`. Berilmasa — joriy yil boshidan bugungacha. */
    from?: string;
    to?: string;
    /** Bitta zavod bo'yicha filtr. Berilmasa — barcha zavodlar. */
    plant?: string;
};

const MetalsDashboardMain: React.FC<Props> = ({ from, to, plant }) => {
    const range = useMemo(() => {
        const now = new Date();
        return { from: from ?? `${now.getFullYear()}-01-01`, to: to ?? isoDay(now) };
    }, [from, to]);

    const { data } = useProductionDashboard(range.from, range.to, plant);
    const v = useMemo(() => buildView(data), [data]);

    const donutData = {
        labels: v.metals.map((m) => m.name),
        datasets: [{ data: v.metals.map((m) => m.value), backgroundColor: v.metals.map((m) => m.color), borderColor: C.cardAlt, borderWidth: 2 }],
    };
    const lineData = {
        labels: v.dynMonths,
        datasets: v.dynMetals
            .filter((m) => m.dyn)
            .map((m) => ({ label: m.name, data: m.dyn as number[], borderColor: m.color, backgroundColor: m.color, borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: m.color })),
    };
    const factoryData = {
        labels: v.plants.map((p) => p.name),
        datasets: v.plantMonths.map((mo, mi) => ({
            label: mo,
            data: v.plants.map((p) => p.monthly[mi] ?? 0),
            backgroundColor: MONTH_COLORS[mi % MONTH_COLORS.length],
            stack: 's',
            borderWidth: 0,
        })),
    };
    const monthlyBar = { labels: v.monthlyMonths, datasets: [{ data: v.monthly, backgroundColor: '#2563eb', borderRadius: 4, barPercentage: 0.6 }] };
    const avgBar = { labels: v.avgMonths, datasets: [{ data: v.avgDaily, backgroundColor: '#22c55e', borderRadius: 4, barPercentage: 0.6 }] };

    return (
        <DashRoot>
            <DashHeader title="Texnologik metallar ishlab chiqarish" subtitle="Ko'rsatkichlar dashboardi" dateRange={`${fmtDots(range.from)} - ${fmtDots(range.to)}`} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard title="Umumiy hajmi" value={`${fmt(v.total)} t`} compare={COMPARE} mock={v.totalMock}
                         badge={<div style={{ width: 34, height: 34, borderRadius: '50%', background: '#22c55e22', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▤</div>} />
                {v.metals.map((m) => (
                    <KpiCard key={m.name} title={m.name} value={`${fmt(m.value)} t`} mock={v.metalsMock}
                             delta={m.delta} compare={COMPARE} badge={<Badge symbol={m.symbol} color={m.color} />} />
                ))}
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                <Card title="Metallar bo'yicha ishlab chiqarish, tonna" mock={v.metalsMock}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(v.total)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {v.metals.map((m) => (
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
                <Card title="Ishlab chiqarish dinamikasi, tonna" mock={v.dynMock}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={lineData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } }, scales: axis({ y: { beginAtZero: true } }) } as any} />
                    </div>
                </Card>

                <Card title="Zavodlar bo'yicha ishlab chiqarish, tonna" mock={v.plantsMock}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={factoryData} options={{ ...chartBase, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { stacked: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } }, y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } } } } as any} />
                    </div>
                </Card>
                <Card title="Oylar bo'yicha ishlab chiqarish, tonna" mock={v.monthlyMock}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={monthlyBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>
                <Card title="Ishlab chiqarish tuzilmasi, %" mock={v.metalsMock}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                        <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                            <Doughnut data={donutData} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${fmt(v.total)}`, 'Jami, t')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
                            {v.metals.map((m) => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 6, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1 }}>{m.name}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.pct)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
                <Card title="O'rtacha kunlik ishlab chiqarish, tonna" mock={v.avgMock}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={avgBar} options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any} plugins={[barLabel(1)]} />
                    </div>
                </Card>
            </div>
        </DashRoot>
    );
};

export default MetalsDashboardMain;
