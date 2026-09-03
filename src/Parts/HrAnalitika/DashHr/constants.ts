import { GC, SERIES_COLORS } from "../../../theme/palette";
import type { AbsenceKey, AbsenceMetrics, AgeGroups, PeriodType, UnitLevel } from "../../../services/dashHr";

/* ══════════════════════════════════════════════════════════════════════════
   dash_HR_API ekranining lug'atlari.

   27 ta yo'qlik metrikasi API'dan ALOHIDA maydonlar bo'lib keladi
   (spetsifikatsiya §8) — API ularni guruhlamaydi, guruhlash mijoz tomonda.
   Quyidagi guruhlar TZ §5.2 dagi biznes-mantiqqa mos:
     ta'til / B/S / dekret / kasallik / sababsiz yo'qlik va h.k.
   ══════════════════════════════════════════════════════════════════════════ */

export type AbsenceGroup = {
    id: string;
    /** Guruh sarlavhasi. */
    label: string;
    color: string;
    /** Guruhga kiruvchi API kalitlari. */
    keys: AbsenceKey[];
    /** TZ §5.2 dagi qaysi ko'rsatkichga to'g'ri keladi. */
    tzNote: string;
};

/** Har bir API kalitining o'zbekcha nomi (§8 jadvalidagi tavsifdan). */
export const ABSENCE_LABELS: Record<AbsenceKey, string> = {
    annual_leave: "Asosiy ta'til",
    additional_leave: "Qo'shimcha ta'til",
    study_leave_paid: "O'quv ta'tili (to'lanadigan)",
    sanatorium_leave: "Sanatoriy-kurort ta'tili",

    unpaid_leave_by_law: "B/S — qonun bo'yicha",
    unpaid_leave_by_employer: "B/S — ish beruvchi ruxsati bilan",
    additional_leave_unpaid: "Qo'shimcha B/S",
    study_leave_unpaid: "O'quv ta'tili (B/S)",

    pregnancy_leave: "Homiladorlik va tug'ish ta'tili",
    parental_care_leave: "Bola parvarishi ta'tili",
    working_on_parental_leave: "Dekretda turib ishlayapti",

    sick_leave_paid: "Kasallik (to'lanadigan)",
    sick_leave_unpaid: "Kasallik (to'lovsiz)",

    absent_unconfirmed_reason: "Sababi aniqlanmagan yo'qlik",
    truancy: "Progul",
    forced_absence: "Majburiy progul",

    business_trip: "Xizmat safari",
    civic_duty: "Davlat majburiyatlari",
    absence_with_pay: "Boshqa yo'qlik (ish haqi saqlanadi)",

    extra_days_off_paid: "Qo'shimcha dam olish (to'lanadigan)",
    extra_days_off_unpaid: "Qo'shimcha dam olish (to'lovsiz)",

    downtime_worker_fault: "Bekor turish — xodim aybi",
    downtime_employer_fault: "Bekor turish — ish beruvchi aybi",
    downtime_neutral: "Bekor turish — bog'liq bo'lmagan sabab",

    transfer: "Ko'chirish (Перемещение)",
    factual_work: "Fakt (xizmatchi holat)",
    termination_state: "Bo'shatilgan holati",
};

/** 1C dagi enum nomi — «Ma'lumot sifati» blokida `/states` bilan solishtiriladi. */
export const ABSENCE_ENUMS: Record<AbsenceKey, string> = {
    annual_leave: "ОтпускОсновной",
    additional_leave: "ДополнительныйОтпуск",
    study_leave_paid: "ОтпускУчебныйОплачиваемый",
    sanatorium_leave: "ОтпускНаСанаторноКурортноеЛечение",
    unpaid_leave_by_law: "ОтпускНеоплачиваемыйПоЗаконодательству",
    unpaid_leave_by_employer: "ОтпускНеоплачиваемыйПоРазрешениюРаботодателя",
    additional_leave_unpaid: "ДополнительныйОтпускНеоплачиваемый",
    study_leave_unpaid: "ОтпускУчебныйНеоплачиваемый",
    pregnancy_leave: "ОтпускПоБеременностиИРодам",
    parental_care_leave: "ОтпускПоУходуЗаРебенком",
    working_on_parental_leave: "РаботаВОтпускеПоУходуЗаРебенком",
    sick_leave_paid: "Болезнь",
    sick_leave_unpaid: "БолезньБезОплаты",
    absent_unconfirmed_reason: "ОтсутствиеПоНевыясненнымПричинам",
    truancy: "Прогул",
    forced_absence: "ВынужденныйПрогул",
    business_trip: "Командировка",
    civic_duty: "ВыполнениеГосударственныхОбязанностей",
    absence_with_pay: "ОтсутствиеССохранениемОплаты",
    extra_days_off_paid: "ДополнительныеВыходныеДниОплачиваемые",
    extra_days_off_unpaid: "ДополнительныеВыходныеДниНеОплачиваемые",
    downtime_worker_fault: "ПростойПоВинеРаботника",
    downtime_employer_fault: "ПростойПоВинеРаботодателя",
    downtime_neutral: "ПростойНеЗависящийОтРаботодателяИРаботника",
    transfer: "Перемещение",
    factual_work: "Факт",
    termination_state: "Увольнение",
};

/** TZ §5.2 bo'yicha guruhlash — API'ning o'zi guruhlamaydi. */
export const ABSENCE_GROUPS: AbsenceGroup[] = [
    {
        id: "leave",
        label: "Ta'tilda (to'lanadigan)",
        color: GC.blue,
        keys: ["annual_leave", "additional_leave", "study_leave_paid", "sanatorium_leave"],
        tzNote: "TZ §5.2.1 — mehnat ta'tilidagilar",
    },
    {
        id: "sick",
        label: "Kasallik varaqasida",
        color: GC.violet,
        keys: ["sick_leave_paid", "sick_leave_unpaid"],
        tzNote: "TZ §5.2.2 — vaqtincha mehnatga layoqatsizlik",
    },
    {
        id: "absent",
        label: "Sababsiz yo'qlik",
        color: GC.amber,
        keys: ["absent_unconfirmed_reason", "truancy", "forced_absence"],
        tzNote: "TZ §5.2.3 — neyavka / progul (§20 kelishuvi bo'yicha)",
    },
    {
        id: "unpaid",
        label: "B/S — ish haqi saqlanmasdan",
        color: GC.cyan,
        keys: ["unpaid_leave_by_law", "unpaid_leave_by_employer", "additional_leave_unpaid", "study_leave_unpaid"],
        tzNote: "TZ §5.2.4 — Б/С",
    },
    {
        id: "maternity",
        label: "Dekret",
        color: GC.magenta,
        keys: ["pregnancy_leave", "parental_care_leave", "working_on_parental_leave"],
        tzNote: "TZ §5.2.5 — BiR + bola parvarishi",
    },
    {
        id: "trip",
        label: "Safar va majburiyatlar",
        color: GC.green,
        keys: ["business_trip", "civic_duty", "absence_with_pay"],
        tzNote: "Ishda hisoblanadi, lekin ish joyida emas",
    },
    {
        id: "dayoff",
        label: "Qo'shimcha dam olish",
        color: GC.deep,
        keys: ["extra_days_off_paid", "extra_days_off_unpaid"],
        tzNote: "Qo'shimcha dam olish kunlari",
    },
    {
        id: "downtime",
        label: "Bekor turish",
        color: GC.red,
        keys: ["downtime_worker_fault", "downtime_employer_fault", "downtime_neutral"],
        tzNote: "Простой — uch xil aybdorlik bo'yicha",
    },
    {
        id: "other",
        label: "Boshqa holatlar",
        color: GC.slate,
        keys: ["transfer", "factual_work", "termination_state"],
        tzNote: "Xizmatchi/oraliq holatlar — yo'qlik emas",
    },
];

/** Barcha 27 kalit — guruhlar tartibida. */
export const ALL_ABSENCE_KEYS: AbsenceKey[] = ABSENCE_GROUPS.flatMap((g) => g.keys);

/**
 * «Hozir yo'q» deb sanaladigan guruhlar. `trip` (safar) va `other`
 * (xizmatchi holatlar) qo'shilmaydi: safardagi xodim ishda hisoblanadi,
 * `factual_work`/`termination_state` esa umuman yo'qlik emas.
 */
export const ABSENT_GROUP_IDS = ["leave", "sick", "absent", "unpaid", "maternity", "dayoff", "downtime"];

export const groupColor = (id: string): string =>
    ABSENCE_GROUPS.find((g) => g.id === id)?.color ?? GC.slate;

/** Bitta qatordan guruh yig'indisi. */
export const sumGroup = (row: Partial<AbsenceMetrics> | undefined, group: AbsenceGroup): number =>
    row ? group.keys.reduce((s, k) => s + (row[k] ?? 0), 0) : 0;

/* ── Yosh guruhlari (spetsifikatsiya §6.3) ── */
export const AGE_LABELS: { key: keyof AgeGroups; label: string }[] = [
    { key: "under_25", label: "25 gacha" },
    { key: "25_30", label: "25–30" },
    { key: "30_35", label: "30–35" },
    { key: "35_40", label: "35–40" },
    { key: "40_45", label: "40–45" },
    { key: "45_50", label: "45–50" },
    { key: "50_plus", label: "50+" },
];
export const AGE_COLORS = SERIES_COLORS;

/* ── Filtrlar ── */
export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Kun" },
    { value: "week", label: "Hafta" },
    { value: "month", label: "Oy" },
    { value: "year", label: "Yil" },
];

export const LEVEL_OPTIONS: { value: UnitLevel; label: string }[] = [
    { value: "division", label: "Departament" },
    { value: "management", label: "Boshqarma" },
    { value: "department", label: "Bo'lim" },
];

/** `/org-structure` dagi `level` qiymatining o'zbekcha nomi. */
export const LEVEL_LABELS: Record<UnitLevel, string> = {
    division: "Departament",
    management: "Boshqarma",
    department: "Bo'lim",
};

/* ── Sana yordamchilari ── */
export const isoDay = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const daysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return isoDay(d);
};

/** `2026-06-08` → `08.06.2026`. */
export const fmtDay = (iso?: string | null): string => {
    if (!iso) return "—";
    const [y, m, d] = iso.slice(0, 10).split("-");
    return y && m && d ? `${d}.${m}.${y}` : "—";
};

/** To'liq ISO timestamp → `08.06.2026 07:00`. */
export const fmtStamp = (iso?: string | null): string => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** Davr bakchasi sarlavhasi — `period_type` ga qarab. */
export const fmtBucket = (iso: string, type: PeriodType): string => {
    const [y, m, d] = iso.slice(0, 10).split("-");
    if (type === "year") return y ?? iso;
    if (type === "month") return `${m}.${y}`;
    return `${d}.${m}`;
};
