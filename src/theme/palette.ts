/* ══════════════════════════════════════════════════════════════════════════
   UZTMK — GLOBAL RANG PALITRASI (yagona manba)

   Butun sayt shu fayldan rang oladi. Bitta qiymatni shu yerda o'zgartirsangiz,
   u barcha komponentlarda va barcha CSS fayllarda bir vaqtda o'zgaradi:

     • TSX/inline style va Chart.js  →  `GC.green`, `GC.icon`, ...
     • CSS/SCSS fayllar              →  `var(--gc-green)`, `var(--gc-icon)`, ...

   CSS o'zgaruvchilari `applyPalette()` orqali `:root` ga yoziladi (index.tsx da
   ilova render bo'lishidan oldin chaqiriladi) — ya'ni CSS'da hech qanday hex
   takrorlanmaydi, qiymat faqat shu faylda turadi.

   Manba palitra: henu.at — "Trending Color Palettes 2026".
   ══════════════════════════════════════════════════════════════════════════ */

/** henu.at 2026 palitrasidagi xom ranglar (o'zgartirmang — semantik nomlardan foydalaning). */
export const PALETTE_2026 = {
    /** Electric Pulse — fintech/AI uchun "Stripe-blue" */
    electricBlue: '#635BFF',
    electricCyan: '#00E5E5',
    /** Sky Pulse */
    skyCyan: '#00D2FF',
    deepViolet: '#3A0CA3',
    /** Night Moss */
    mossGreen: '#26DE81',
    /** Toxic Sun */
    sunAmber: '#F7B731',
    sunRed: '#EB3B5A',
    /** Synth Wave */
    neonMagenta: '#FF2079',
    /** Solar Violet */
    solarViolet: '#706fd3',
    /** Lava Core */
    steelSlate: '#4B6584',
    /** Carbon Mint */
    carbon: '#2D3436',
} as const;

/* ── Semantik tokenlar — kodda faqat shulardan foydalaniladi ──────────────
   Rangni butun sayt bo'ylab almashtirish uchun shu yerdagi bitta qatorni
   o'zgartirish kifoya. */
export const GC = {
    /* ── Asosiy aksentlar ── */
    /** Ko'k — asosiy brend rangi, tugma/link/asosiy seriya */
    blue: PALETTE_2026.electricBlue,
    /** Moviy (cyan) — panel aksenti, ikkilamchi seriya */
    cyan: PALETTE_2026.skyCyan,
    /** IKONKALAR — barcha ikonka shu rangda (rang-baranglikdan voz kechilgan) */
    icon: '#37e1ff',

    /* ── Holat ranglari ── */
    /** Yashil — ijobiy, o'sish, "norma" */
    green: PALETTE_2026.mossGreen,
    /** Qizil — xato, kritik, pasayish */
    red: PALETTE_2026.sunRed,
    /** Sariq/amber — ogohlantirish, kutilmoqda */
    amber: PALETTE_2026.sunAmber,

    /**
     * Xarita markerlari va ularning toifa filtri.
     * Metall / Kon / Market — uchalasi ham SHU BITTA rangda chiziladi.
     */
    marker: '#469110',

    /* ── Qo'shimcha seriya ranglari (grafiklar uchun) ── */
    violet: PALETTE_2026.solarViolet,
    magenta: PALETTE_2026.neonMagenta,
    deep: PALETTE_2026.deepViolet,
    /** Kulrang-ko'k — ikkilamchi matn, neytral seriya */
    slate: PALETTE_2026.steelSlate,

    /* ── Sirtlar va matn ── */
    white: '#ffffff',
    /** Sahifa/panel foni */
    panelBg: 'rgb(3, 13, 34)',
    /** Kichik kartochka foni */
    cardBg: 'rgba(255, 255, 255, 0.05)',
    /** Sarlavha matni */
    title: 'rgb(236, 242, 243)',
    /** Asosiy matn */
    text: '#f1f2f6',
    /** Ikkilamchi/so'nik matn */
    textMuted: '#9fb3c8',
    /** Chegara (border) */
    border: 'rgba(55, 225, 255, 0.18)',
    /** Grafik to'ri (grid) */
    grid: 'rgba(255, 255, 255, 0.06)',
} as const;

export type GcToken = keyof typeof GC;

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
