import { GC } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   MINE → METAL → MARKET — kombinatning to'liq ishlab chiqarish zanjiri.

   Rasmlar `public/imgs/mmm/` papkasidan olinadi. Fayl nomlari DISKDAGI bilan
   harfma-harf bir xil bo'lishi shart: Windows'da katta-kichik harf farqi
   sezilmaydi, lekin serverda (Linux/Coolify) `mine.png` ≠ `Mine.png` va rasm
   404 bo'lib qoladi.
     back.png    — umumiy fon (sanoat panoramasi, 1983×793)
     Mine.png    — yashil kartochka ramkasi
     Metal.png   — to'q sariq kartochka ramkasi
     Market.jpg  — ko'k kartochka ramkasi (JPG, PNG emas)
   ══════════════════════════════════════════════════════════════════════════ */

export const ASSETS = {
    background: '/imgs/mmm/back.png',
    /** Markazdagi aylana ichidagi logotip (kvadratga yaqin bo'lgani ma'qul). */
    logo: '/imgs/mmm/tmk-logo.png',
    /** `logo` topilmasa ishlatiladigan, loyihada mavjud logotip. */
    logoFallback: '/imgs/logow.png',
    frames: {
        mine: '/imgs/mmm/Mine.png',
        metal: '/imgs/mmm/Metal.png',
        market: '/imgs/mmm/Market.jpg',
    },
} as const;

export type SegmentKey = 'mine' | 'metal' | 'market';

/** Faoliyatda bo'lgan obyekt (kon / zavod / bo'lim). */
export type ActiveUnit = {
    name: string;
    /** Xodimlar soni. */
    staff: number;
    /** Asosiy ko'rsatkich qiymati, masalan "3.4 mln t". */
    output: string;
    /** Ko'rsatkich izohi, masalan "Qazib olish (oyiga)". */
    outputLabel: string;
    /** O'sish/pasayish foizi (`null` — ko'rsatilmaydi). */
    delta: number | null;
};

/** Qurilayotgan yoki loyiha bosqichidagi obyekt. */
export type PlannedUnit = {
    name: string;
    /** "Qurilish" yoki "Loyiha". */
    stage: 'Qurilish' | 'Loyiha';
    years: string;
    plannedStaff: number;
    /** Reja quvvati; `null` bo'lsa faqat izoh chiqadi. */
    capacity: string | null;
    capacityLabel: string;
};

export type Segment = {
    key: SegmentKey;
    /** Doiradagi qisqa nom — MINE / METAL / MARKET. */
    code: string;
    title: string;
    tagline: string;
    /** Doira ostidagi izoh. */
    nodeCaption: string;
    accent: string;
    /** Sarlavhadagi ikkita yig'ma ko'rsatkich. */
    summary: { value: string; label: string }[];
    activeTitle: string;
    active: ActiveUnit[];
    plannedTitle: string;
    planned: PlannedUnit[];
};

/* ── Yuqoridagi umumiy KPI qatori ── */
export type TopKpi = { label: string; value: string; delta: number; note?: string; icon: string };

export const TOP_KPIS: { left: TopKpi[]; right: TopKpi[] } = {
    left: [
        { label: 'Jami xodimlar', value: '26 840', delta: 2.3, note: "o'tgan oyga nisbatan", icon: 'z4.png' },
        { label: 'Jami ishlab chiqarish', value: '248.6 ming t', delta: 5.1, icon: 'z5.png' },
        { label: 'Jami daromad', value: '$ 428.7 mln', delta: 6.8, icon: 'z6.png' },
    ],
    right: [
        { label: "Elektr energiya iste'moli", value: '1 024 mln kVt·soat', delta: -2.4, icon: 'z1.png' },
        { label: "Suv iste'moli", value: '12.4 mln m³', delta: -3.1, icon: 'z2.png' },
        { label: 'CO₂ chiqindilari', value: '68%', delta: -4.5, icon: 'z3.png' },
    ],
};

/* ── Uch bosqich ── */
export const SEGMENTS: Segment[] = [
    {
        key: 'mine',
        code: 'MINE',
        title: 'MINE — Xomashyo bazasi',
        tagline: 'Tabiiy resurslar — barqaror kelajak sari',
        nodeCaption: 'Xomashyo bazasi',
        accent: GC.success,
        summary: [
            { value: '9 120', label: 'Xodimlar' },
            { value: '9.8 mln t', label: 'Xomashyo qazib olindi' },
        ],
        activeTitle: "FAOLIYATDA BO'LGAN OBYEKTLAR",
        active: [
            { name: 'Qalmoqqir koni', staff: 2850, output: '3.4 mln t', outputLabel: 'Qazib olish (oyiga)', delta: 6.1 },
            { name: 'Sariqchek koni', staff: 1920, output: '2.1 mln t', outputLabel: 'Qazib olish (oyiga)', delta: 4.3 },
            { name: 'Yoshlik I koni', staff: 1340, output: '1.6 mln t', outputLabel: 'Qazib olish (oyiga)', delta: 5.8 },
            { name: 'Yoshlik II koni', staff: 1010, output: '1.2 mln t', outputLabel: 'Qazib olish (oyiga)', delta: 3.9 },
            { name: 'Inglizkon kareri', staff: 980, output: '0.9 mln t', outputLabel: 'Qazib olish (oyiga)', delta: -1.2 },
        ],
        plannedTitle: "QURILAYOTGAN / LOYIHA BOSQICHIDAGI OBYEKTLAR",
        planned: [
            { name: 'Tebinbuloq koni', stage: 'Qurilish', years: '2026–2028', plannedStaff: 2400, capacity: '4.0 mln t', capacityLabel: 'Reja quvvati (oyiga)' },
            { name: 'Janubiy kon', stage: 'Loyiha', years: '2026–2027', plannedStaff: 1800, capacity: '3.0 mln t', capacityLabel: 'Reja quvvati (oyiga)' },
            { name: 'Zarafshon kengaytma', stage: 'Loyiha', years: '2026–2028', plannedStaff: 1200, capacity: '2.5 mln t', capacityLabel: 'Reja quvvati (oyiga)' },
        ],
    },
    {
        key: 'metal',
        code: 'METAL',
        title: 'METAL — Qayta ishlash va ishlab chiqarish',
        tagline: 'Rudani qiymatga aylantiramiz',
        nodeCaption: 'Qayta ishlash va ishlab chiqarish',
        accent: '#E0912B',
        summary: [
            { value: '14 520', label: 'Xodimlar' },
            { value: '2.6 mln t', label: 'Tayyor mahsulot' },
        ],
        activeTitle: "FAOLIYATDA BO'LGAN ZAVODLAR",
        active: [
            { name: 'Mis boyitish fabrikasi', staff: 3850, output: '610 ming t', outputLabel: 'Konsentrat (oyiga)', delta: 6.2 },
            { name: 'Mis eritish zavodi', staff: 4120, output: '610 ming t', outputLabel: 'Katod mis (oyiga)', delta: 5.1 },
            { name: 'Precious Metals zavodi', staff: 2480, output: '210 ming t', outputLabel: 'Qimmatbaho metallar (oyiga)', delta: 7.4 },
            { name: 'Prokat zavodi', staff: 2850, output: '280 ming t', outputLabel: 'mahsulot (oyiga)', delta: 3.9 },
            { name: 'Yordamchi ishlab chiqarish', staff: 1220, output: '280 ming t', outputLabel: 'mahsulot (oyiga)', delta: 3.1 },
        ],
        plannedTitle: "QURILAYOTGAN / LOYIHA BOSQICHIDAGI ZAVODLAR",
        planned: [
            { name: 'Misni chuqur qayta ishlash zavodi', stage: 'Qurilish', years: '2026–2029', plannedStaff: 3000, capacity: '500 ming t', capacityLabel: 'Reja quvvati (oyiga)' },
            { name: 'Yangi prokat zavodi', stage: 'Loyiha', years: '2026–2028', plannedStaff: 1500, capacity: '350 ming t', capacityLabel: 'Reja quvvati (oyiga)' },
            { name: 'Kimyo mahsulotlari zavodi', stage: 'Loyiha', years: '2026–2028', plannedStaff: 800, capacity: '120 ming t', capacityLabel: 'Reja quvvati (oyiga)' },
        ],
    },
    {
        key: 'market',
        code: 'MARKET',
        title: 'MARKET — Bozor va sotuv',
        tagline: 'Mahsulotlarimiz dunyo bozorida',
        nodeCaption: 'Bozor va sotuv',
        accent: GC.accent1,
        summary: [
            { value: '3 200', label: 'Xodimlar' },
            { value: '$ 428.7 mln', label: 'Sotuvlar (oyiga)' },
        ],
        activeTitle: "FAOLIYATDA BO'LGAN BO'LIMLAR",
        active: [
            { name: 'TMK Trading', staff: 1450, output: '$ 286 mln', outputLabel: 'Sotuvlar (oyiga)', delta: 7.2 },
            { name: 'Logistika va tashish', staff: 980, output: '$ 84.2 mln', outputLabel: 'Sotuvlar (oyiga)', delta: 4.5 },
            { name: 'Ichki bozor savdosi', staff: 420, output: '$ 58.5 mln', outputLabel: 'Sotuvlar (oyiga)', delta: 3.8 },
        ],
        plannedTitle: 'QURILAYOTGAN / LOYIHA BOSQICHIDAGI LOYIHALAR',
        planned: [
            { name: 'Yangi logistika markazi', stage: 'Qurilish', years: '2026–2027', plannedStaff: 600, capacity: null, capacityLabel: 'Yuk aylanishi (oyiga)' },
            { name: 'Konteyner terminali', stage: 'Qurilish', years: '2026–2027', plannedStaff: 400, capacity: '80 ming t', capacityLabel: 'Yuk aylanishi (oyiga)' },
        ],
    },
];

/** Minglik ajratgichli son: 26840 → "26 840". */
export const fmtNum = (n: number): string => n.toLocaleString('ru-RU').replace(/ /g, ' ');
