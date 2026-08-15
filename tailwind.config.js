/** @type {import('tailwindcss').Config} */

/**
 * Tailwind фақат «Сводка» бўлими (`src/Parts/Svodka`) учун ишлатилади —
 * илованинг қолган қисми `App.css` даги қўлда ёзилган темада қолади.
 *
 * Шунинг учун:
 *   • `content` фақат шу папкани сканерлайди — бошқа саҳифалардаги синф
 *     номларидан бекорга утилиталар ясалмайди ва мавжуд CSS билан
 *     тўқнашмайди;
 *   • `preflight` ўчирилган — Tailwind нинг глобал ресети бутун иловани
 *     (тугмалар, сарлавҳалар, чегаралар) ўзгартириб юборарди. Дашбордга
 *     керакли ресет `src/Parts/Svodka/svodka.css` да, `.svodka-dash` ичида
 *     чекланган ҳолда берилган.
 *
 * Рангларнинг қиймати CSS ўзгарувчилар орқали олинади: улар `.svodka-dash`
 * да эълон қилинган, шунда қоронғи/ёруғ тема иккинчи build'сиз алмашади.
 */
module.exports = {
  content: ["./src/Parts/Svodka/**/*.{js,jsx,ts,tsx}"],
  /**
   * Ҳар бир утилита `.svodka-dash` ичига чекланади (`.svodka-dash .flex { … }`).
   *
   * Бусиз утилиталар глобал бўларди ва хостнинг Tailwind услубида ёзилган,
   * лекин ҳозиргача ҳеч нарса қилмаган синфларини «тирилтириб» юборарди —
   * масалан `src/components/PTZControls.tsx` даги `flex flex-col gap-4`,
   * `text-[11px] font-bold uppercase`. У ерда ярми (`mb-6`, `opacity-80`,
   * `tracking-[3px]`) генерация қилинмагани учун натижа бузуқ бўларди.
   */
  important: ".svodka-dash",
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        sunken: "var(--sunken)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        grid: "var(--grid)",
        rule: "var(--rule)",
        hair: "var(--hair)",
        s1: "var(--s1)",
        s2: "var(--s2)",
        s3: "var(--s3)",
        good: "var(--good)",
        warn: "var(--warn)",
        serious: "var(--serious)",
        crit: "var(--crit)",
        "good-ink": "var(--good-ink)",
        "warn-ink": "var(--warn-ink)",
        "crit-ink": "var(--crit-ink)",
      },
      fontFamily: {
        sans: "var(--sans)",
        mono: "var(--mono)",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
      borderRadius: {
        // Хостнинг `dashboardUI.tsx` даги `Card` радиуси.
        card: "12px",
        // Дашборд Tailwind v4 да ёзилган: у ерда `rounded-sm` = 0.25rem
        // (v3 да 0.125rem). Дизайн ўзгармаслиги учун v4 қиймати сақланади.
        sm: "0.25rem",
      },
      screens: {
        // Эски `max-width` сўровларига мос келади (720px / 1180px).
        mid: "721px",
        wide: "1181px",
      },
    },
  },
  plugins: [],
};
