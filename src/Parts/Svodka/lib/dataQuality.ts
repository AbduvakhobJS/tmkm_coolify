/**
 * Маълумот сифати бўйича марказий жой.
 *
 * Импортда топилган хатолар шу файлда бошқарилади. Бэкенд тузатилгач, шу
 * ердаги биттагина қаторни ўзгартириш кифоя — панеллар, жадваллар ва
 * баннерлар ўзи ўзгаради.
 */

/* -------------------------------------------------------------------------- */
/* 1. Электр энергия — йиғинди сатрлари                                       */
/* -------------------------------------------------------------------------- */

/**
 * Excel «Электроэнергия» варағидаги йиғинди сатрлари. Улар алоҳида
 * истеъмолчи эмас — импорт уларни ҳам қатор сифатида олгани учун энергия
 * икки марта ҳисобланади — умумий йиғинди сезиларли ошиб кетади.
 */
export const ENERGY_SUBTOTAL_ROWS = ["ЭНЦ общ.", "Итого:", "По комб-ту:"];

/**
 * `groupBy=type` кесимида ўша `ЭНЦ общ.` сатри «Белгиланмаган» тури билан
 * келади (у `Справочники.xlsx` да йўқ, шунинг учун заводга бириктирилмаган).
 */
export const ENERGY_SUBTOTAL_TYPE = "Белгиланмаган";

export function isEnergySubtotal(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.trim();
  return n === ENERGY_SUBTOTAL_TYPE || ENERGY_SUBTOTAL_ROWS.includes(n);
}

/* Матндаги «ЭНЦ общ.» ва «По комб-ту:» — манба файлдаги сатрларнинг ҳақиқий
   номлари, шунинг учун улар айнан ўша кўринишда қолдирилган. */
export const ENERGY_SUBTOTAL_NOTE =
  "«ЭНЦ общ.» yig'indi satri takroriy hisobni oldini olish uchun chiqarilgan " +
  "(ЭНЦ + ВКЦ + ЦПК + ЭРЦ). Manba fayldagi «По комб-ту:» yakuni bilan mos.";

/* -------------------------------------------------------------------------- */
/* 2. Текширилмаган бўлимлар                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Бу бўлимларда манба қийматларининг ўзи бузуқ. Панеллар, жадваллар ва
 * тузилма қурилади, лекин **сон қийматлар кўрсатилмайди** — уларнинг ўрнида
 * `<Masked>` чипи туради ва тепада қизил баннер бўлади.
 *
 * Бэкенд тузатилгач: тегишли қаторни шу объектдан ўчириш кифоя.
 */
export const UNVERIFIED: Record<string, { bug: string }> = {
  /* Ҳозир бўш: барча бўлимлар манба билан солиштириб текширилган ва
     ниқобдан чиқарилган.

     Ўлчов бирлиги шубҳали СГП маҳсулотлари бўлим даражасида эмас, **қатор
     даражасида** белгиланади — қуйидаги `isSgpSuspect` га қаранг.

     Янги хато топилса, шу ерга қатор қўшилади:
       areaKey: { bug: "нима нотўғри ва нима учун сон кўрсатилмайди" } */
};

export function isUnverified(area: string): boolean {
  return Object.hasOwn(UNVERIFIED, area);
}

/** Бўлим калитининг ўзбекча номи — футер матнини қўлда ёзиб эскиртирмаслик учун. */
const AREA_LABELS: Record<string, string> = {
  ingichka: "Ingichka",
  ogarok: "Ogarok",
  cisterns: "sisterna",
  sgp: "SGP",
};

/** «Огарок, Ингичка, цистерна ва СГП» — `UNVERIFIED` дан ҳосил бўлади. */
export function unverifiedAreasText(): string {
  const names = Object.keys(UNVERIFIED).map((k) => AREA_LABELS[k] ?? k);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + " va " + names[names.length - 1];
}

export function unverifiedReason(area: string): string | null {
  return UNVERIFIED[area]?.bug ?? null;
}

/** Ниқобланган қиймат ўрнида кўринадиган матн. */
export const MASK_TEXT = "tekshirilmoqda";
export const MASK_TEXT_LONG = "Ma'lumot tekshirilmoqda";

/* -------------------------------------------------------------------------- */
/* 3. СГП — ўлчов бирлиги шубҳали маҳсулотлар                                 */
/* -------------------------------------------------------------------------- */

/**
 * Ўлчов бирлиги шубҳаси **бэкендда** аниқланади (API-BUGS №8б) ва
 * `unitSuspect` / `suspectReason` / `suspectNote` майдонлари орқали келади.
 * Бу ерда қўлда рўйхат сақланмайди — акс ҳолда иккита рўйхат вақт ўтиб
 * бир-биридан узоқлашади. Рўйхат: `production-report.service.ts` →
 * `SGP_UNIT_SUSPECT`.
 *
 * Икки тур:
 *  - `spread` — автоматик: давр ичида қийматлар кескин фарқ қилган
 *    (қиймат ой ўртасида тахминан 1000 баробар сакрайди — тоннадан
 *    килограммга ўтилган)
 *  - `unit-label` — қўлдаги рўйхатдан: қиймат барқарор бўлгани учун автоматик
 *    топилмайди, лекин у ишлаб чиқариш суръатига умуман мос келмайди
 *
 * Ниқоб бўлим даражасида эмас, **қатор даражасида**: маҳсулотларнинг
 * аксарияти тоза, фақат шубҳалилари яширилади.
 */
export interface SgpSuspectLike {
  name: string;
  unitSuspect?: boolean;
  suspectReason?: "spread" | "unit-label" | null;
  suspectNote?: string | null;
  spread?: number | null;
}

export const isSgpSuspect = (p: SgpSuspectLike): boolean => Boolean(p.unitSuspect);

/** Ниқоб остидаги сабаб — тултипда кўрсатилади. */
export function sgpSuspectReason(p: SgpSuspectLike): string | null {
  if (!isSgpSuspect(p)) return null;
  if (p.suspectNote) return p.suspectNote;
  if (p.suspectReason === "unit-label")
    return "o'lchov birligi manbada noto'g'ri yozilgan (qo'ldagi ro'yxatdan).";
  const s = p.spread;
  return (
    "davr ichida o'lchov birligi almashganga o'xshaydi" +
    (s ? ` — qiymatlar ${nfSpread(s)} barobar farq qiladi` : "") +
    ". Son ko'rsatilmaydi."
  );
}

const nfSpread = (s: number): string =>
  s >= 1000 ? Math.round(s / 100) * 100 + "+" : String(Math.round(s));

/** Қисқа ёрлиқ — қайси турдаги шубҳа экани. */
export const sgpSuspectKind = (p: SgpSuspectLike): string =>
  p.suspectReason === "unit-label" ? "birlik yorlig'i" : "davr ichida sakrash";

/* -------------------------------------------------------------------------- */
/* 4. Заводга боғланмаган позициялар                                          */
/* -------------------------------------------------------------------------- */

/** `/production/tree` да бириктирилмаган позициялар шу ном билан келади. */
/* Диққат: `UNASSIGNED_PLANT` — API қайтарадиган **қиймат**, таржима қилинмайди.
   Экранда унинг ўрнига `UNASSIGNED_PLANT_LABEL` кўрсатилади. */
export const UNASSIGNED_PLANT = "Белгиланмаган";
export const UNASSIGNED_PLANT_LABEL = "Zavodga bog'lanmagan";
export const UNASSIGNED_PLANT_NOTE =
  "bu pozitsiyalar «Справочники.xlsx» da yo'q — asosan 10-sex va RMU. Bazaviy " +
  "birligi aniqlanmagani uchun ular birlik kesimidagi yig'indilarga qo'shilmaydi.";

export const plantLabel = (name: string): string =>
  name === UNASSIGNED_PLANT ? UNASSIGNED_PLANT_LABEL : name;

/** Базавий бирлиги аниқланмаган: API `null` ёки `"—"` қайтаради. */
export const isUnknownUnit = (baseUnit: string | null | undefined): boolean =>
  baseUnit == null || baseUnit.trim() === "" || baseUnit.trim() === "—";
