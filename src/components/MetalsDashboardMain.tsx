import React, { useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    C, fmt, chartBase, noLegend, axis,
    barLabel, centerText,
    Card, KpiCard, DashHeader, DashRoot,
} from './dashboardUI';
import { useProductionDashboard } from '../hooks/production';
import type { DashboardData, DashboardMetal } from '../services/production';
import { GC, ACCENT_SERIES } from '../theme/palette';

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

const MetalsDashboardMain: React.FC<Props> = ({ from, to, plant }) => {
    const range = useMemo(() => {
        const now = new Date();
        return { from: from ?? `${now.getFullYear()}-01-01`, to: to ?? isoDay(now) };
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
        <DashRoot>
            <DashHeader
                title="Texnologik metallar ishlab chiqarish"
                subtitle="Ko'rsatkichlar dashboardi"
                dateRange={`${fmtDots(range.from)} - ${fmtDots(range.to)}`}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexShrink: 0 }}>
                <KpiCard
                    title="Umumiy hajmi"
                    value={hasMetals ? `${fmt(v.total)} t` : ''}
                    /* `totalDelta` — oldingi davrga nisbatan o'zgarish. Hujjatda
                       aytilganidek, strelka ishoradan hosil qilinadi (Delta). */
                    delta={v.totalDelta}
                    compare="Avvalgi davr bilan solishtirganda"
                    icon={''} iconColor={GC.accent1} badge={''}
                />
                {metalSlots.map((m, i) => (
                    <KpiCard
                        key={m?.name ?? `bo'sh-${i}`}
                        title={m?.name ?? ''}
                        value={m ? `${fmt(m.value)} t` : ''}
                        delta={m?.delta ?? null}
                        compare="Avvalgi davr bilan solishtirganda"
                        icon={''} iconColor={m?.color ?? GC.accent1} badge={''}
                    />
                ))}
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 8,
            }}>
                <Card title="Metallar bo'yicha ishlab chiqarish, tonna">
                    {!hasMetals ? <EmptyBody /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                            <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                                <Doughnut
                                    data={donutData}
                                    options={{ ...chartBase, cutout: '65%', ...noLegend } as any}
                                    plugins={[centerText(`${fmt(v.total)}`, 'Jami, t')]}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, overflowY: 'auto' }}>
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
                    )}
                </Card>

                <Card title="Ishlab chiqarish dinamikasi, tonna">
                    {v.dynMetals.length === 0 ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line
                                data={lineData}
                                options={{
                                    ...chartBase,
                                    plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } } },
                                    scales: axis({ y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </Card>

                <Card title="Zavodlar bo'yicha ishlab chiqarish, tonna">
                    {v.plants.length === 0 ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={factoryData}
                                options={{
                                    ...chartBase, indexAxis: 'y',
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { beginAtZero: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 10 } } },
                                        y: { grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } },
                                    },
                                } as any}
                            />
                        </div>
                    )}
                </Card>

                <Card title="Oylar bo'yicha ishlab chiqarish, tonna">
                    {!v.monthly || !hasMonths ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={monthlyBar}
                                options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any}
                                plugins={[barLabel(1)]}
                            />
                        </div>
                    )}
                </Card>

                <Card title="Ishlab chiqarish tuzilmasi, %">
                    {!hasMetals ? <EmptyBody /> : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minHeight: 0 }}>
                            <div style={{ width: 138, height: 138, flexShrink: 0 }}>
                                <Doughnut
                                    data={donutData}
                                    options={{ ...chartBase, cutout: '65%', ...noLegend } as any}
                                    plugins={[centerText(`${fmt(v.total)}`, 'Jami, t')]}
                                />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0, overflowY: 'auto' }}>
                                {v.metals.map((m) => (
                                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, marginRight: 6, flexShrink: 0 }} />
                                        <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                                        <span style={{ color: C.text, fontWeight: 600 }}>{fmt(m.pct)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="O'rtacha kunlik ishlab chiqarish, tonna">
                    {!v.avgDaily || !hasMonths ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={avgBar}
                                options={{ ...chartBase, ...noLegend, scales: axis({ y: { beginAtZero: true } }) } as any}
                                plugins={[barLabel(1)]}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </DashRoot>
    );
};

export default MetalsDashboardMain;
