import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle, fmtGrouped,
    type BigPart, type BigForecast,
} from '../../components/dashboardUILarge';
import treasuryData from './singleTreasuryDemoData.json';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   YAGONA G'AZNACHILIK — TO'LIQ EKRAN (32 ta karta)

   Uslub FinanceNewMain / MetalsDashboardMain bilan bir xil: `BigDashRoot` +
   `DashHeader` + 10 ta `BigKpiCard` + 6 ustun × 4 qatorli `BigCard` to'ri.

   Qatorlar mavzusi:
     1. So'rovlar holati va kelishuv jarayoni
     2. Muddatlar va SLA (kunlik oqim, ko'rib chiqish vaqti, muddati o'tganlar)
     3. To'lovlar va pul pozitsiyasi (kalendar, xarajat moddalari, valyutalar,
        bank hisobvaraqlari)
     4. Tahlil (byudjet ijrosi, kontragentlar, yuklama, reytinglar, AI)

   MA'LUMOT: g'aznachilik bo'yicha API yo'q. Asosiy raqamlar
   `singleTreasuryDemoData.json` dan (so'rovlar soni, holatlar, yo'nalishlar,
   kelishuv bosqichlari, muddati o'tgan so'rovlar), qolgan kesimlar shu
   raqamlarga mos namuna. Barcha kartalar SARIQ ramkada.
   ══════════════════════════════════════════════════════════════════════════ */

const DATA = treasuryData;
type StatusKey = 'new' | 'inWork' | 'approved' | 'overdue';
const STATUS_ORDER: StatusKey[] = ['new', 'inWork', 'approved', 'overdue'];

/* JSON'dagi rus tilidagi yorliqlar ekranning qolgan qismi bilan bir xil
   bo'lishi uchun o'zbekchaga o'giriladi. */
const STATUS_LABEL: Record<StatusKey, string> = {
    new: 'Yangi', inWork: 'Ishda', approved: 'Kelishilgan', overdue: "Muddati o'tgan",
};
const APPROVAL_LABEL: Record<string, string> = {
    'На согласовании у зам. председателей': 'Rais o\'rinbosarlarida',
    'На согласовании у служб': 'Xizmatlarda kelishuvda',
    'На доработке': 'Qayta ishlashda',
    'Одобрено': "Ma'qullangan",
    'Отклонено': 'Rad etilgan',
};
const UNIT = 'mln so\'m';
const card = bigDemoCardStyle;
const f1 = (n: number) => fmtGrouped(n, 1);

/** Familiya + ismning bosh harfi: "Turdibayev Abdurauf ..." → "Turdibayev A.". */
const shortName = (full: string) => {
    const [last, first] = full.split(' ');
    return first ? `${last} ${first[0]}.` : last;
};

/* ── Namuna kesimlar (JSON'dagi jami raqamlarga mos) ── */
const DAYS_IN_MONTH = 31;
/** Iyul bo'yicha kunlik kelgan va kelishilgan so'rovlar (dam olish kunlari past). */
const DAILY = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const weekend = i % 7 === 5 || i % 7 === 6;
    const incoming = weekend ? 1 + (i % 2) : Math.round(5 + 2.5 * Math.sin(i * 0.7) + (i % 3));
    const approved = weekend ? 0 : Math.max(0, Math.round(incoming * (0.45 + 0.2 * Math.sin(i * 0.5))));
    return { day: i + 1, incoming, approved };
});

const OVERDUE_WEEKLY = [
    { label: '1-hafta', value: 11 }, { label: '2-hafta', value: 17 },
    { label: '3-hafta', value: 24 }, { label: '4-hafta', value: 30 },
];

const REVIEW_TIME: BigPart[] = [
    { label: '1 kungacha', value: 18, color: GC.green },
    { label: '1–3 kun', value: 34, color: GC.accent1 },
    { label: '3–5 kun', value: 29, color: GC.amber },
    { label: '5–10 kun', value: 31, color: '#fb923c' },
    { label: '10+ kun', value: 13, color: GC.red },
];

const OVERDUE_AGING = [
    { label: '3–5 kun', value: 38, color: GC.amber },
    { label: '6–10 kun', value: 24, color: '#fb923c' },
    { label: '11–20 kun', value: 13, color: GC.red },
    { label: '20+ kun', value: 7, color: '#b91c1c' },
];

const PAYMENT_CALENDAR = [
    { d: '01.08', v: 12.4 }, { d: '02.08', v: 8.1 }, { d: '05.08', v: 21.7 }, { d: '06.08', v: 14.2 },
    { d: '07.08', v: 9.6 }, { d: '08.08', v: 31.5 }, { d: '09.08', v: 6.3 }, { d: '12.08', v: 18.9 },
    { d: '13.08', v: 11.2 }, { d: '14.08', v: 24.8 }, { d: '15.08', v: 16.4 }, { d: '16.08', v: 42.1 },
];

const CASH_IN = [312, 298, 341, 356, 330, 368, 352];
const CASH_OUT = [287, 305, 318, 341, 322, 349, 361];
const CASH_WEEKS = ['1-h', '2-h', '3-h', '4-h', '5-h', '6-h', '7-h'];

const COST_ITEMS = [
    { label: 'Xomashyo va materiallar', value: 92.4, color: GC.accent1 },
    { label: 'Kapital qo\'yilmalar', value: 61.8, color: GC.violet },
    { label: 'Energiya resurslari', value: 43.5, color: GC.amber },
    { label: 'Xizmatlar va pudrat', value: 38.2, color: GC.accent3 },
    { label: 'Soliq va yig\'imlar', value: 24.1, color: GC.red },
    { label: 'Boshqa', value: 18.3, color: GC.slate },
];

const PAYMENT_TYPES: BigPart[] = [
    { label: 'Bank o\'tkazmasi', value: 71, color: GC.accent1 },
    { label: 'Akkreditiv', value: 14, color: GC.violet },
    { label: 'Avans to\'lovi', value: 11, color: GC.amber },
    { label: 'Korporativ karta', value: 4, color: GC.slate },
];

const CURRENCIES: BigPart[] = [
    { label: 'UZS', value: 58, color: GC.accent1 },
    { label: 'USD', value: 27, color: GC.green },
    { label: 'EUR', value: 8, color: GC.violet },
    { label: 'CNY', value: 5, color: GC.amber },
    { label: 'RUB', value: 2, color: GC.slate },
];

const BANK_BALANCES = [
    { label: 'Milliy bank', value: 412.6, color: GC.accent1 },
    { label: 'Asakabank', value: 238.1, color: GC.accent3 },
    { label: 'Ipoteka-bank', value: 154.7, color: GC.violet },
    { label: 'Xalq banki', value: 96.3, color: GC.amber },
    { label: 'Aloqabank', value: 47.9, color: GC.slate },
];

const BUDGET_EXEC = [
    { label: 'Xomashyo', plan: 98, fact: 92.4 },
    { label: 'Kap. qo\'yilma', plan: 85, fact: 61.8 },
    { label: 'Energiya', plan: 45, fact: 43.5 },
    { label: 'Xizmatlar', plan: 42, fact: 38.2 },
    { label: 'Soliqlar', plan: 24, fact: 24.1 },
];

const COUNTERPARTIES = [
    { label: 'Olmaliq KMK', value: 48.3 },
    { label: 'O\'zbekenergo', value: 36.9 },
    { label: 'Temir yo\'llari', value: 27.4 },
    { label: 'Kimyo sanoati', value: 21.8 },
    { label: 'Navoiy azot', value: 16.2 },
    { label: 'Boshqalar', value: 31.7 },
];

const WEEKDAY_LOAD = [
    { label: 'Du', value: 29 }, { label: 'Se', value: 24 }, { label: 'Ch', value: 22 },
    { label: 'Pa', value: 21 }, { label: 'Ju', value: 26 }, { label: 'Sh', value: 2 }, { label: 'Ya', value: 1 },
];

const AI_FORECASTS: BigForecast[] = [
    { text: "Muddati o'tganlar 2 haftada −18%", detail: "Joriy kelishuv sur'atida", confidence: 72, color: GC.green },
    { text: "Avgust boshida to'lov cho'qqisi", detail: '16.08 — 42,1 mln so\'m', confidence: 84, color: GC.amber },
    { text: 'Kelgusi haftada ~30 ta yangi so\'rov', detail: 'Oxirgi 4 hafta trendi', confidence: 79, color: GC.accent1 },
    { text: 'Kap. qo\'yilmalar byudjeti 73% bajariladi', detail: 'Reja 85 mln so\'m', confidence: 66, color: GC.amber },
    { text: "Bir yo'nalishda yuklama keskin oshgan", detail: "Turdibayev A. — 77 ta muddati o'tgan", confidence: 91, color: GC.red },
];

const SingleTreasury: React.FC = () => {
    const directions = DATA.directions;
    const statuses = DATA.statuses as Record<StatusKey, { label: string; color: string }>;
    const amounts = DATA.amounts as Record<StatusKey, number>;

    const v = useMemo(() => {
        const counts: Record<StatusKey, number> = { new: 0, inWork: 0, approved: 0, overdue: 0 };
        directions.forEach((d) => STATUS_ORDER.forEach((k) => { counts[k] += (d.counts as Record<StatusKey, number>)[k] ?? 0; }));
        const total = STATUS_ORDER.reduce((s, k) => s + counts[k], 0);
        const totalAmount = STATUS_ORDER.reduce((s, k) => s + (amounts[k] ?? 0), 0);
        const approvedStage = DATA.approvalStatus.find((a) => a.label === 'Одобрено')?.value ?? 0;
        const rejectedStage = DATA.approvalStatus.find((a) => a.label === 'Отклонено')?.value ?? 0;
        const onTimePct = total ? ((total - counts.overdue) / total) * 100 : 0;

        /* Yo'nalish samaradorligi: muddati o'tmagan so'rovlar ulushi. */
        const directionRank = directions.map((d) => {
            const c = d.counts as Record<StatusKey, number>;
            const t = STATUS_ORDER.reduce((s, k) => s + (c[k] ?? 0), 0);
            return { name: shortName(d.name), color: d.color, total: t, onTime: t ? ((t - c.overdue) / t) * 100 : 0 };
        }).sort((a, b) => b.onTime - a.onTime);

        return { counts, total, totalAmount, approvedStage, rejectedStage, onTimePct, directionRank };
    }, [directions, amounts]);

    const statusParts: BigPart[] = STATUS_ORDER.map((k) => ({ label: STATUS_LABEL[k], value: v.counts[k], color: statuses[k].color }));
    const amountParts: BigPart[] = STATUS_ORDER
        .filter((k) => (amounts[k] ?? 0) > 0)
        .map((k) => ({ label: STATUS_LABEL[k], value: amounts[k], color: statuses[k].color }));
    const directionParts: BigPart[] = directions
        .filter((d) => d.amount > 0)
        .map((d) => ({ label: shortName(d.name), value: d.amount, color: d.color }));
    const slaParts: BigPart[] = [
        { label: "O'z vaqtida", value: v.total - v.counts.overdue, color: GC.green },
        { label: "Muddati o'tgan", value: v.counts.overdue, color: GC.red },
    ];

    const hBar = (labels: string[], values: number[], colors: string | string[]) => ({
        labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, barPercentage: 0.75 }],
    });

    return (
        <BigDashRoot>
            <DashHeader title="Yagona g'aznachilik — to'lov so'rovlari" subtitle={DATA.meta.subtitle} dateRange={DATA.meta.periodRange} />

            {/* ── KPI qatori: 10 ta karta ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Jami so'rovlar" value={String(v.total)} iconColor={GC.accent1} />
                <BigKpiCard title="Yangi" value={String(v.counts.new)} iconColor={statuses.new.color} />
                <BigKpiCard title="Ishda" value={String(v.counts.inWork)} iconColor={statuses.inWork.color} />
                <BigKpiCard title="Muddati o'tgan" value={String(v.counts.overdue)} iconColor={GC.red} />
                <BigKpiCard title="Ma'qullangan" value={String(v.approvedStage)} iconColor={GC.green} />
                <BigKpiCard title="Rad etilgan" value={String(v.rejectedStage)} iconColor={GC.slate} />
                <BigKpiCard title={`Jami summa, ${UNIT}`} value={f1(v.totalAmount)} iconColor={GC.accent2} />
                <BigKpiCard title={`Muddati o'tgan, ${UNIT}`} value={f1(amounts.overdue)} iconColor={GC.red} />
                <BigKpiCard title="O'rtacha ko'rib chiqish" value="4,2 kun" iconColor={GC.amber} />
                <BigKpiCard title="O'z vaqtida bajarilish" value={`${f1(v.onTimePct)}%`} iconColor={v.onTimePct >= 70 ? GC.green : GC.amber} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
            }}>
                {/* ═══ 1-qator: holat va kelishuv jarayoni ═══ */}
                <BigCard title="So'rovlar holati" style={card}>
                    <BigDonutBody parts={statusParts} center={String(v.total)} centerSub="so'rov" formatValue={(x) => `${x} ta`} />
                </BigCard>

                <BigCard title={`Holat bo'yicha summa, ${UNIT}`} style={card}>
                    <BigDonutBody parts={amountParts} center={f1(v.totalAmount)} centerSub={UNIT} formatValue={f1} />
                </BigCard>

                <BigCard title="Kelishuv bosqichlari" style={card}>
                    <BigChartBox>
                        <Bar
                            data={hBar(DATA.approvalStatus.map((a) => APPROVAL_LABEL[a.label] ?? a.label), DATA.approvalStatus.map((a) => a.value), DATA.approvalStatus.map((a) => a.color))}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Yo'nalishlar bo'yicha so'rovlar — holatlar kesimida" style={{ gridColumn: 'span 2', ...card }}>
                    <BigChartBox>
                        <Bar
                            data={{
                                labels: directions.map((d) => shortName(d.name)),
                                datasets: STATUS_ORDER.map((k) => ({
                                    label: STATUS_LABEL[k],
                                    data: directions.map((d) => (d.counts as Record<StatusKey, number>)[k] ?? 0),
                                    backgroundColor: statuses[k].color,
                                    borderRadius: 3, barPercentage: 0.7,
                                })),
                            }}
                            options={{ ...chartBase, indexAxis: 'y', plugins: legendLarge('top'), scales: bigScales({ horizontal: true, stacked: true }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title={`Yo'nalishlar bo'yicha summa, ${UNIT}`} style={card}>
                    <BigDonutBody parts={directionParts} center={f1(directions.reduce((s, d) => s + d.amount, 0))} centerSub={UNIT} formatValue={f1} />
                </BigCard>

                {/* ═══ 2-qator: muddatlar va SLA ═══ */}
                <BigCard title="Kunlik oqim — kelgan va kelishilgan (iyul)" style={{ gridColumn: 'span 2', ...card }}>
                    <BigChartBox>
                        <Line
                            data={{
                                labels: DAILY.map((d) => String(d.day)),
                                datasets: [
                                    { label: 'Kelgan', data: DAILY.map((d) => d.incoming), borderColor: GC.accent1, backgroundColor: alpha(GC.accent1, 0.22), borderWidth: 2, tension: 0.35, pointRadius: 0, fill: true },
                                    { label: 'Kelishilgan', data: DAILY.map((d) => d.approved), borderColor: GC.green, backgroundColor: alpha(GC.green, 0.15), borderWidth: 2, tension: 0.35, pointRadius: 0, fill: false },
                                ],
                            }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Muddati o'tganlar — haftalar bo'yicha" style={card}>
                    <BigChartBox>
                        <Bar
                            data={{ labels: OVERDUE_WEEKLY.map((w) => w.label), datasets: [{ data: OVERDUE_WEEKLY.map((w) => w.value), backgroundColor: OVERDUE_WEEKLY.map((_, i) => alpha(GC.red, 0.45 + i * 0.17)), borderRadius: 4, barPercentage: 0.65 }] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales() } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Ko'rib chiqish muddati" style={card}>
                    <BigDonutBody parts={REVIEW_TIME} center="4,2" centerSub="kun o'rtacha" formatValue={(x) => `${x} ta`} />
                </BigCard>

                <BigCard title="Muddati o'tganlar — kechikish davri" style={card}>
                    <BigChartBox>
                        <Bar
                            data={{ labels: OVERDUE_AGING.map((a) => a.label), datasets: [{ data: OVERDUE_AGING.map((a) => a.value), backgroundColor: OVERDUE_AGING.map((a) => a.color), borderRadius: 4, barPercentage: 0.65 }] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales() } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="SLA bajarilishi" style={card}>
                    <BigDonutBody parts={slaParts} center={`${fmtGrouped(v.onTimePct, 0)}%`} centerSub="o'z vaqtida" formatValue={(x) => `${x} ta`} />
                </BigCard>

                {/* ═══ 3-qator: to'lovlar va pul pozitsiyasi ═══ */}
                <BigCard title={`To'lov kalendari, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Bar
                            data={{ labels: PAYMENT_CALENDAR.map((p) => p.d), datasets: [{ data: PAYMENT_CALENDAR.map((p) => p.v), backgroundColor: PAYMENT_CALENDAR.map((p) => (p.v >= 30 ? GC.amber : GC.accent1)), borderRadius: 3, barPercentage: 0.7 }] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales() } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title={`Pul pozitsiyasi — kirim / chiqim, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Line
                            data={{
                                labels: CASH_WEEKS,
                                datasets: [
                                    { label: 'Kirim', data: CASH_IN, borderColor: GC.green, backgroundColor: alpha(GC.green, 0.15), borderWidth: 2, tension: 0.35, pointRadius: 2, fill: false },
                                    { label: 'Chiqim', data: CASH_OUT, borderColor: GC.red, backgroundColor: alpha(GC.red, 0.15), borderWidth: 2, tension: 0.35, pointRadius: 2, fill: false },
                                ],
                            }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ beginAtZero: false }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title={`Xarajat moddalari, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Bar
                            data={hBar(COST_ITEMS.map((c) => c.label), COST_ITEMS.map((c) => c.value), COST_ITEMS.map((c) => c.color))}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="To'lov turlari" style={card}>
                    <BigDonutBody parts={PAYMENT_TYPES} center="100%" centerSub="to'lovlar" formatValue={false} />
                </BigCard>

                <BigCard title="Valyutalar bo'yicha" style={card}>
                    <BigDonutBody parts={CURRENCIES} center="5" centerSub="valyuta" formatValue={false} />
                </BigCard>

                <BigCard title={`Bank hisobvaraqlari qoldig'i, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Bar
                            data={hBar(BANK_BALANCES.map((b) => b.label), BANK_BALANCES.map((b) => b.value), BANK_BALANCES.map((b) => b.color))}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                {/* ═══ 4-qator: tahlil ═══ */}
                <BigCard title={`Byudjet ijrosi — reja va fakt, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Bar
                            data={{
                                labels: BUDGET_EXEC.map((b) => b.label),
                                datasets: [
                                    { label: 'Reja', data: BUDGET_EXEC.map((b) => b.plan), backgroundColor: GC.slate, borderRadius: 3, barPercentage: 0.75 },
                                    { label: 'Fakt', data: BUDGET_EXEC.map((b) => b.fact), backgroundColor: GC.accent1, borderRadius: 3, barPercentage: 0.75 },
                                ],
                            }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title={`Yirik kontragentlar, ${UNIT}`} style={card}>
                    <BigChartBox>
                        <Bar
                            data={hBar(COUNTERPARTIES.map((c) => c.label), COUNTERPARTIES.map((c) => c.value), GC.accent3)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Hafta kunlari bo'yicha yuklama" style={card}>
                    <BigChartBox>
                        <Bar
                            data={{ labels: WEEKDAY_LOAD.map((w) => w.label), datasets: [{ data: WEEKDAY_LOAD.map((w) => w.value), backgroundColor: WEEKDAY_LOAD.map((w) => (w.value >= 25 ? GC.amber : GC.accent1)), borderRadius: 4, barPercentage: 0.65 }] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales() } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Muddati o'tgan so'rovlar" style={card}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 6, overflow: 'hidden' }}>
                        {DATA.overdueRequests.map((r) => {
                            const color = r.days >= 5 ? GC.red : r.days >= 4 ? '#fb923c' : GC.amber;
                            return (
                                <div key={r.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${alpha(color, 0.3)}`, minWidth: 0 }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ color: C.text, fontSize: 'clamp(10px, 2.5cqmin, 15px)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.code}</div>
                                        <div style={{ color: C.sub, fontSize: 'clamp(9px, 2.1cqmin, 12px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.direction} · {f1(r.amount)} {UNIT}</div>
                                    </div>
                                    <span style={{ flexShrink: 0, color, fontWeight: 700, fontSize: 'clamp(10px, 2.4cqmin, 14px)', background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.35)}`, borderRadius: 6, padding: '2px 7px' }}>{r.days} kun</span>
                                </div>
                            );
                        })}
                    </div>
                </BigCard>

                <BigCard title="Yo'nalishlar reytingi — o'z vaqtida" style={card}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 8, overflow: 'hidden' }}>
                        {v.directionRank.map((d, i) => {
                            const color = d.onTime >= 60 ? GC.green : d.onTime >= 40 ? GC.amber : GC.red;
                            return (
                                <div key={d.name}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                            <span style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(9px, 2.1cqmin, 12px)', fontWeight: 700, color: d.color, background: alpha(d.color, 0.15), border: `1px solid ${alpha(d.color, 0.45)}` }}>{i + 1}</span>
                                            <span style={{ color: C.text, fontSize: 'clamp(10px, 2.5cqmin, 15px)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                                        </span>
                                        <span style={{ color, fontWeight: 700, fontSize: 'clamp(10px, 2.5cqmin, 15px)', flexShrink: 0 }}>{fmtGrouped(d.onTime, 0)}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                        <div style={{ width: `${d.onTime}%`, height: '100%', borderRadius: 3, background: color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </BigCard>

                <BigCard title="Sun'iy intellekt prognozlari" style={card}>
                    <BigForecastList items={AI_FORECASTS} />
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default SingleTreasury;
