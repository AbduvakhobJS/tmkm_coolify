import React, { useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { C, fmt, chartBase, noLegend } from './dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, axisLarge, legendLarge, bigBarLabel,
    bigCenterText, bigDonutBoxStyle, BigLabelRow, BigLabelStack, bigHeaderTitle, bigHeaderPill,
} from './dashboardUILarge';
import { useProductionDashboard } from '../hooks/production';
import type { DashboardData, DashboardMetal } from '../services/production';
import { GC, ACCENT_SERIES } from '../theme/palette';
import {useNavigate} from "react-router-dom";

/** "Batafsil" bosilganda ochiladigan iframe sahifasi (`/main/iframe/:key`)
 *  yuqori navbaridagi bandlar. `path` — `/main/iframe`ga qo'shiladigan
 *  segment (masalan "/prod" → to'liq manzil `/main/iframe/prod`). */
export type IframeNavItem = { label: string; path: string };

export const IFRAME_NAV_ITEMS: IframeNavItem[] = [
    { label: "Ishlab chiqarish", path: "/prod" },
    { label: "Sotish va qoldiqlar", path: "/sgp" },
    { label: "Elektr energiya", path: "/energy" },
    { label: "Quyosh stansiyalar", path: "/solar" },
    { label: "Vodorod", path: "/h2" },
    { label: "Sisterna va yuklar", path: "/cist" },
    { label: "Ogarok", path: "/ogarok" },
    { label: "Ingichka", path: "/ing" },
    { label: "Geologiya", path: "/geology" },
    { label: "Moliyaviy ko'rsatkichlar", path: "/fin" },
];

/* ══════════════════════════════════════════════════════════════════════════
   TEXNOLOGIK METALLAR ISHLAB CHIQARISH

   Butun ekran BITTA endpointdan quriladi:
     GET /production-report/dashboard
   (hujjat: METAL_PRODUCTION_DASHBOARD_API.md, 5-bo'lim — qaysi element qaysi
   maydondan quriladi).

   Namunaviy (mock) ma'lumot YO'Q. Faqat API bergan real qiymatlar chiziladi;
   ma'lumot kelmagan blok esa BO'SH kartochka bo'lib qoladi — soxta raqam ham,
   xato matni ham ko'rsatilmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

type ViewMetal = {
    /** Ekranda ko'rsatiladigan nom. */
    name: string;
    color: string;
    value: number;
    pct: number;
    delta: number | null;
    dyn: number[] | null;
};

/* ── Metall belgisi → to'liq nom (backend faqat belgi qaytaradi) ── */
const NAMES: Record<string, string> = {
    Mo: 'Molibden', W: 'Volfram', Re: 'Reniy', Co: 'Kobalt', Fe: 'Temir',
    Ti: 'Titan', Cu: 'Mis', Bi: 'Vismut', Pb: "Qo'rg'oshin", Zn: 'Rux', Ag: 'Kumush',
    Other: 'Boshqalar',
};

/**
 * `material: null` — metall biriktirilmagan guruh. Hujjatning 4-bo'limi:
 * backend bu guruhga NOM BERMAYDI, ko'rsatiladigan matnni frontend tanlaydi.
 */
const UNKNOWN_LABEL = 'Aniqlanmagan';

/* Barcha metallar bitta ko'k oiladan — "asosan ko'kka urg'u" (situatsion
   markaz standarti). Qoldiq/aniqlanmagan toifalar neytral (slate) rangda. */
const COLORS: Record<string, string> = {
    Mo: GC.accent1, W: GC.accent2, Re: GC.accent3, Co: GC.accent4, Fe: GC.accent5,
    Ti: GC.accent3, Cu: GC.accent4, Bi: GC.accent2, Zn: GC.accent3, Ag: GC.accent4,
    Pb: GC.slate, Other: GC.slate,
};
const NEUTRAL = GC.slate;

/* ── Qiymat tekshiruvchilari — API har qanday sonni `null` qaytarishi mumkin ── */
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
        name: key ? (NAMES[key] ?? key) : UNKNOWN_LABEL,
        /* Nomi ma'lum bo'lmagan metallar donutda ajralib tursin uchun ko'k
           oilaning ottenkalari navbatma-navbat beriladi. */
        color: key ? (COLORS[key] ?? ACCENT_SERIES[i % ACCENT_SERIES.length]) : NEUTRAL,
        value: num(m.value) ?? 0,
        pct: num(m.pct) ?? 0,
        delta: num(m.delta),
        dyn: numList(m.dyn),
    };
};

/** API javobidan ekran modeli. Ma'lumot yo'q bo'lsa — bo'sh massiv/`null`. */
function buildView(data?: DashboardData) {
    const months = data?.months?.map((m) => m?.label).filter((l): l is string => !!l) ?? [];

    const metals: ViewMetal[] = (Array.isArray(data?.metals) ? data!.metals! : [])
        .filter((m) => num(m?.value) !== null)
        .map(mapMetal);

    /* `total` — hujjat bo'yicha tayyor keladi; bermasa metallar yig'indisi. */
    const total = num(data?.total) ?? metals.reduce((s, m) => s + m.value, 0);

    /* `pct` odatda tayyor keladi (donut uchun); bo'lmasa hisoblanadi. */
    if (total > 0) {
        for (const m of metals) if (!m.pct) m.pct = +((m.value / total) * 100).toFixed(1);
    }

    /* Zavodlar gorizontal ustunda butun davr jami (`plants[].value`) bo'yicha
       ko'rsatiladi — hujjatning 5-bo'limi shuni belgilaydi. `value` bo'lmasa
       oylik massivdan yig'iladi. */
    const plants = (Array.isArray(data?.plants) ? data!.plants! : [])
        .map((p) => {
            const monthly = numList(p?.monthly);
            const value = num(p?.value) ?? (monthly ? monthly.reduce((s, x) => s + x, 0) : null);
            return { name: p?.name || UNKNOWN_LABEL, value: value ?? 0 };
        })
        .filter((p) => p.value > 0);

    return {
        months,
        unit: data?.unit ?? 'тн',
        metals,
        total,
        totalDelta: num(data?.totalDelta),
        totalPercent: num(data?.totalPercent),
        unknownShare: num(data?.unknownShare),
        /* Chiziqli grafik — kamida bitta metalda oylik massiv bo'lishi kerak. */
        dynMetals: months.length > 0 ? metals.filter((m) => m.dyn) : [],
        plants,
        monthly: numList(data?.monthly),
        avgDaily: numList(data?.avgDaily),
    };
}

/* ── Sana oralig'i ── */
const isoDay = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtDots = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
};

/**
 * Ma'lumot bo'lmaganda kartochka BO'SH qoladi — soxta raqam ham, xato matni
 * ham chiqmaydi. Bu blok faqat kartochka balandligini saqlab turadi, shunda
 * setka "sakramaydi".
 */
const EmptyBody: React.FC = () => <div style={{ flex: 1, minHeight: 0 }} />;

type Props = {
    /** `YYYY-MM-DD`. Berilmasa — joriy yil boshidan bugungacha. */
    from?: string;
    to?: string;
    /** Bitta zavod bo'yicha filtr. Berilmasa — barcha zavodlar. */
    plant?: string;
};

const DashHeader: React.FC<{ title: string; subtitle: string; dateRange: string; link: string }> = ({ title, link }) => {
    const navigate = useNavigate();
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 'clamp(5px, 1.4cqmin, 12px)', alignItems: 'flex-start',
           flexShrink: 0, flexWrap: 'wrap', gap: 'clamp(4px, 1cqmin, 8px)',
        }}>
            <div style={{ minWidth: 0 }}>
                <div style={bigHeaderTitle}>{title}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.1cqmin, 8px)', flexShrink: 0 }}>
                <div style={{ ...bigHeaderPill, display: 'flex', gap: 6, cursor: 'pointer' }} onClick={() => navigate(link)}>
                    Batafsil
                </div>
            </div>
        </div>
    );
};


const MetalsDashboardMain: React.FC<Props> = ({ from, to, plant }) => {

    /* Standart oraliq — YIL BOSHIDAN emas, so'nggi 7 OY (joriy oy + oldingi 6
       oy). Yil boshidan (1-yanvar) olinsa, yil oxiriga borgan sari oylar soni
       o'sib boradi va column chartlardagi qiymat labellari (bigBarLabel)
       torayib bir-birining ustiga chiqib ketardi — aylanma 7 oylik oyna bu
       muammoni doimiy hal qiladi, faqat "hozir shunday" emas. */
    const range = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return { from: from ?? isoDay(start), to: to ?? isoDay(now) };
    }, [from, to]);

    /* `unit`/`excludeDobycha` standart qiymatlarida qoldiriladi (hujjat, 2.1):
       dashboard tonna uchun mo'ljallangan va xomashyo qazish hajmi grafikni
       buzmasligi kerak. */
    const { data } = useProductionDashboard({
        from: range.from,
        to: range.to,
        plant,
    });

    const v = useMemo(() => buildView(data), [data]);

    const hasMetals = v.metals.length > 0;
    const hasMonths = v.months.length > 0;

    /* KPI qatorida doim 5 ta plitka turadi (jami + 4 metall). Metall
       ma'lumoti kelmasa o'rni bo'sh qoladi — qator qisqarib ketmasin. */
    const metalSlots: (ViewMetal | null)[] = [0, 1, 2, 3].map((i) => v.metals[i] ?? null);
    const donutData = {
        labels: v.metals.map((m) => m.name),
        datasets: [{
            data: v.metals.map((m) => m.value),
            backgroundColor: v.metals.map((m) => m.color),
            borderColor: C.cardAlt, borderWidth: 2,
        }],
    };
    const lineData = {
        labels: v.months,
        datasets: v.dynMetals.map((m) => ({
            label: m.name, data: m.dyn as number[],
            borderColor: m.color, backgroundColor: m.color,
            borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: m.color,
        })),
    };
    /* Zavodlar — bitta seriya, butun davr jami (hujjat, 5-bo'lim). */
    const factoryData = {
        labels: v.plants.map((p) => p.name),
        datasets: [{
            data: v.plants.map((p) => p.value),
            backgroundColor: v.plants.map((_, i) => ACCENT_SERIES[i % ACCENT_SERIES.length]),
            borderRadius: 4, borderWidth: 0, barPercentage: 0.7,
        }],
    };
    const monthlyBar = {
        labels: v.months,
        datasets: [{ data: v.monthly ?? [], backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.6 }],
    };
    const avgBar = {
        labels: v.months,
        datasets: [{ data: v.avgDaily ?? [], backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.6 }],
    };

    return (
        <BigDashRoot>
            <DashHeader
                title="Texnologik metallar ishlab chiqarish"
                subtitle="Ko'rsatkichlar dashboardi"
                dateRange={`${fmtDots(range.from)} - ${fmtDots(range.to)}`}
                link="/main/iframe/prod"
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard
                    title="Umumiy hajmi"
                    value={hasMetals ? `${fmt(v.total)} t` : ''}
                    /* `totalDelta` — oldingi davrga nisbatan o'zgarish. Hujjatda
                       aytilganidek, strelka ishoradan hosil qilinadi (Delta). */
                    delta={v.totalDelta}
                    iconColor={GC.accent1}
                />
                {metalSlots.map((m, i) => (
                    <BigKpiCard
                        key={m?.name ?? `bo'sh-${i}`}
                        title={m?.name ?? ''}
                        value={m ? `${fmt(m.value)} t` : ''}
                        delta={m?.delta ?? null}
                        iconColor={m?.color ?? GC.accent1}
                    />
                ))}
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 10,
            }}>
                <BigCard title="Metallar bo'yicha ishlab chiqarish, tonna">
                    {!hasMetals ? <EmptyBody /> : (
                        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
                            {/* `alignItems` ataylab qo'yilmagan (stretch — standart): "center"
                                bo'lganda bu ro'yxat qatorning haqiqiy balandligiga cheklanmay,
                                o'z tarkibiga qarab cho'zilib ketardi va `overflowY:'auto'`
                                hech qachon ishga tushmasdi — sig'maganida scroll bo'lmasdi. */}
                            <div style={{ flex: '0 0 36%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                                {v.metals.map((m) => (
                                    <BigLabelStack key={m.name} label={m.name} color={m.color} value={`${fmt(m.value)} т`} sub={`${fmt(m.pct)}%`} />
                                ))}
                            </div>
                            <div style={bigDonutBoxStyle}>
                                <Doughnut
                                    data={donutData}
                                    options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                    plugins={[bigCenterText(`${fmt(v.total)}`, 'Jami, t')]}
                                />
                            </div>
                        </div>
                    )}
                </BigCard>

                <BigCard title="Ishlab chiqarish dinamikasi, tonna">
                    {v.dynMetals.length === 0 ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line
                                data={lineData}
                                options={{
                                    ...chartBase,
                                    plugins: legendLarge('top'),
                                    scales: axisLarge({ y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Zavodlar bo'yicha ishlab chiqarish, tonna">
                    {v.plants.length === 0 ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={factoryData}
                                options={{
                                    ...chartBase, indexAxis: 'y', ...noLegend,
                                    scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false } } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Oylar bo'yicha ishlab chiqarish, tonna">
                    {!v.monthly || !hasMonths ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={monthlyBar}
                                /* Bu karta juda past (3x2 setkaning bir katagi) — tick
                                   shrifti shared `axisLarge`dan kichikroq qilib
                                   qo'yiladi, aks holda oy nomlari ustun/qiymat
                                   yorlig'i bilan qoplanib ketardi. */
                                options={{ ...chartBase, ...noLegend, scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }) } as any}
                                plugins={[bigBarLabel(1)]}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Ishlab chiqarish tuzilmasi, %">
                    {!hasMetals ? <EmptyBody /> : (
                        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 12 }}>
                            <div style={{ flex: '0 0 40%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto' }}>
                                {v.metals.map((m) => (
                                    <BigLabelRow key={m.name} label={m.name} color={m.color} value={`${fmt(m.pct)}%`} />
                                ))}
                            </div>
                            <div style={bigDonutBoxStyle}>
                                <Doughnut
                                    data={donutData}
                                    options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                    plugins={[bigCenterText(`${fmt(v.total)}`, 'Jami, t')]}
                                />
                            </div>
                            
                        </div>
                    )}
                </BigCard>

                <BigCard title="O'rtacha kunlik ishlab chiqarish, tonna">
                    {!v.avgDaily || !hasMonths ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={avgBar}
                                options={{ ...chartBase, ...noLegend, scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }) } as any}
                                plugins={[bigBarLabel(1)]}
                            />
                        </div>
                    )}
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default MetalsDashboardMain;
