import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GC } from '../../theme/palette';
import {
    getChain, getKpi, getMobplan, getSalesMonthly, getElectricity, getDashboard,
    ChainStep, KpiItem, MonthValue, SalesRow, ElectricityRow,
} from '../../services/production';
import { getFinanceDashboard } from '../../services/finance';
import { getInvestProjectsList } from '../../services/map';
import { ActiveUnit, Segment, TopKpi } from './data';

/* ══════════════════════════════════════════════════════════════════════════
   "Korxona" dashboardining barcha ma'lumoti — COMPANY_DASHBOARD_API.md
   bo'yicha 6 ta endpointdan yig'iladi:

     /production-report/dashboard?plant=Чирчик завод  — tayyor mahsulot
     /production-report/chain                          — obyektlar, sexlar
     /production-report/kpi                            — 1 цех xodimlari
     /production-report/sales/monthly                  — realizatsiya, qoldiq
     /production-report/electricity                    — elektr energiya
     /finance-report/dashboard                         — tushum

   Hujjatning 9-bo'limi bo'yicha backendda YO'Q ma'lumotlar (butun korxona
   xodimlari, suv, CO₂, qurilayotgan loyihalar reestri) taxmin qilinmaydi —
   xodimlar 0 bo'lib turadi, qolganlari bo'sh.
   ══════════════════════════════════════════════════════════════════════════ */

/** Zavod filtri — hujjatning 3-bo'limi: usiz `total` ga Ингичка rudasi qo'shilib ketadi. */
const PLANT = 'Чирчик завод';

/* ── Oy kalitlari bilan ishlash ── */
const pad2 = (n: number) => String(n).padStart(2, '0');
const monthKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
const isoDay = (d: Date) => `${monthKey(d)}-${pad2(d.getDate())}`;

/** `"2026-08"` → `"2026-07"`. */
const prevMonthKey = (key: string): string => {
    const [y, m] = key.split('-').map(Number);
    return m === 1 ? `${y - 1}-12` : `${y}-${pad2(m - 1)}`;
};

const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

/**
 * O'zgarish, %. Oldingi qiymat musbat bo'lmasa `null` — nol yoki manfiy
 * bazadan hisoblangan foiz ma'nosiz bo'lardi.
 */
const pctDelta = (cur: number | null, prev: number | null): number | null =>
    cur === null || prev === null || prev <= 0 ? null : ((cur - prev) / prev) * 100;

/** Bosqich/ko'rsatkichdagi ma'lum bir oyning fakt qiymati. */
const factAt = (values: Record<string, MonthValue> | null | undefined, month: string): number | null =>
    num(values?.[month]?.fakt);

/**
 * Ma'lumot bor bo'lgan ENG SO'NGGI oyni topadi va o'sha oy bilan undan
 * AYNAN bir oy oldingisini qaytaradi (hujjat, 2-bo'lim: oylar orasida uzilish
 * bo'lsa taqqoslash ko'rsatilmaydi).
 */
const latestPair = (values: Record<string, MonthValue> | null | undefined) => {
    const months = Object.keys(values ?? {}).filter((m) => factAt(values, m) !== null).sort();
    const last = months[months.length - 1];
    if (!last) return { month: null, cur: null, prev: null };
    return { month: last, cur: factAt(values, last), prev: factAt(values, prevMonthKey(last)) };
};

/** Birlik matnidan qavsdagi texnik izohni olib tashlaydi (hujjat, 4-bo'lim). */
const cleanUnit = (u?: string): string => (u ?? '').split('(')[0].trim();

const fmt = (n: number, d = 1): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${n < 0 ? '-' : ''}${grouped}${dec && +dec ? ',' + dec : ''}`;
};

/* ── Ma'lumot yo'qligini bildiradigan qiymat ── */
const NO_DATA = "ma'lumot yo'q";

/* ══════════════ So'rovlar ══════════════ */

/** So'nggi 4 oy — joriy oy to'liq bo'lmasligi mumkin, shuning uchun zaxira bilan. */
const range = () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    return { fromDay: isoDay(from), toDay: isoDay(now), fromMonth: monthKey(from), toMonth: monthKey(now) };
};

export const useCompanyData = () => {
    const r = useMemo(range, []);
    const opts = { staleTime: 5 * 60_000, refetchInterval: 5 * 60_000 } as const;

    const chain = useQuery({ queryKey: ['company-chain', r.fromMonth, r.toMonth], queryFn: () => getChain(r.fromMonth, r.toMonth), ...opts });
    const kpi = useQuery({ queryKey: ['company-kpi', r.fromMonth, r.toMonth], queryFn: () => getKpi(r.fromMonth, r.toMonth), ...opts });
    const mobplan = useQuery({ queryKey: ['company-mobplan'], queryFn: getMobplan, ...opts });
    const sales = useQuery({ queryKey: ['company-sales', r.fromDay, r.toDay], queryFn: () => getSalesMonthly(r.fromDay, r.toDay), ...opts });
    const power = useQuery({ queryKey: ['company-power', r.fromDay, r.toDay], queryFn: () => getElectricity(r.fromDay, r.toDay), ...opts });
    const prod = useQuery({
        queryKey: ['company-prod', r.fromDay, r.toDay],
        queryFn: () => getDashboard({ from: r.fromDay, to: r.toDay, plant: PLANT }),
        ...opts,
    });
    const finance = useQuery({ queryKey: ['finance-dashboard'], queryFn: getFinanceDashboard, ...opts });

    /* Investitsiya loyihalari — MINE/METALL/MARKET bo'yicha alohida ro'yxat
       (GET /invest-projects?type=). API'ning o'z nomlashi bo'yicha "metall". */
    const investMine = useQuery({ queryKey: ['invest-projects', 'mine'], queryFn: () => getInvestProjectsList('mine'), ...opts });
    const investMetall = useQuery({ queryKey: ['invest-projects', 'metall'], queryFn: () => getInvestProjectsList('metall'), ...opts });
    const investMarket = useQuery({ queryKey: ['invest-projects', 'market'], queryFn: () => getInvestProjectsList('market'), ...opts });

    return useMemo(() => {
        /* ── Yordamchilar ── */
        const steps = new Map<string, ChainStep>((chain.data?.steps ?? []).map((s) => [s.id, s]));
        const step = (id: string) => steps.get(id);

        const kpiByNo = new Map<number, KpiItem>((kpi.data?.kpis ?? []).map((k) => [k.no, k]));

        /** Bosqichdan `ActiveUnit` yasaydi. Ma'lumot bo'lmasa ham qator qoladi. */
        const unitFromStep = (id: string, name: string, label: string, staff = 0): ActiveUnit => {
            const s = step(id);
            const { cur, prev } = latestPair(s?.values);
            return {
                name,
                staff,
                output: cur === null ? NO_DATA : `${fmt(cur, 3)} ${cleanUnit(s?.unit)}`.trim(),
                outputLabel: label,
                delta: pctDelta(cur, prev),
            };
        };

        /* ══════════ MINE — xomashyo obyektlari (chain) ══════════ */
        const gravi = latestPair(step('ing-itogo-gravikoncentrat')?.values);

        const mineActive: ActiveUnit[] = [
            unitFromStep('ing-pererabotano-otvalov', 'Ingichka IOF', 'Otval qayta ishlash (oyiga)'),
            unitFromStep('ing-itogo-gravikoncentrat', 'Ingichka — gravikonsentrat', 'Gravikonsentrat (oyiga)'),
            unitFromStep('ing-postavka-iof', "Ingichka → 4 sex", 'W-konsentrat yetkazish (oyiga)'),
            unitFromStep('nav-isxodnyy-rastvor', 'GTS «Navoiy»', "Boshlang'ich eritma (oyiga)"),
            unitFromStep('nav-perrenat', 'GTS «Navoiy» — perrenat', 'Ammoniy perrenati (oyiga)'),
            unitFromStep('gtc1-chernyy-perrenat', 'GTS-1 «Zarafshon»', "Qora perrenat (to'xtagan)"),
        ];

        /* ══════════ METAL — zavod va sexlar ══════════ */
        const monthly = (prod.data?.monthly ?? []).map(num).filter((x): x is number => x !== null);
        const plantCur = monthly.length ? monthly[monthly.length - 1] : null;
        const plantPrev = monthly.length > 1 ? monthly[monthly.length - 2] : null;

        /* 1 цех xodimlari — hujjatda mavjud yagona xodimlar raqami (no: 13). */
        const shopStaff = latestPair(kpiByNo.get(13)?.values).cur ?? 0;

        const metalActive: ActiveUnit[] = [
            {
                name: 'Chirchiq zavodi',
                staff: 0,
                output: plantCur === null ? NO_DATA : `${fmt(plantCur, 1)} t`,
                outputLabel: 'Tayyor mahsulot (oyiga)',
                delta: pctDelta(plantCur, plantPrev),
            },
            unitFromStep('c4-vypusk-wo3', '4-sex — WO₃', 'Chiqarish (oyiga)'),
            unitFromStep('c5-vypusk-tma', '5-sex — TMA (MoO₃)', 'Chiqarish (oyiga)'),
            unitFromStep('c1-moo3-vnutrennee', '1-sex — MoO₃', 'Chiqarish (oyiga)', Math.round(shopStaff)),
            unitFromStep('c3-tverdosplavnye-izdeliya', '3-sex — qattiq qotishma', 'Chiqarish (oyiga)'),
            unitFromStep('c10-nozhi', '10-sex — pichoqlar', 'Chiqarish (oyiga)'),
            unitFromStep('c35-kirpichi', '35-sex — g‘isht', 'Chiqarish (oyiga)'),
        ];

        /* ══════════ MARKET — realizatsiya va qoldiqlar (sales) ══════════ */
        /** Kategoriya bo'yicha oy → tonnadagi qiymat. */
        const salesByCat = (category: string) => {
            const rows = (sales.data ?? []).filter((s: SalesRow) => s.category === category);
            const map: Record<string, MonthValue> = {};
            for (const row of rows) {
                /* Hujjat, 7-bo'lim: dashboard uchun `baseUnit: "т"` qatori olinadi. */
                const t = (row.byUnit ?? []).find((u) => u.baseUnit === 'т');
                const value = num(t?.value) ?? num(row.value_base);
                map[row.month] = { plan: null, fakt: value, pct: null };
            }
            return map;
        };

        const marketUnit = (category: string, name: string, label: string): ActiveUnit => {
            const { cur, prev } = latestPair(salesByCat(category));
            return {
                name, staff: 0,
                output: cur === null ? NO_DATA : `${fmt(cur, 1)} t`,
                outputLabel: label,
                delta: pctDelta(cur, prev),
            };
        };

        const marketActive: ActiveUnit[] = [
            marketUnit('Реализация готовой продукции', 'Tayyor mahsulot realizatsiyasi', 'Sotilgan (oyiga)'),
            marketUnit('Остатки готовой продукции', 'Tayyor mahsulot qoldig‘i', 'Oy oxiriga qoldiq'),
            marketUnit('Остатки основного сырья и материалов', 'Xomashyo va materiallar qoldig‘i', 'Oy oxiriga qoldiq'),
        ];

        /* ══════════ Yuqoridagi 6 ta KPI ══════════ */
        /* Elektr energiya — oy bo'yicha barcha turlar yig'indisi. */
        const powerByMonth: Record<string, MonthValue> = {};
        for (const row of (power.data ?? []) as ElectricityRow[]) {
            const v = num(row.kwh) ?? 0;
            const cur = powerByMonth[row.month]?.fakt ?? 0;
            powerByMonth[row.month] = { plan: null, fakt: cur + v, pct: null };
        }
        const powerPair = latestPair(powerByMonth);

        /* Tushum — alohida endpoint, oylarida yil yo'q (hujjat, 2-bo'lim). */
        const revenueRow = (finance.data?.rows ?? []).find((x) => x.key === 'revenue');
        const revVals = (revenueRow?.values ?? []).map(num).filter((x): x is number => x !== null);
        const revCur = revVals.length ? revVals[revVals.length - 1] : null;
        const revPrev = revVals.length > 1 ? revVals[revVals.length - 2] : null;

        const totals = mobplan.data?.sheetTotals ?? null;

        const topKpis: { left: TopKpi[]; right: TopKpi[] } = {
            left: [
                {
                    label: 'Jami xodimlar',
                    /* Hujjat, 9-bo'lim: butun korxona bo'yicha xodimlar soni
                       backendda YO'Q. Taxmin qilinmaydi — 0 bo'lib turadi. */
                    value: '0',
                    delta: 0,
                    note: totals ? `TMK Chemicals shtati: ${totals.shtat}` : `1-sex: ${Math.round(shopStaff)}`,
                    icon: 'z4.png',
                },
                {
                    label: 'Jami ishlab chiqarish',
                    value: plantCur === null ? NO_DATA : `${fmt(plantCur, 1)} t`,
                    delta: pctDelta(plantCur, plantPrev) ?? 0,
                    icon: 'z5.png',
                },
                {
                    label: 'Jami daromad',
                    value: revCur === null ? NO_DATA : `${fmt(revCur, 0)} ming so'm`,
                    delta: pctDelta(revCur, revPrev) ?? 0,
                    icon: 'z6.png',
                },
            ],
            right: [
                {
                    label: "Elektr energiya iste'moli",
                    value: powerPair.cur === null ? NO_DATA : `${fmt(powerPair.cur, 0)} kVt·soat`,
                    delta: pctDelta(powerPair.cur, powerPair.prev) ?? 0,
                    icon: 'z1.png',
                },
                /* Suv va CO₂ — hujjatning 9-bo'limi: backendda umuman yo'q. */
                { label: "Suv iste'moli", value: '0', delta: 0, note: NO_DATA, icon: 'z2.png' },
                { label: 'CO₂ chiqindilari', value: '0', delta: 0, note: NO_DATA, icon: 'z3.png' },
            ],
        };

        /* ══════════ Uch bosqich ══════════ */
        const segments: Segment[] = [
            {
                key: 'mine', code: 'MINE',
                title: 'MINE — Xomashyo bazasi',
                tagline: 'Tabiiy resurslar — barqaror kelajak sari',
                nodeCaption: 'Xomashyo bazasi',
                accent: GC.success,
                summary: [
                    /* Xodimlar obyekt kesimida backendda yo'q (9-bo'lim). */
                    { value: '0', label: 'Xodimlar' },
                    {
                        value: gravi.cur === null ? NO_DATA : `${fmt(gravi.cur, 3)} ${cleanUnit(step('ing-itogo-gravikoncentrat')?.unit)}`.trim(),
                        label: 'Gravikonsentrat (oyiga)',
                    },
                ],
                activeTitle: "FAOLIYATDA BO'LGAN OBYEKTLAR",
                active: mineActive,
                investTitle: "INVESTITSIYA LOYIHALARI",
                investProjects: investMine.data ?? [],
            },
            {
                key: 'metal', code: 'METAL',
                title: 'METAL — Qayta ishlash va ishlab chiqarish',
                tagline: 'Rudani qiymatga aylantiramiz',
                nodeCaption: 'Qayta ishlash va ishlab chiqarish',
                accent: '#E0912B',
                summary: [
                    { value: String(Math.round(shopStaff)), label: 'Xodimlar (1-sex)' },
                    {
                        value: plantCur === null ? NO_DATA : `${fmt(plantCur, 1)} t`,
                        label: 'Tayyor mahsulot (oyiga)',
                    },
                ],
                activeTitle: "FAOLIYATDA BO'LGAN ZAVOD VA SEXLAR",
                active: metalActive,
                investTitle: "INVESTITSIYA LOYIHALARI",
                investProjects: investMetall.data ?? [],
            },
            {
                key: 'market', code: 'MARKET',
                title: 'MARKET — Bozor va sotuv',
                tagline: 'Mahsulotlarimiz dunyo bozorida',
                nodeCaption: 'Bozor va sotuv',
                accent: GC.accent1,
                summary: [
                    { value: '0', label: 'Xodimlar' },
                    { value: marketActive[0]?.output ?? NO_DATA, label: 'Realizatsiya (oyiga)' },
                ],
                activeTitle: "SOTUV VA QOLDIQLAR",
                active: marketActive,
                investTitle: 'INVESTITSIYA LOYIHALARI',
                investProjects: investMarket.data ?? [],
            },
        ];

        return { topKpis, segments };
    }, [
        chain.data, kpi.data, mobplan.data, sales.data, power.data, prod.data, finance.data,
        investMine.data, investMetall.data, investMarket.data,
    ]);
};
