/* ══════════════════════════════════════════════════════════════════════════
   UZTMK — GLOBAL RANG PALITRASI (yagona manba)

   Butun sayt shu fayldan rang oladi. Bitta qiymatni shu yerda o'zgartirsangiz,
   u barcha komponentlarda va barcha CSS fayllarda bir vaqtda o'zgaradi:

     • TSX/inline style va Chart.js  →  `GC.green`, `GC.icon`, ...
     • CSS/SCSS fayllar              →  `var(--gc-green)`, `var(--gc-icon)`, ...

   CSS o'zgaruvchilari `applyPalette()` orqali `:root` ga yoziladi (index.tsx da
   ilova render bo'lishidan oldin chaqiriladi) — ya'ni CSS'da hech qanday hex
   takrorlanmaydi, qiymat faqat shu faylda turadi.

   Manba palitra: "Situatsion markaz" standart ranglari — sovuq ko'k/ko'kimtir
   kulrang asosiy, ogohlantirish uchun faqat qizil/sariq/yashil (pastga qarang,
   SITUATION_ROOM_PALETTE).
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * "Situatsion markaz" standart palitrasi (dashboard ranglar dokumentatsiyasi).
 * O'zgartirmang — semantik `GC` tokenlaridan foydalaning.
 */
export const SITUATION_ROOM_PALETTE = {
    /* Neytral fon qatlamlari */
    bg900: '#0B1118',
    bg800: '#111A24',
    bg700: '#162433',
    border: '#22303D',
    textPrimary: '#E6EDF3',
    textSecondary: '#9AA7B3',
    textDisabled: '#64748B',
    /* Asosiy aksent — ko'k spektr (grafikalar shu oiladan ketma-ket oladi) */
    accent1: '#3B82F6',
    accent2: '#60A5FA',
    accent3: '#93C5FD',
    accent4: '#BFDBFE',
    accent5: '#DBEAFE',
    /* Status / og'ishlar */
    danger: '#E5484D',
    warning: '#F5C542',
    success: '#22C55E',
    /* Neytral grafik elementlari */
    gridLine: '#1F2A37',
    axisLine: '#2A3646',
    tickLabel: '#7B8794',
    areaFill: '#1A2431',
} as const;

/** Eski nom — orqaga moslik uchun saqlanadi, qiymatlari yuqoridagi bilan bir xil. */
export const PALETTE_2026 = SITUATION_ROOM_PALETTE;

const SIT = SITUATION_ROOM_PALETTE;

/* ── Semantik tokenlar — kodda faqat shulardan foydalaniladi ──────────────
   Rangni butun sayt bo'ylab almashtirish uchun shu yerdagi bitta qatorni
   o'zgartirish kifoya. */
export const GC = {
    /* ── Situatsion markaz tokenlari (to'g'ridan-to'g'ri nomlar) ── */
    bg900: SIT.bg900,
    bg800: SIT.bg800,
    bg700: SIT.bg700,
    borderColor: SIT.border,
    textPrimary: SIT.textPrimary,
    textSecondary: SIT.textSecondary,
    textDisabled: SIT.textDisabled,
    accent1: SIT.accent1,
    accent2: SIT.accent2,
    accent3: SIT.accent3,
    accent4: SIT.accent4,
    accent5: SIT.accent5,
    danger: SIT.danger,
    warning: SIT.warning,
    success: SIT.success,
    gridLine: SIT.gridLine,
    axisLine: SIT.axisLine,
    tickLabel: SIT.tickLabel,
    areaFill: SIT.areaFill,

    /* ── Asosiy aksentlar (eski nomlar — ko'k urg'u bilan yangilangan) ── */
    /** Ko'k — asosiy brend rangi, tugma/link/asosiy seriya */
    blue: SIT.accent1,
    /** Moviy (cyan) — panel aksenti, ikkilamchi seriya (endi ko'k oilasidan) */
    cyan: SIT.accent2,
    /** IKONKALAR — barcha ikonka shu rangda (rang-baranglikdan voz kechilgan) */
    icon: SIT.accent2,

    /* ── Holat ranglari ── */
    /** Yashil — ijobiy, o'sish, "norma" */
    green: SIT.success,
    /** Qizil — xato, kritik, pasayish */
    red: SIT.danger,
    /** Sariq/amber — ogohlantirish, kutilmoqda */
    amber: SIT.warning,

    /**
     * Xarita markerlari va ularning toifa filtri.
     * Metall / Kon / Market — uchalasi ham SHU BITTA rangda chiziladi.
     * (Ilgari yashil edi — situatsion markaz palitrasida ko'kka o'tkazildi.)
     */
    marker: SIT.accent1,

    /* ── Qo'shimcha seriya ranglari (boshqa, ko'p toifali grafiklar uchun) ── */
    violet: '#706fd3',
    magenta: '#FF2079',
    deep: '#3A0CA3',
    /** Kulrang-ko'k — ikkilamchi matn, neytral seriya */
    slate: '#4B6584',

    /* ── Sirtlar va matn ── */
    white: '#ffffff',
    /** Sahifa/panel foni */
    panelBg: SIT.bg900,
    /** Kichik kartochka foni */
    cardBg: SIT.bg800,
    /** Sarlavha matni */
    title: SIT.textPrimary,
    /** Asosiy matn */
    text: SIT.textPrimary,
    /** Ikkilamchi/so'nik matn */
    textMuted: SIT.textSecondary,
    /** Chegara (border) */
    border: SIT.border,
    /** Grafik to'ri (grid) */
    grid: SIT.gridLine,
} as const;

export type GcToken = keyof typeof GC;

/**
 * Bosh (hero) grafikalar uchun — bitta rang oilasi, ketma-ket ochilib boradi.
 * Donut/chiziqli/ustunli grafikalarda "asosan ko'kka urg'u" shu ro'yxatdan.
 */
export const ACCENT_SERIES: string[] = [
    GC.accent1, GC.accent2, GC.accent3, GC.accent4, GC.accent5,
];

/**
 * Grafiklarda ketma-ket seriyalar uchun standart tartib.
 * Yangi rang o'ylab topmaslik uchun har doim shu ro'yxatdan olinadi.
 */
export const SERIES_COLORS: string[] = [
    GC.blue, GC.cyan, GC.green, GC.amber, GC.violet, GC.magenta, GC.slate,
];

/** `i`-seriya uchun rang (ro'yxat tugasa aylanadi). */
export const seriesColor = (i: number): string => SERIES_COLORS[i % SERIES_COLORS.length];

/**
 * Hex rangga shaffoflik qo'shadi: `alpha('#26DE81', 0.2)` → `rgba(38,222,129,0.2)`.
 * `#RRGGBB33` kabi qo'shimchalar o'rniga ishlating — nomaqbul formatlar bo'lsa
 * rang o'zgarishsiz qaytariladi.
 */
export const alpha = (color: string, a: number): string => {
    const hex = color.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/**
 * Bitta rangdan gradient yasaydi — ikkinchi uchi shaffoflashtiriladi, ya'ni
 * to'q fonda tabiiy quyuqlashish hosil bo'ladi. Ikkita alohida rang tanlash
 * (va palitradan chetga chiqish) o'rniga shuni ishlating.
 */
export const gradient = (color: string, angle = 120): string =>
    `linear-gradient(${angle}deg, ${color}, ${alpha(color, 0.55)})`;

/* ── CSS o'zgaruvchilari ──────────────────────────────────────────────────
   `--gc-*` nomlari loyihadagi mavjud konvensiyaga mos (App.css). */

/** `GC` tokenlarini `--gc-<token>` ko'rinishidagi CSS o'zgaruvchilariga o'giradi. */
const cssVarName = (key: string) => `--gc-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** `#26DE81` → `38, 222, 129`. Hex bo'lmasa (rgb/rgba) `null`. */
const toRgbChannels = (value: string): string | null => {
    const hex = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        const n = parseInt(hex.slice(1), 16);
        return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    }
    const m = hex.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    return m ? `${m[1]}, ${m[2]}, ${m[3]}` : null;
};

/**
 * Palitrani `:root` ga yozadi. `index.tsx` da, render'dan OLDIN bir marta
 * chaqiriladi — shundan keyin CSS fayllar `var(--gc-green)` kabi yozuvlardan
 * foydalanishi mumkin va qiymat faqat shu faylda saqlanadi.
 */
export const applyPalette = (): void => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(GC)) {
        root.style.setProperty(cssVarName(key), value);
        /* `rgba(var(--gc-green-rgb), .2)` yozuvi uchun kanal qiymatlari */
        const rgb = toRgbChannels(value);
        if (rgb) root.style.setProperty(`${cssVarName(key)}-rgb`, rgb);
    }
    /* Grafik seriyalari CSS tomonda ham kerak bo'lishi mumkin */
    SERIES_COLORS.forEach((c, i) => root.style.setProperty(`--gc-series-${i + 1}`, c));
};
