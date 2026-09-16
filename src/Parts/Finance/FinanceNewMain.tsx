import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, BigChartBox, BigDonutBody, BigForecastList,    bigScales, bigDemoCardStyle, fmtCompact, fmtGrouped,    type BigPart, type BigForecast,
} from '../../components/dashboardUILarge';
import DATA_JSON from './financeNewMainDemoData.json';
import { useFinanceDashboard } from '../../hooks/finance';
import type { FinanceDashboardData, FinanceRow } from '../../services/finance';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   MOLIYAVIY VAZIYAT — TO'LIQ EKRAN (32 ta karta)

   Uslub MetalsDashboardMain bilan bir xil: `BigDashRoot` + `DashHeader` +
   `BigKpiCard` qatori + `BigCard` to'ri (6 ustun × 4 qator). Scroll yo'q.

   MA'LUMOT MANBAI — AVVAL HAQIQIY API:
     `GET /finance-report/dashboard` (`useFinanceDashboard`) — FinanceNew.tsx
     ishlatgan aynan shu endpoint, 29 ta kalit: tushum/foyda/marja, pul oqimi
     (3 faoliyat), balans tarkibi (aktiv/majburiyat/kapital va ularning
     qismlari), likvidlik va leveraj koeffitsientlari.

     FinanceNew.tsx dagi qoidalar saqlangan:
       • `margin` nisbat sifatida keladi → ×100;
       • oylararo o'zgarish oldingi qiymat ≤ 0 bo'lsa hisoblanmaydi;
       • oy nomlari kirillda keladi → qisqa lotincha.

   DEMO — FAQAT YETMAGANDA:
     • Real qator kelmasa (token yo'q, xato, bo'sh) — o'sha karta namuna
       qatori bilan to'ladi va SARIQ ramka oladi.
     • Sotuv tuzilmasi, jahon narxlari, eksport bozorlari, xarajatlar tarkibi,
       debitorlik muddatlari, AI prognozlari — bunday kesim API'da yo'q,
       doim namuna (sariq ramka).

   Bitta ma'lumot 2-3 xil ko'rinishda: masalan tushum — KPI plitka, chiziqli
   dinamika va tushum/foyda ustunlari; pul oqimi — KPI, faoliyat bo'yicha
   ustunlar, oxirgi oy tarkibi donuti va davr oxiridagi qoldiq chizig'i.
   ══════════════════════════════════════════════════════════════════════════ */

type FinanceNewMainData = typeof DATA_JSON;
const DATA = DATA_JSON as FinanceNewMainData;

const MARKET_COLOR: Record<string, string> = {
    blue: GC.blue, purple: GC.violet, teal: GC.cyan,
    amber: GC.amber, coral: GC.amber, gray: GC.slate,
};

const cardStyle = (demo: boolean): React.CSSProperties | undefined => (demo ? bigDemoCardStyle : undefined);

/* Oy nomlari kirillda keladi (FinanceNew.tsx bilan bir xil jadval). */
const MONTH_SHORT: Record<string, string> = {
    'Январь': 'Yanv', 'Февраль': 'Fev', 'Март': 'Mar', 'Апрель': 'Apr',
    'Май': 'May', 'Июнь': 'Iyn', 'Июль': 'Iyl', 'Август': 'Avg',
    'Сентябрь': 'Sen', 'Октябрь': 'Okt', 'Ноябрь': 'Noy', 'Декабрь': 'Dek',
};
const DEMO_MONTHS = ['Yanv', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen'];

/* ── Qiymat yordamchilari (FinanceNew.tsx semantikasi) ── */
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
type Series = (number | null)[];
const lastOf = (a: Series): number | null => {
    for (let i = a.length - 1; i >= 0; i--) if (a[i] !== null) return a[i];
    return null;
};
const prevOf = (a: Series): number | null => {
    let seen = false;
    for (let i = a.length - 1; i >= 0; i--) {
        if (a[i] === null) continue;
        if (seen) return a[i];
        seen = true;
    }
    return null;
};
/** Oylararo o'zgarish, %. Oldingi qiymat musbat bo'lmasa — ma'nosiz, `null`. */
const deltaPct = (a: Series): number | null => {
    const l = lastOf(a), p = prevOf(a);
    if (l === null || p === null || p <= 0) return null;
    return ((l - p) / p) * 100;
};

/** Namuna qator: asosiy qiymat atrofida trend va to'lqin. Deterministik. */
const wave = (n: number, base: number, trend: number, amp: number, phase = 0): number[] =>
    Array.from({ length: n }, (_, i) => Math.round(base * (1 + trend * i) * (1 + amp * Math.sin(i * 1.15 + phase))));

/* ── Faqat namuna bo'ladigan bloklar (API'da bunday kesim yo'q) ── */
const OPEX_PARTS: BigPart[] = [
    { label: 'Energiya', value: 38, color: GC.accent1 },
    { label: 'Reagentlar', value: 22, color: GC.amber },
    { label: 'Ish haqi', value: 18, color: GC.violet },
    { label: "Ta'mirlash", value: 11, color: GC.accent3 },
    { label: 'Transport', value: 7, color: GC.green },
    { label: 'Boshqa', value: 4, color: GC.slate },
];
const RECEIVABLES_AGING = [
    { label: '0–30 kun', value: 41.2, color: GC.green },
    { label: '31–60 kun', value: 18.6, color: GC.accent1 },
    { label: '61–90 kun', value: 9.4, color: GC.amber },
    { label: '90+ kun', value: 5.1, color: GC.red },
];
const AI_FORECASTS: BigForecast[] = [
    { text: 'Yillik tushum rejasi bajariladi', detail: "Oxirgi 3 oy trendi bo'yicha", confidence: 81, color: GC.green },
    { text: "Mis narxi 9 500–10 200 $/t oralig'ida", detail: 'LME fyucherslari asosida', confidence: 68, color: GC.accent1 },
    { text: "Joriy likvidlik me'yorda qoladi", detail: 'Koeffitsient ≥ 1 saqlanadi', confidence: 74, color: GC.green },
    { text: 'Tannarx bosimi saqlanadi', detail: 'Energiya va reagent narxlari', confidence: 57, color: GC.amber },
    { text: '90+ kunlik debitorlik o\'sishi xavfi', detail: 'Eksport shartnomalari to\'lovlari', confidence: 49, color: GC.red },
];

const FinanceNewMain: React.FC = () => {
    const { data } = useFinanceDashboard();

    const v = useMemo(() => {
        const d = data as FinanceDashboardData | undefined;
        const rows: FinanceRow[] = Array.isArray(d?.rows) ? d!.rows! : [];
        const byKey = new Map<string, FinanceRow>(rows.map((r) => [r.key, r]));

        const realMonths = (Array.isArray(d?.months) ? d!.months! : []).map((m) => MONTH_SHORT[m] ?? m);
        const labels = realMonths.length ? realMonths : DEMO_MONTHS;
        const n = labels.length;

        /** Real qator (kamida 2 ta son bo'lsa), aks holda namuna. */
        const series = (key: string, demo: number[], scale = 1): { data: Series; demo: boolean } => {
            const row = byKey.get(key);
            const raw = Array.isArray(row?.values) ? row!.values!.map(num) : null;
            const count = raw ? raw.filter((x) => x !== null).length : 0;
            if (raw && count >= 2) return { data: raw.map((x) => (x === null ? null : x * scale)), demo: false };
            return { data: demo.slice(0, n), demo: true };
        };

        const revenue = series('revenue', wave(n, 9.6e7, 0.01, 0.06, 0.3));
        const profit = series('profit', wave(n, 6.5e6, 0.02, 0.35, 1.1));
        /* `margin` nisbat — faqat real qiymat ×100 (FinanceNew.tsx, hujjatning
           6-bo'limi); namuna qatori allaqachon foizda beriladi. */
        const pctWave = (base: number, amp: number, phase: number) =>
            Array.from({ length: n }, (_, i) => +(base * (1 + amp * Math.sin(i * 1.15 + phase))).toFixed(2));
        const margin = series('margin', pctWave(7.2, 0.3, 0.8), 100);
        const netCash = series('netCash', wave(n, 8.4e6, 0.03, 0.5, 2.0));

        const cfOperating = series('cfOperating', wave(n, 1.9e7, 0.02, 0.25, 0.4));
        const cfInvesting = series('cfInvesting', wave(n, -9.5e6, 0.01, 0.3, 1.7));
        const cfFinancing = series('cfFinancing', wave(n, -1.8e6, 0.0, 0.8, 2.6));
        const cashEquivalents = series('cashEquivalents', wave(n, 6.1e7, 0.02, 0.08, 0.9));

        const assetsTotal = series('assetsTotal', wave(n, 1.24e9, 0.006, 0.01, 0.2));
        const liabTotal = series('liabTotal', wave(n, 4.1e8, 0.004, 0.02, 0.6));
        const equityTotal = series('equityTotal', wave(n, 8.3e8, 0.007, 0.01, 1.4));
        const cash = series('cash', wave(n, 6.1e7, 0.02, 0.08, 0.9));

        /* Koeffitsientlar birliksiz nisbat — `wave` (butun songa yumaloqlaydi)
           emas, `pctWave` bilan 2 xonagacha. */
        const currentRatio = series('currentRatio', pctWave(1.62, 0.03, 0.5));
        const debtToEquity = series('debtToEquity', pctWave(0.49, 0.06, 1.0));

        /** Oxirgi oy tarkibi — qismlarning oxirgi real qiymatlari; hammasi yo'q bo'lsa namuna. */
        const snapshot = (parts: { key: string; label: string; color: string }[], demoVals: number[]): { parts: BigPart[]; demo: boolean } => {
            const vals = parts.map((p) => {
                const row = byKey.get(p.key);
                return Array.isArray(row?.values) ? lastOf(row!.values!.map(num)) : null;
            });
            if (vals.every((x) => x === null)) {
                return { parts: parts.map((p, i) => ({ label: p.label, value: demoVals[i], color: p.color })), demo: true };
            }
            return { parts: parts.map((p, i) => ({ label: p.label, value: vals[i] ?? 0, color: p.color })), demo: false };
        };

        const assetsSplit = snapshot([
            { key: 'assetsCurrent', label: 'Joriy aktivlar', color: GC.accent1 },
            { key: 'assetsNonCurrent', label: 'Uzoq muddatli', color: GC.accent3 },
        ], [3.6e8, 8.8e8]);
        const currentAssets = snapshot([
            { key: 'receivables', label: 'Debitorlik', color: GC.accent1 },
            { key: 'inventories', label: 'TMZ', color: GC.amber },
            { key: 'cash', label: "Pul mablag'lari", color: GC.green },
            { key: 'otherCurrent', label: 'Boshqa', color: GC.slate },
        ], [1.42e8, 1.18e8, 6.1e7, 3.9e7]);
        const nonCurrentAssets = snapshot([
            { key: 'fixedAssets', label: 'Asosiy vositalar', color: GC.accent1 },
            { key: 'buildInProgress', label: 'Tugallanmagan qurilish', color: GC.amber },
            { key: 'subsidiaryInvest', label: "Sho'ba korx. invest.", color: GC.violet },
            { key: 'otherNonCurrent', label: 'Boshqa', color: GC.slate },
        ], [5.1e8, 2.2e8, 1.1e8, 4.0e7]);
        const liabSplit = snapshot([
            { key: 'liabCurrent', label: 'Joriy majburiyatlar', color: GC.amber },
            { key: 'liabNonCurrent', label: 'Uzoq muddatli', color: GC.violet },
        ], [2.2e8, 1.9e8]);
        const equitySplit = snapshot([
            { key: 'charterCapital', label: 'Ustav kapitali', color: GC.accent1 },
            { key: 'retainedEarnings', label: 'Taqsimlanmagan foyda', color: GC.green },
            { key: 'otherReserves', label: 'Boshqa zaxiralar', color: GC.slate },
        ], [4.6e8, 2.9e8, 8.0e7]);
        const cashFlowSplit = {
            parts: [
                { label: 'Operatsion', value: lastOf(cfOperating.data) ?? 0, color: GC.green },
                { label: 'Investitsion', value: lastOf(cfInvesting.data) ?? 0, color: GC.amber },
                { label: 'Moliyaviy', value: lastOf(cfFinancing.data) ?? 0, color: GC.violet },
            ] as BigPart[],
            demo: cfOperating.demo && cfInvesting.demo && cfFinancing.demo,
        };

        return {
            labels, realMonths,
            revenue, profit, margin, netCash,
            cfOperating, cfInvesting, cfFinancing, cashEquivalents,
            assetsTotal, liabTotal, equityTotal, cash,
            currentRatio, debtToEquity,
            assetsSplit, currentAssets, nonCurrentAssets, liabSplit, equitySplit, cashFlowSplit,
        };
    }, [data]);

    const L = v.labels;
    const line = (label: string, s: Series, color: string, fill = false) => ({
        label, data: s, borderColor: color, backgroundColor: alpha(color, fill ? 0.22 : 0.15),
        borderWidth: 2, tension: 0.35, pointRadius: 2, fill, spanGaps: true,
    });
    const bar = (label: string, s: Series, color: string) => ({
        label, data: s, backgroundColor: color, borderRadius: 3, barPercentage: 0.75, categoryPercentage: 0.8,
    });

    const lastVal = (s: { data: Series }) => lastOf(s.data);
    const dateRange = v.realMonths.length
        ? `${v.realMonths[0]} — ${v.realMonths[v.realMonths.length - 1]}`
        : DATA.meta.period;

    const totalSales = DATA.salesByProduct.reduce((s, p) => s + p.revenue, 0);
    const mlnKpi = (s: { data: Series }) => { const x = lastVal(s); return x === null ? '—' : fmtCompact(x); };
    const ratioKpi = (s: { data: Series }) => { const x = lastVal(s); return x === null ? '—' : fmtGrouped(x, 2); };

    return (
        <BigDashRoot>
            <DashHeader title="Moliyaviy vaziyat — sotuv va balans" subtitle={DATA.meta.subtitle} dateRange={dateRange} />

            {/* ── KPI qatori: 10 ta karta (hammasi real API, yo'q bo'lsa namuna) ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Tushum" value={mlnKpi(v.revenue)} delta={deltaPct(v.revenue.data)} iconColor={GC.accent1} />
                <BigKpiCard title="Sof foyda" value={mlnKpi(v.profit)} delta={deltaPct(v.profit.data)} iconColor={GC.green} />
                <BigKpiCard title="Marja" value={lastVal(v.margin) === null ? '—' : `${fmtGrouped(lastVal(v.margin)!, 1)}%`} iconColor={GC.accent2} />
                <BigKpiCard title="Sof pul oqimi" value={mlnKpi(v.netCash)} delta={deltaPct(v.netCash.data)} iconColor={GC.violet} />
                <BigKpiCard title="Jami aktivlar" value={mlnKpi(v.assetsTotal)} delta={deltaPct(v.assetsTotal.data)} iconColor={GC.accent3} />
                <BigKpiCard title="Jami majburiyatlar" value={mlnKpi(v.liabTotal)} delta={deltaPct(v.liabTotal.data)} iconColor={GC.amber} />
                <BigKpiCard title="Jami kapital" value={mlnKpi(v.equityTotal)} delta={deltaPct(v.equityTotal.data)} iconColor={GC.green} />
                <BigKpiCard title="Pul mablag'lari" value={mlnKpi(v.cash)} delta={deltaPct(v.cash.data)} iconColor={GC.cyan} />
                <BigKpiCard title="Joriy likvidlik" value={ratioKpi(v.currentRatio)} iconColor={GC.accent1} />
                <BigKpiCard title="Qarz / kapital" value={ratioKpi(v.debtToEquity)} iconColor={GC.violet} />
            </div>

            {/* ── 22 ta grafik karta: 6 ustun × 4 qator (2 tasi 2 ustunni egallaydi) ── */}
            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
            }}>
                {/* ═══ 1-qator: daromadlilik va likvidlik ═══ */}
                <BigCard title="Tushum dinamikasi" style={cardStyle(v.revenue.demo)}>
                    <BigChartBox>
                        <Line data={{ labels: L, datasets: [line('Tushum', v.revenue.data, GC.accent1, true)] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ money: true, beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Tushum va sof foyda" style={{ gridColumn: 'span 2', ...cardStyle(v.revenue.demo || v.profit.demo) }}>
                    <BigChartBox>
                        <Bar data={{ labels: L, datasets: [bar('Tushum', v.revenue.data, GC.accent1), bar('Sof foyda', v.profit.data, GC.green)] }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ money: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Marja dinamikasi, %" style={cardStyle(v.margin.demo)}>
                    <BigChartBox>
                        <Line data={{ labels: L, datasets: [line('Marja', v.margin.data, GC.accent2, true)] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 1, beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Aktivlar tarkibi" style={cardStyle(v.assetsSplit.demo)}>
                    <BigDonutBody parts={v.assetsSplit.parts} center={fmtCompact(v.assetsSplit.parts.reduce((s, p) => s + p.value, 0))} centerSub="aktivlar" />
                </BigCard>

                <BigCard title="Joriy likvidlik koeffitsienti" style={cardStyle(v.currentRatio.demo)}>
                    <BigChartBox>
                        <Line data={{
                            labels: L,
                            datasets: [
                                line('Joriy likvidlik', v.currentRatio.data, GC.accent1, true),
                                { label: "Me'yor (1,0)", data: L.map(() => 1), borderColor: GC.red, borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1, beginAtZero: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                {/* ═══ 2-qator: pul oqimi ═══ */}
                <BigCard title="Pul oqimi — faoliyat turlari bo'yicha" style={{ gridColumn: 'span 2', ...cardStyle(v.cfOperating.demo) }}>
                    <BigChartBox>
                        <Bar data={{
                            labels: L,
                            datasets: [
                                bar('Operatsion', v.cfOperating.data, GC.green),
                                bar('Investitsion', v.cfInvesting.data, GC.amber),
                                bar('Moliyaviy', v.cfFinancing.data, GC.violet),
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ money: true, beginAtZero: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Pul oqimi tarkibi (oxirgi oy)" style={cardStyle(v.cashFlowSplit.demo)}>
                    <BigDonutBody parts={v.cashFlowSplit.parts} center={fmtCompact(lastVal(v.netCash) ?? 0)} centerSub="sof oqim" />
                </BigCard>

                <BigCard title="Davr oxiridagi pul mablag'lari" style={cardStyle(v.cashEquivalents.demo)}>
                    <BigChartBox>
                        <Line data={{ labels: L, datasets: [line("Pul mablag'lari", v.cashEquivalents.data, GC.cyan, true)] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ money: true, beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Joriy aktivlar tarkibi" style={cardStyle(v.currentAssets.demo)}>
                    <BigDonutBody parts={v.currentAssets.parts} center={fmtCompact(v.currentAssets.parts.reduce((s, p) => s + p.value, 0))} centerSub="joriy" />
                </BigCard>

                <BigCard title="Qarz / kapital koeffitsienti" style={cardStyle(v.debtToEquity.demo)}>
                    <BigChartBox>
                        <Line data={{
                            labels: L,
                            datasets: [
                                line('Qarz / kapital', v.debtToEquity.data, GC.violet, true),
                                { label: 'Chegara (1,0)', data: L.map(() => 1), borderColor: GC.red, borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1, beginAtZero: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                {/* ═══ 3-qator: balans ═══ */}
                <BigCard title="Aktivlar, majburiyatlar, kapital" style={cardStyle(v.assetsTotal.demo)}>
                    <BigChartBox>
                        <Line data={{
                            labels: L,
                            datasets: [
                                line('Aktivlar', v.assetsTotal.data, GC.accent1),
                                line('Kapital', v.equityTotal.data, GC.green),
                                line('Majburiyatlar', v.liabTotal.data, GC.amber),
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ money: true, beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Kapital va majburiyatlar tuzilmasi" style={cardStyle(v.equityTotal.demo || v.liabTotal.demo)}>
                    <BigChartBox>
                        <Bar data={{ labels: L, datasets: [bar('Kapital', v.equityTotal.data, GC.green), bar('Majburiyatlar', v.liabTotal.data, GC.amber)] }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ money: true, stacked: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Uzoq muddatli aktivlar" style={cardStyle(v.nonCurrentAssets.demo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: v.nonCurrentAssets.parts.map((p) => p.label),
                            datasets: [{ data: v.nonCurrentAssets.parts.map((p) => p.value), backgroundColor: v.nonCurrentAssets.parts.map((p) => p.color), borderRadius: 4, barPercentage: 0.75 }],
                        }}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, money: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Majburiyatlar tarkibi" style={cardStyle(v.liabSplit.demo)}>
                    <BigDonutBody parts={v.liabSplit.parts} center={fmtCompact(v.liabSplit.parts.reduce((s, p) => s + p.value, 0))} centerSub="majburiyat" />
                </BigCard>

                <BigCard title="Kapital tarkibi" style={cardStyle(v.equitySplit.demo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: v.equitySplit.parts.map((p) => p.label),
                            datasets: [{ data: v.equitySplit.parts.map((p) => p.value), backgroundColor: v.equitySplit.parts.map((p) => p.color), borderRadius: 4, barPercentage: 0.75 }],
                        }}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, money: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Debitorlik muddatlari, mln" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Bar data={{
                            labels: RECEIVABLES_AGING.map((a) => a.label),
                            datasets: [{ data: RECEIVABLES_AGING.map((a) => a.value), backgroundColor: RECEIVABLES_AGING.map((a) => a.color), borderRadius: 4, barPercentage: 0.7 }],
                        }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} />
                    </BigChartBox>
                </BigCard>

                {/* ═══ 4-qator: sotuv va bozor (API'da yo'q — namuna) ═══ */}
                <BigCard title="Mahsulot bo'yicha sotuv" style={bigDemoCardStyle}>
                    <BigDonutBody
                        parts={DATA.salesByProduct.map((p) => ({ label: p.label, value: p.revenue, color: p.color }))}
                        center={fmtCompact(totalSales)}
                        centerSub={DATA.meta.currency}
                    />
                </BigCard>

                <BigCard title="Realizatsiya narxi va tannarx, $" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Bar data={{
                            labels: DATA.salesByProduct.map((p) => p.label),
                            datasets: [
                                bar('Realizatsiya', DATA.salesByProduct.map((p) => p.realizedPrice), GC.accent1),
                                bar('Tannarx', DATA.salesByProduct.map((p) => p.cashCost), GC.slate),
                            ],
                        }}
                            options={{ ...chartBase, indexAxis: 'y', plugins: legendLarge('top'), scales: bigScales({ horizontal: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Jahon narxlari indeksi (=100)" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Line data={{
                            labels: DATA.trendLabels,
                            datasets: DATA.marketPrices.map((m) => line(m.label, m.trend.map((x) => (x / m.trend[0]) * 100), m.color)),
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1, beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Eksport bozorlari" style={bigDemoCardStyle}>
                    <BigDonutBody
                        parts={DATA.exportMarkets.map((m) => ({ label: m.label, value: m.pct, color: MARKET_COLOR[m.color] ?? GC.slate }))}
                        center={String(DATA.exportMarkets.length)}
                        centerSub="bozor"
                        formatValue={false}
                    />
                </BigCard>

                <BigCard title="Xarajatlar tarkibi (OPEX)" style={bigDemoCardStyle}>
                    <BigDonutBody parts={OPEX_PARTS} center="100%" centerSub="OPEX" formatValue={false} />
                </BigCard>

                <BigCard title="Sun'iy intellekt prognozlari" style={bigDemoCardStyle}>
                    <BigForecastList items={AI_FORECASTS} />
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default FinanceNewMain;
