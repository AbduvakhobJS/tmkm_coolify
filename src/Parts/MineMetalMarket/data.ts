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
    code?: string;
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
    code?: string;

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

/* Yuqoridagi KPI qatori va uch bosqichning QIYMATLARI bu yerda saqlanmaydi —
   ular API'dan olinadi (`useCompanyData.ts`, COMPANY_DASHBOARD_API.md).
   Bu fayl faqat turlar va rasm manzillarini (ASSETS) belgilaydi. */

/** Minglik ajratgichli son: 26840 → "26 840". */
export const fmtNum = (n: number): string => n.toLocaleString('ru-RU').replace(/ /g, ' ');
