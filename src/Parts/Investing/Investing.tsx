import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle, fmtGrouped,
    type BigPart, type BigForecast,
} from '../../components/dashboardUILarge';
import investingData from './investingDemoData.json';
import { useGetAllInvestProjects } from '../../hooks/map';
import type { InvestProjectListItem } from '../../services/map';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   INVESTITSIYA LOYIHALARI — TO'LIQ EKRAN (32 ta karta)

   Uslub FinanceNewMain / SingleTreasury bilan bir xil: `BigDashRoot` +
   `DashHeader` + 10 ta `BigKpiCard` + 6 ustun × 4 qatorli `BigCard` to'ri.

   MA'LUMOT — AVVAL HAQIQIY API (INVEST_PROJECTS_API.md):
     `GET /invest-projects` (filtrsiz → reestrdagi barcha 7 loyiha).
     Hujjatdagi uchta qoida qat'iy bajarilgan:
       1. `progressShare`, `irrShare` — ULUSH (0…1), ko'rsatishda ×100;
          suzuvchi nuqta xatosi chiqmasligi uchun yumaloqlanadi.
       2. `payback/irr/npv/annualOutputQty` — son YOKI matn. Matn
          («TIA da aniqlanadi») bo'sh katak emas, o'z holida ko'rsatiladi;
          ikkalasi ham `null` bo'lsa — «ma'lumot yo'q».
       3. `annualOutputQty` — aralash o'lchov (tonna / dona): hech qayerda
          YIG'ILMAYDI va bitta shkalaga qo'yilmaydi, faqat loyiha qatorida.

   DEMO — FAQAT YETMAGANDA (SARIQ ramka):
     • API javob bermasa (token yo'q, xato) — hujjatdagi shaklda 7 ta namuna
       loyiha bilan to'ladi.
     • Choraklar bo'yicha reja/fakt va kumulyativ o'zlashtirish — API'da
       choraklik kesim yo'q (`investingDemoData.json`).
     • Sun'iy intellekt prognozlari.
   ══════════════════════════════════════════════════════════════════════════ */

type Project = InvestProjectListItem;
const card = bigDemoCardStyle;
const cardStyle = (demo: boolean) => (demo ? card : undefined);
const f1 = (n: number) => fmtGrouped(n, 1);
/** Ulushni foizga: 0.189 → 18.9 (suzuvchi nuqta xatosiz). */
const sharePct = (s: number) => Math.round(s * 1000) / 10;

/* Grafiklarda uzun nomlar sig'masligi uchun `key` bo'yicha qisqa nom
   (kalitlar hujjatdagi INVEST_KEY_ALIASES jadvalidan). */
const SHORT_NAME: Record<string, string> = {
    miskon: 'Miskon', molibdenGmc: 'Molibden GMS', kukun: 'Kukun metall.',
    ingichka: 'Ingichka', sarikul: 'Sarikoʻl', volframGmc: 'Volfram GMS', sulfat: 'Sulfat kislota',
};
const PROJECT_COLOR = [GC.accent1, GC.green, '#f97316', GC.amber, GC.violet, GC.cyan, '#e11d48'];
const TYPE_META: Record<string, { label: string; color: string }> = {
    mine: { label: 'MINE — xomashyo', color: GC.amber },
    metall: { label: 'METALL — qayta ishlash', color: GC.accent1 },
    market: { label: 'MARKET — bozor', color: GC.green },
    none: { label: 'Turkumlanmagan', color: GC.slate },
};
const TEA_TEXT = 'TIA da aniqlanadi';

/** Gorizontal bar uchun yorliq: son — bar oxirida; son yo'q bo'lsa API matni
 *  («TIA da aniqlanadi») o'z holida sariq rangda, ikkalasi yo'q — «ma'lumot yo'q». */
const hBarLabel = (format: (x: number) => string, texts: (string | null | undefined)[] = []) => ({
    id: 'hBarLabel',
    afterDatasetsDraw(chart: any) {
        const { ctx, chartArea } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = '700 13px "Segoe UI", sans-serif';
        ctx.textBaseline = 'middle';
        meta.data.forEach((el: any, i: number) => {
            const val = chart.data.datasets[0].data[i];
            if (typeof val === 'number') {
                const text = format(val);
                const w = ctx.measureText(text).width;
                const inside = el.x + 6 + w > chartArea.right;
                ctx.fillStyle = C.text;
                ctx.textAlign = inside ? 'right' : 'left';
                ctx.fillText(text, inside ? el.x - 6 : el.x + 6, el.y);
            } else {
                ctx.fillStyle = texts[i] ? GC.amber : C.sub;
                ctx.textAlign = 'left';
                ctx.fillText(texts[i] || "ma'lumot yo'q", chartArea.left + 6, el.y);
            }
        });
        ctx.restore();
    },
});

/* ── API kelmaganda: hujjatdagi shakl va kalitlar bilan 7 ta namuna loyiha ── */
const demoProject = (p: Partial<Project> & Pick<Project, 'id' | 'key' | 'name'>): Project => ({
    type: 'metall', projectCode: null, enterprise: '"OʻzTMK" AJ', region: null, goal: null, kind: null,
    progressShare: null, state: null, priority: null, capacity: null, durationMonths: null,
    startDateText: null, endDateText: null, totalCostMlnUsd: null, disbursedMlnUsd: null, jobs: null,
    product: null, commissioningText: null, fsState: null, ...p,
} as Project);

const DEMO_PROJECTS: Project[] = [
    demoProject({ id: 1, key: 'miskon', type: 'mine', name: '«Miskon» mis-porfirli konini oʻzlashtirish', region: 'Toshkent viloyati Piskent tumani', kind: 'Geologiya-qidiruv', progressShare: 0.46, state: 'Amalga oshirilayotgan loyiha', priority: 9, durationMonths: 12, totalCostMlnUsd: 21.5, disbursedMlnUsd: 10, paybackText: TEA_TEXT, irrText: TEA_TEXT, npvText: TEA_TEXT, jobs: 60, fsState: 'Ishlab chiqilmoqda', docState: 'Ishlab chiqilmoqda', areaHa: 120, equipment: 'Mavjud', objectKind: 'Kon', funding: 'OʻzTTJ mablagʻlari', risks: 'Geologik xatar' }),
    demoProject({ id: 2, key: 'molibdenGmc', name: 'Molibden kuyindisini qayta ishlash — gidrometallurgiya sexi', region: 'Toshkent viloyati Ohangaron tumani', kind: 'Yangi qurilish', progressShare: 0.01, state: 'Loyihalash bosqichida', priority: 10, durationMonths: 20, totalCostMlnUsd: 41, disbursedMlnUsd: 0.5, paybackText: TEA_TEXT, irrText: TEA_TEXT, npvText: TEA_TEXT, jobs: 117, annualOutputMlnUsd: 38.2, annualOutputQty: 5000, fsState: 'TIA ishlab chiqilgan', docState: 'Ishlab chiqilmagan', areaHa: 10, equipment: 'Mavjud', objectKind: 'Sex', funding: 'Oʻz mablagʻlari, OʻzTTJ mablagʻlari, Kredit', risks: 'Mavjud emas' }),
    demoProject({ id: 3, key: 'kukun', name: 'Kukun metallurgiyasi asosida detallar ishlab chiqarish', region: 'Toshkent viloyati Ohangaron tumani', kind: 'Yangi qurilish', progressShare: 0.35, state: 'Amalga oshirilayotgan loyiha', priority: 10, durationMonths: 12, totalCostMlnUsd: 15.3, disbursedMlnUsd: 0, paybackYears: 5.8, irrShare: 0.189, npvMlnUsd: 5.13, jobs: 50, annualOutputMlnUsd: 11.5, annualOutputQtyText: '50 000 000 dona', fsState: 'TIA ishlab chiqilgan', docState: 'Ishlab chiqilgan', areaHa: 2.2, equipment: 'Mavjud', objectKind: 'Zavod', funding: 'Oʻz mablagʻlari, OʻzTTJ mablagʻlari', risks: 'Mavjud emas' }),
    demoProject({ id: 4, key: 'ingichka', type: 'mine', name: '«Ingichka» konida volfram chiqindilarini qayta ishlash', region: 'Samarqand viloyati Kattaqoʻrgʻon tumani', kind: 'Kengaytirish', progressShare: 0.58, state: 'Amalga oshirilayotgan loyiha', priority: 8, durationMonths: 18, totalCostMlnUsd: 11, disbursedMlnUsd: 2, paybackYears: 3.9, irrShare: 0.241, npvMlnUsd: 7.4, jobs: 85, annualOutputMlnUsd: 9.8, annualOutputQty: 1045, fsState: 'TIA tasdiqlangan', docState: 'Shaharsozlik ijobiy ekspertizasi olingan', areaHa: 14.5, equipment: 'Mavjud', objectKind: 'Sex', funding: 'OʻzTTJ mablagʻlari', risks: 'Xomashyo sifati' }),
    demoProject({ id: 5, key: 'sarikul', type: 'mine', name: '«Sarikoʻl» volfram konini oʻzlashtirish', region: 'Samarqand viloyati Urgut tumani', kind: 'Yangi qurilish', progressShare: 0.22, state: 'Loyihalash bosqichida', priority: 9, durationMonths: 42, totalCostMlnUsd: 100, disbursedMlnUsd: 8.7, paybackText: TEA_TEXT, irrText: TEA_TEXT, npvText: TEA_TEXT, jobs: 420, annualOutputMlnUsd: 64, annualOutputQty: 600000, fsState: 'Ishlab chiqilmoqda', docState: 'Shaharsozlik ekspertizada', areaHa: 310, equipment: 'Yoʻq', objectKind: 'Kon', funding: 'OʻzTTJ mablagʻlari, Xorijiy kredit', risks: 'Infratuzilma yetishmovchiligi' }),
    demoProject({ id: 6, key: 'volframGmc', name: 'Volfram konsentratini qayta ishlash — gidrometallurgiya sexi', region: 'Samarqand viloyati Kattaqoʻrgʻon tumani', kind: 'Yangi qurilish', progressShare: 0.12, state: 'Tayyorgarlik bosqichida', priority: 9, durationMonths: 24, totalCostMlnUsd: 54.6, disbursedMlnUsd: 4.3, paybackYears: 6.4, irrText: TEA_TEXT, npvMlnUsd: 18.2, jobs: 140, annualOutputMlnUsd: 46.5, annualOutputQty: 5000, fsState: 'TIA ishlab chiqilgan', docState: 'Ishlab chiqilmoqda', areaHa: 12, equipment: 'Mavjud', objectKind: 'Sex', funding: 'Oʻz mablagʻlari, OʻzTTJ mablagʻlari', risks: 'Reagent narxlari' }),
    demoProject({ id: 7, key: 'sulfat', name: 'Sulfat kislotasi ishlab chiqarish', region: 'Navoiy viloyati Qiziltepa tumani', kind: 'Yangi qurilish', progressShare: 0.7, state: 'Amalga oshirilayotgan loyiha', priority: 8, durationMonths: 24, totalCostMlnUsd: 54.5, disbursedMlnUsd: 14.9, paybackYears: 4.6, irrShare: 0.214, npvMlnUsd: 21.3, jobs: 180, annualOutputMlnUsd: 41, annualOutputQty: 500000, fsState: 'TIA tasdiqlangan', docState: 'Ishlab chiqilgan', areaHa: 18, equipment: 'Mavjud', objectKind: 'Zavod', funding: 'Oʻz mablagʻlari, Xorijiy investitsiya, OʻzTTJ mablagʻlari', risks: 'Sotuv bozori' }),
];

const AI_FORECASTS: BigForecast[] = [
    { text: "4-chorakda o'zlashtirish keskin oshadi", detail: '4-chorak rejasi 98,5 mln $', confidence: 63, color: GC.amber },
    { text: 'Sulfat kislotasi muddatida ishga tushadi', detail: 'Bajarilish 70%, eng yuqori', confidence: 82, color: GC.green },
    { text: 'Molibden GMS da kechikish xavfi', detail: "Bajarilish 1%, loyiha-smeta hujjatlari yo'q", confidence: 71, color: GC.red },
    { text: 'Sarikoʻl — portfeldagi eng katta ta\'sir', detail: '420 ish oʻrni, 64 mln $/yil', confidence: 77, color: GC.accent1 },
    { text: 'TIA yakunlangach portfel IRR ≈ 20%', detail: 'Hisoblangan loyihalar oʻrtachasi', confidence: 58, color: GC.accent2 },
];

const Investing: React.FC = () => {
    const { data: apiProjects } = useGetAllInvestProjects('uz');

    const v = useMemo(() => {
        const real = Array.isArray(apiProjects) && apiProjects.length > 0;
        const projects: Project[] = real ? [...apiProjects!].sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id)) : DEMO_PROJECTS;
        const name = (p: Project) => SHORT_NAME[p.key] ?? (p.name.length > 20 ? `${p.name.slice(0, 19)}…` : p.name);
        const color = (_p: Project, i: number) => PROJECT_COLOR[i % PROJECT_COLOR.length];
        const n = (x: number | null | undefined) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
        const sum = (sel: (p: Project) => number | null | undefined) => projects.reduce((s, p) => s + (n(sel(p)) ?? 0), 0);

        const totalCost = sum((p) => p.totalCostMlnUsd);
        const disbursed = sum((p) => p.disbursedMlnUsd);
        const progress = projects.map((p) => n(p.progressShare)).filter((x): x is number => x !== null);
        const irrs = projects.map((p) => n(p.irrShare)).filter((x): x is number => x !== null);
        const npvs = projects.map((p) => n(p.npvMlnUsd)).filter((x): x is number => x !== null);

        /** Guruhlash: kalit bo'yicha soni va qiymati. */
        const groupBy = (keyOf: (p: Project) => string) => {
            const m = new Map<string, { count: number; cost: number }>();
            projects.forEach((p) => {
                const k = keyOf(p);
                const cur = m.get(k) ?? { count: 0, cost: 0 };
                cur.count += 1; cur.cost += n(p.totalCostMlnUsd) ?? 0;
                m.set(k, cur);
            });
            return Array.from(m.entries());
        };

        /* Moliyalashtirish manbai erkin matn («A, B, C») — vergul bo'yicha
           ajratilib, har bir manba nechta loyihada tilga olingani sanaladi. */
        const fundingMentions = new Map<string, number>();
        projects.forEach((p) => String(p.funding ?? '').split(',').map((s) => s.trim()).filter(Boolean)
            .forEach((s) => fundingMentions.set(s, (fundingMentions.get(s) ?? 0) + 1)));

        return {
            real, projects, name, color, n,
            totalCost, disbursed,
            disbursedPct: totalCost ? (disbursed / totalCost) * 100 : 0,
            avgProgress: progress.length ? sharePct(progress.reduce((s, x) => s + x, 0) / progress.length) : null,
            jobs: sum((p) => p.jobs),
            annualOutputMln: sum((p) => p.annualOutputMlnUsd),
            avgIrr: irrs.length ? sharePct(irrs.reduce((s, x) => s + x, 0) / irrs.length) : null,
            irrCount: irrs.length,
            npvTotal: npvs.reduce((s, x) => s + x, 0),
            npvCount: npvs.length,
            area: sum((p) => p.areaHa),
            byType: groupBy((p) => (p.type ?? 'none') as string),
            byState: groupBy((p) => p.state ?? "Holati ko'rsatilmagan"),
            byRegion: groupBy((p) => (p.region ?? "Hudud ko'rsatilmagan").split(' ').slice(0, 2).join(' ')),
            byKind: groupBy((p) => p.kind ?? "Turi ko'rsatilmagan"),
            fundingMentions: Array.from(fundingMentions.entries()).sort((a, b) => b[1] - a[1]),
        };
    }, [apiProjects]);

    const P = v.projects;
    const labels = P.map(v.name);
    const colors = P.map(v.color);
    const demo = !v.real;
    const q = investingData.totals;

    /** Bir loyiha ko'rsatkichi: son → formatlangan, matn → o'z holida, ikkalasi yo'q → «—». */
    const numOrText = (num: number | null | undefined, text: string | null | undefined, fmt: (x: number) => string) =>
        (typeof num === 'number' ? { value: fmt(num), kind: 'num' as const } : text ? { value: text, kind: 'text' as const } : { value: "ma'lumot yo'q", kind: 'none' as const });

    const valueBar = (values: (number | null)[], barColors: string | string[]) => ({
        labels, datasets: [{ data: values, backgroundColor: barColors, borderRadius: 4, barPercentage: 0.75 }],
    });
    const groupParts = (groups: [string, { count: number; cost: number }][], colorOf: (k: string, i: number) => string, labelOf = (k: string) => k): BigPart[] =>
        groups.map(([k, g], i) => ({ label: labelOf(k), value: g.count, color: colorOf(k, i) }));

    const ProjectList: React.FC<{ children: (p: Project, i: number) => React.ReactNode }> = ({ children }) => (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 4, overflow: 'hidden' }}>
            {P.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], flexShrink: 0 }} />
                    <span style={{ color: C.text, fontSize: 'clamp(10px, 2.4cqmin, 14px)', width: '36%', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{labels[i]}</span>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>{children(p, i)}</div>
                </div>
            ))}
        </div>
    );
    const Tag: React.FC<{ text: string; color: string }> = ({ text, color }) => (
        <span title={text} style={{ color, fontSize: 'clamp(9px, 2.1cqmin, 12px)', fontWeight: 600, background: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.35)}`, borderRadius: 6, padding: '1px 6px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    );
    const kindColor = (k: 'num' | 'text' | 'none') => (k === 'num' ? GC.green : k === 'text' ? GC.amber : GC.slate);

    return (
        <BigDashRoot>
            <DashHeader title="Investitsiya loyihalari — portfel" subtitle="«OʻzTMK» AJ investitsiya reestri" dateRange={`Reestr: ${P.length} ta loyiha`} />

            {/* ── KPI qatori: 10 ta karta ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Loyihalar soni" value={String(P.length)} iconColor={GC.accent1} />
                <BigKpiCard title="Umumiy qiymati, mln $" value={f1(v.totalCost)} iconColor={GC.accent2} />
                <BigKpiCard title="Oʻzlashtirilgan, mln $" value={f1(v.disbursed)} iconColor={GC.green} />
                <BigKpiCard title="Oʻzlashtirish" value={`${f1(v.disbursedPct)}%`} iconColor={v.disbursedPct >= 30 ? GC.green : GC.amber} />
                <BigKpiCard title="Oʻrtacha bajarilish" value={v.avgProgress === null ? '—' : `${f1(v.avgProgress)}%`} iconColor={GC.accent3} />
                <BigKpiCard title="Ish oʻrinlari" value={fmtGrouped(v.jobs, 0)} iconColor={GC.violet} />
                <BigKpiCard title="Yillik ishlab chiq., mln $" value={f1(v.annualOutputMln)} iconColor={GC.cyan} />
                <BigKpiCard title={`Oʻrtacha IRR (${v.irrCount} ta)`} value={v.avgIrr === null ? '—' : `${f1(v.avgIrr)}%`} iconColor={GC.green} />
                <BigKpiCard title={`Jami NPV (${v.npvCount} ta), mln $`} value={f1(v.npvTotal)} iconColor={GC.accent1} />
                <BigKpiCard title="Maydon, ga" value={f1(v.area)} iconColor={GC.amber} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
            }}>
                {/* ═══ 1-qator: portfel tuzilmasi ═══ */}
                <BigCard title="Qiymat bo'yicha ulush, mln $" style={cardStyle(demo)}>
                    <BigDonutBody
                        parts={P.map((p, i) => ({ label: labels[i], value: v.n(p.totalCostMlnUsd) ?? 0, color: colors[i] }))}
                        center={f1(v.totalCost)} centerSub="mln $" formatValue={f1}
                    />
                </BigCard>

                <BigCard title="Bajarilish, %" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => (v.n(p.progressShare) === null ? null : sharePct(p.progressShare!))), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: { ...bigScales({ horizontal: true }), x: { ...bigScales({ horizontal: true }).x, max: 100 } } } as any}
                            plugins={[hBarLabel((x) => `${f1(x)}%`)]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Umumiy qiymat va oʻzlashtirilgan, mln $" style={{ gridColumn: 'span 2', ...cardStyle(demo) }}>
                    <BigChartBox>
                        <Bar data={{
                            labels,
                            datasets: [
                                { label: 'Umumiy qiymati', data: P.map((p) => v.n(p.totalCostMlnUsd)), backgroundColor: GC.accent3, borderRadius: 4, barPercentage: 0.8 },
                                { label: 'Oʻzlashtirilgan', data: P.map((p) => v.n(p.disbursedMlnUsd)), backgroundColor: GC.green, borderRadius: 4, barPercentage: 0.8 },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any}
                            plugins={[bigBarLabel(1)]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="MINE / METALL / MARKET" style={cardStyle(demo)}>
                    <BigDonutBody
                        parts={groupParts(v.byType, (k) => TYPE_META[k]?.color ?? GC.slate, (k) => TYPE_META[k]?.label ?? k)}
                        center={String(P.length)} centerSub="loyiha" formatValue={(x) => `${x} ta`}
                    />
                </BigCard>

                <BigCard title="Loyiha holati" style={cardStyle(demo)}>
                    <BigDonutBody
                        parts={groupParts(v.byState, (_k, i) => [GC.green, GC.accent1, GC.amber, GC.violet, GC.slate][i % 5])}
                        center={String(P.length)} centerSub="loyiha" formatValue={(x) => `${x} ta`}
                    />
                </BigCard>

                {/* ═══ 2-qator: samaradorlik (TIA) ═══ */}
                <BigCard title="IRR, %" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => (v.n(p.irrShare) === null ? null : sharePct(p.irrShare!))), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, decimals: 0 }) } as any}
                            plugins={[hBarLabel((x) => `${f1(x)}%`, P.map((p) => p.irrText))]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="NPV, mln $" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => v.n(p.npvMlnUsd)), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                            plugins={[hBarLabel(f1, P.map((p) => p.npvText))]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Qoplash muddati, yil" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => v.n(p.paybackYears)), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                            plugins={[hBarLabel((x) => `${f1(x)} yil`, P.map((p) => p.paybackText))]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Qiymat va yillik ishlab chiqarish, mln $" style={{ gridColumn: 'span 2', ...cardStyle(demo) }}>
                    <BigChartBox>
                        <Bar data={{
                            labels,
                            datasets: [
                                { label: 'Umumiy qiymati', data: P.map((p) => v.n(p.totalCostMlnUsd)), backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.8 },
                                { label: 'Yillik ishlab chiqarish', data: P.map((p) => v.n(p.annualOutputMlnUsd)), backgroundColor: GC.amber, borderRadius: 4, barPercentage: 0.8 },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="TIA koʻrsatkichlari holati" style={cardStyle(demo)}>
                    {/* Son — yashil, «TIA da aniqlanadi» kabi matn — sariq, ma'lumot yo'q — kulrang. */}
                    <ProjectList>
                        {(p) => {
                            const irr = numOrText(p.irrShare, p.irrText, (x) => `IRR ${f1(sharePct(x))}%`);
                            const payback = numOrText(p.paybackYears, p.paybackText, (x) => `${f1(x)} yil`);
                            return (<>
                                <Tag text={irr.kind === 'num' ? irr.value : irr.kind === 'text' ? 'IRR: TIA' : "IRR: yo'q"} color={kindColor(irr.kind)} />
                                <Tag text={payback.kind === 'num' ? payback.value : payback.kind === 'text' ? 'Qoplash: TIA' : "Qoplash: yo'q"} color={kindColor(payback.kind)} />
                            </>);
                        }}
                    </ProjectList>
                </BigCard>

                {/* ═══ 3-qator: jadval, resurslar, hududlar ═══ */}
                <BigCard title="Amalga oshirish muddati, oy" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => v.n(p.durationMonths)), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                            plugins={[hBarLabel((x) => `${fmtGrouped(x, 0)} oy`)]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Ish oʻrinlari" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => v.n(p.jobs)), colors)}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any}
                            plugins={[hBarLabel((x) => fmtGrouped(x, 0))]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Muhimlik darajasi (1–10)" style={cardStyle(demo)}>
                    <BigChartBox>
                        <Bar data={valueBar(P.map((p) => v.n(p.priority)), P.map((p) => ((v.n(p.priority) ?? 0) >= 10 ? GC.red : (v.n(p.priority) ?? 0) >= 9 ? GC.amber : GC.accent1)))}
                            options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: { ...bigScales({ horizontal: true }), x: { ...bigScales({ horizontal: true }).x, max: 10 } } } as any}
                            plugins={[hBarLabel((x) => fmtGrouped(x, 0))]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Hududlar boʻyicha" style={cardStyle(demo)}>
                    <BigDonutBody
                        parts={groupParts(v.byRegion, (_k, i) => [GC.accent1, GC.amber, GC.violet, GC.green, GC.cyan][i % 5])}
                        center={String(v.byRegion.length)} centerSub="viloyat" formatValue={(x) => `${x} ta`}
                    />
                </BigCard>

                <BigCard title="Moliyalashtirish manbalari" style={cardStyle(demo)}>
                    {/* Manba erkin matn — ulush ma'lum emas, shuning uchun nechta
                        loyihada tilga olingani ko'rsatiladi. */}
                    <BigDonutBody
                        parts={v.fundingMentions.map(([k, c], i) => ({ label: k, value: c, color: [GC.accent1, GC.green, GC.amber, GC.violet, GC.cyan, GC.slate][i % 6] }))}
                        center={String(v.fundingMentions.length)} centerSub="manba" formatValue={(x) => `${x} loyiha`}
                    />
                </BigCard>

                <BigCard title="Hujjatlar holati (TIA / loyiha-smeta)" style={cardStyle(demo)}>
                    <ProjectList>
                        {(p) => (<>
                            <Tag text={p.fsState ?? '—'} color={/tasdiq|ishlab chiqilgan/i.test(p.fsState ?? '') ? GC.green : GC.amber} />
                            <Tag text={p.docState ?? '—'} color={/ijobiy|ishlab chiqilgan/i.test(p.docState ?? '') && !/chiqilmagan/i.test(p.docState ?? '') ? GC.green : /chiqilmagan/i.test(p.docState ?? '') ? GC.red : GC.amber} />
                        </>)}
                    </ProjectList>
                </BigCard>

                {/* ═══ 4-qator: natura, xatarlar, choraklar (demo), AI ═══ */}
                <BigCard title="Choraklar boʻyicha reja va fakt, mln $" style={card}>
                    <BigChartBox>
                        <Bar data={{
                            labels: ['1-chorak', '2-chorak', '3-chorak', '4-chorak'],
                            datasets: [
                                { label: 'Reja', data: q.quartersPlan, backgroundColor: GC.slate, borderRadius: 4, barPercentage: 0.75 },
                                { label: 'Fakt', data: q.quartersActual, backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.75 },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Oʻzlashtirishning toʻplanishi, mln $" style={card}>
                    <BigChartBox>
                        <Line data={{
                            labels: ['1-chorak', '2-chorak', '3-chorak', '4-chorak'],
                            datasets: [
                                { label: 'Reja (jami)', data: q.quartersPlan.reduce<number[]>((a, x, i) => [...a, (a[i - 1] ?? 0) + x], []), borderColor: GC.slate, backgroundColor: alpha(GC.slate, 0.15), borderWidth: 2, tension: 0.35, pointRadius: 3, fill: false },
                                { label: 'Fakt (jami)', data: q.quartersActual.reduce<number[]>((a, x, i) => [...a, (a[i - 1] ?? 0) + x], []), borderColor: GC.accent1, backgroundColor: alpha(GC.accent1, 0.22), borderWidth: 2, tension: 0.35, pointRadius: 3, fill: true },
                            ],
                        }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Yillik ishlab chiqarish (natura)" style={cardStyle(demo)}>
                    {/* Aralash o'lchov (tonna / dona) — hujjat bo'yicha YIG'ILMAYDI,
                        faqat har bir loyiha o'z qatorida. */}
                    <ProjectList>
                        {(p) => {
                            const o = numOrText(p.annualOutputQty, p.annualOutputQtyText, (x) => `${fmtGrouped(x, 0)} t`);
                            return <Tag text={o.value} color={kindColor(o.kind)} />;
                        }}
                    </ProjectList>
                </BigCard>

                <BigCard title="Loyiha turi" style={cardStyle(demo)}>
                    <BigDonutBody
                        parts={groupParts(v.byKind, (_k, i) => [GC.accent1, GC.green, GC.amber, GC.violet][i % 4])}
                        center={String(P.length)} centerSub="loyiha" formatValue={(x) => `${x} ta`}
                    />
                </BigCard>

                <BigCard title="Asosiy xatarlar" style={cardStyle(demo)}>
                    <ProjectList>
                        {(p) => {
                            const none = !p.risks || /mavjud emas/i.test(p.risks);
                            return <Tag text={p.risks ?? "Ko'rsatilmagan"} color={none ? GC.green : GC.amber} />;
                        }}
                    </ProjectList>
                </BigCard>

                <BigCard title="Sun'iy intellekt prognozlari" style={card}>
                    <BigForecastList items={AI_FORECASTS} />
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default Investing;
