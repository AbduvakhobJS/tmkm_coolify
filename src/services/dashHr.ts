import axios from "axios";

/* ══════════════════════════════════════════════════════════════════════════
   dash_HR_API — 1C:ZUP 3.1 KORP kadrlar ko'rsatkichlari REST API'si (v1.0).

   Manba hujjatlar:
     • «Техническое задание на разработку API»                (TZ)
     • «Спецификация API кадровых показателей (dash_HR_API)»  (spetsifikatsiya)
     • dash_HR_API.postman_collection.json                    (Postman)

   Bu MAVJUD `services/zupHr.ts` dan BOSHQA API: u eski proksi (`/api/hr/*`,
   backend importi), bu esa 1C dagi `dashboard` kengaytmasining HTTP-servisi —
   8 ta endpoint, 27 ta granular yo'qlik metrikasi, shtat/fakt/vakansiya va
   xodimlar ro'yxati. Eski fayl o'zgartirilmagan, ikkalasi yonma-yon yashaydi.

   ⚠️ Base URL va autentifikatsiya
   Spetsifikatsiya §3: `http://<host>/<baza>/hs/dash_hr_api`, Basic Auth.
   Brauzerdan to'g'ridan-to'g'ri 1C ga urish CORS'ga tayanadi va login/parol
   bundle ichiga tushadi — shuning uchun PRODUCTION'da oldiga proksi qo'yish
   tavsiya etiladi. Ikkala holat ham env orqali sozlanadi:

     REACT_APP_DASH_HR_BASE   — masalan `/api/dash-hr` (proksi) yoki
                                `http://10.100.5.109/TMK_ZUP/hs/dash_hr_api`
     REACT_APP_DASH_HR_LOGIN  — Basic Auth login   (proksi bo'lsa — kerak emas)
     REACT_APP_DASH_HR_PASS   — Basic Auth parol   (proksi bo'lsa — kerak emas)

   Env berilmasa spetsifikatsiyadagi test stendi ishlatiladi (§3.2).
   ══════════════════════════════════════════════════════════════════════════ */

const BASE = process.env.REACT_APP_DASH_HR_BASE ?? "http://10.100.5.109/TMK_ZUP/hs/dash_hr_api";
const LOGIN = process.env.REACT_APP_DASH_HR_LOGIN ?? "API_dashboard";
const PASS = process.env.REACT_APP_DASH_HR_PASS ?? "API_dashboard";

/** Proksi orqali ishlansa (nisbiy yo'l) — Basic Auth serverda qo'yiladi. */
const isProxied = BASE.startsWith("/");

/** Ekranda ko'rsatish uchun (maxfiy ma'lumotsiz). */
export const DASH_HR_BASE = BASE;

const dashClient = axios.create({
    baseURL: BASE,
    /* Agregatorlar (/metrics, /employees) 1C da og'ir: TZ §14 bo'yicha 10 soniya
       normativ, lekin katta bazada ko'proq ketishi mumkin. */
    timeout: 60_000,
    ...(isProxied ? {} : { auth: { username: LOGIN, password: PASS } }),
});

/* Proksi rejimida loyihaning umumiy tokeni yuboriladi (boshqa clientlar kabi). */
dashClient.interceptors.request.use((config) => {
    if (!isProxied) return config;
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return config;
});

/* ══════════════════════════════════════════════════════════════════════════
   Turlar — spetsifikatsiya §6 dagi javob strukturalariga aynan mos
   ══════════════════════════════════════════════════════════════════════════ */

export type PeriodType = "day" | "week" | "month" | "year";
/** Orgstruktura darajasi: depth 0 → division, 1 → management, ≥2 → department. */
export type UnitLevel = "division" | "management" | "department";
export type AbsenceMode = "on_date" | "period";

/** Har bir javobning umumiy "shapkasi" (§7.1). */
type Envelope = {
    generated_at: string;
    /** 1C dagi ma'lumot dolzarbligi vaqti. `/states` da yo'q. */
    source_updated_at?: string;
};

export type AgeGroups = {
    under_25: number;
    "25_30": number;
    "30_35": number;
    "35_40": number;
    "40_45": number;
    "45_50": number;
    "50_plus": number;
};

/** §8 — 27 ta granular yo'qlik metrikasi (СостоянияСотрудника, `Работа` dan tashqari). */
export type AbsenceMetrics = {
    /* Oplanadigan ta'tillar */
    annual_leave: number;
    additional_leave: number;
    study_leave_paid: number;
    sanatorium_leave: number;
    /* Ish haqi saqlanmaydigan (B/S) */
    unpaid_leave_by_law: number;
    unpaid_leave_by_employer: number;
    additional_leave_unpaid: number;
    study_leave_unpaid: number;
    /* Dekret */
    pregnancy_leave: number;
    parental_care_leave: number;
    working_on_parental_leave: number;
    /* Kasallik varaqasi */
    sick_leave_paid: number;
    sick_leave_unpaid: number;
    /* Sababsiz yo'qlik / progul */
    absent_unconfirmed_reason: number;
    truancy: number;
    forced_absence: number;
    /* Safar va davlat majburiyatlari */
    business_trip: number;
    civic_duty: number;
    absence_with_pay: number;
    /* Qo'shimcha dam olish kunlari */
    extra_days_off_paid: number;
    extra_days_off_unpaid: number;
    /* Bekor turish (простой) */
    downtime_worker_fault: number;
    downtime_employer_fault: number;
    downtime_neutral: number;
    /* Boshqa holatlar */
    transfer: number;
    factual_work: number;
    termination_state: number;
};

export type AbsenceKey = keyof AbsenceMetrics;

/* ── 1. /org-structure ── */
export type OrgUnit = {
    unit_id: string;
    code: string | null;
    unit_name: string;
    parent_id: string | null;
    organization_id: string | null;
    level: UnitLevel;
    depth: number;
    active: boolean;
};
export type OrgStructureResponse = Envelope & { data: OrgUnit[] };

/* ── 2. /movements ── */
export type MovementRow = {
    /** Davr bakchasining boshi, `YYYY-MM-DD`. */
    period: string;
    unit_id: string | null;
    unit_name: string | null;
    hired: number;
    terminated: number;
};
export type MovementsResponse = Envelope & {
    period: { date_from: string; date_to: string; period_type: PeriodType };
    data: MovementRow[];
};

/* ── 3. /demography ── */
export type DemographyRow = {
    unit_id: string | null;
    unit_name: string | null;
    male: number;
    female: number;
    age_groups: AgeGroups;
};
export type DemographyResponse = Envelope & { as_of_date: string; data: DemographyRow[] };

/* ── 4. /absences ── */
export type AbsenceRow = AbsenceMetrics & {
    unit_id: string | null;
    unit_name: string | null;
};
export type AbsencesResponse = Envelope & {
    mode: AbsenceMode;
    /** `mode=on_date` da qaytadi. */
    as_of_date?: string;
    /** `mode=period` da qaytadi. */
    period?: { date_from: string; date_to: string };
    data: AbsenceRow[];
};

/* ── 5. /metrics ── */
export type MetricsUnit = {
    unit_id: string | null;
    unit_name: string | null;
    level: UnitLevel | null;
    periods: { period: string; hired: number; terminated: number }[];
    /** `include_*` false bo'lsa mos maydonlar kelmaydi — shuning uchun Partial. */
    totals: Partial<AbsenceMetrics> & {
        hired: number;
        terminated: number;
        male?: number;
        female?: number;
        age_groups?: AgeGroups;
    };
};
export type MetricsResponse = Envelope & {
    period: { date_from: string; date_to: string; period_type: PeriodType };
    group_by: UnitLevel;
    data: MetricsUnit[];
};

/* ── 6. /headcount ── */
export type HeadcountRow = {
    unit_id: string | null;
    unit_name: string | null;
    /** Shtat: tasdiqlangan va yopilmagan pozitsiyalar stavkalari yig'indisi. */
    planned: number;
    /** Fakt: sanaga faol xodimlar soni. */
    actual: number;
    /** planned − actual; ortiqcha to'plamda MANFIY bo'lishi mumkin. */
    vacancy: number;
};
export type HeadcountResponse = Envelope & { as_of_date: string; data: HeadcountRow[] };

/* ── 7. /employees ── */
export type EmployeeRow = {
    employee_id: string;
    full_name: string;
    personnel_code: string | null;
    physical_person_id: string | null;
    gender: "male" | "female" | null;
    birth_date: string | null;
    age: number | null;
    unit_id: string | null;
    unit_name: string | null;
    position_id: string | null;
    position_name: string | null;
    organization_id: string | null;
    organization_name: string | null;
};
export type EmployeesResponse = Envelope & {
    as_of_date: string;
    /** `limit`siz to'liq son. */
    row_count: number;
    returned: number;
    truncated: boolean;
    limit: number;
    data: EmployeeRow[];
};

/* ── 8. /states ── */
export type StateRow = {
    enum_name: string;
    enum_synonym: string;
    /** Maplanmagan bo'lsa bo'sh string. */
    api_key: string;
    mapped: boolean;
};
export type StatesResponse = Envelope & { data: StateRow[] };

/* ══════════════════════════════════════════════════════════════════════════
   So'rovlar
   ══════════════════════════════════════════════════════════════════════════ */

/** Bo'sh/undefined parametrlarni query'ga qo'shmaydi. */
const clean = <T extends object>(params: T): Partial<T> => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") out[k] = v;
    }
    return out as Partial<T>;
};

/**
 * 1C xatoni 200 bilan ham qaytarishi mumkin (§7.3: `{ error: true, message }`).
 * HTTP status'ga qo'shimcha ravishda body ham tekshiriladi.
 */
const unwrap = <T,>(data: any): T => {
    if (data && typeof data === "object" && data.error === true) {
        throw new Error(String(data.message ?? "1C xatosi"));
    }
    return data as T;
};

export const getOrgStructure = async (params: {
    active_only?: boolean;
    organization_id?: string;
} = {}): Promise<OrgStructureResponse> => {
    const { data } = await dashClient.get("/org-structure", { params: clean(params) });
    return unwrap<OrgStructureResponse>(data);
};

export const getMovements = async (params: {
    date_from: string;
    date_to: string;
    period_type?: PeriodType;
    organization_id?: string;
}): Promise<MovementsResponse> => {
    const { data } = await dashClient.get("/movements", { params: clean(params) });
    return unwrap<MovementsResponse>(data);
};

export const getDemography = async (params: {
    date?: string;
    organization_id?: string;
} = {}): Promise<DemographyResponse> => {
    const { data } = await dashClient.get("/demography", { params: clean(params) });
    return unwrap<DemographyResponse>(data);
};

/**
 * `mode=on_date` — sanadagi holat; `mode=period` — davr ichida statusga
 * tushganlar. Har (bo'linma, metrika, xodim) uchun xodim BIR marta sanaladi.
 */
export const getAbsences = async (params: {
    mode?: AbsenceMode;
    date?: string;
    date_from?: string;
    date_to?: string;
    organization_id?: string;
}): Promise<AbsencesResponse> => {
    const { data } = await dashClient.get("/absences", { params: clean(params) });
    return unwrap<AbsencesResponse>(data);
};

export const getMetrics = async (params: {
    date_from: string;
    date_to: string;
    period_type?: PeriodType;
    group_by?: UnitLevel;
    organization_id?: string;
    include_gender?: boolean;
    include_age_groups?: boolean;
    include_absences?: boolean;
}): Promise<MetricsResponse> => {
    const { data } = await dashClient.get("/metrics", { params: clean(params) });
    return unwrap<MetricsResponse>(data);
};

export const getHeadcount = async (params: {
    date?: string;
    organization_id?: string;
    unit_id?: string;
} = {}): Promise<HeadcountResponse> => {
    const { data } = await dashClient.get("/headcount", { params: clean(params) });
    return unwrap<HeadcountResponse>(data);
};

/** Kursorli paginatsiya yo'q — to'liq dump uchun `limit` oshiriladi (max 5000). */
export const getEmployees = async (params: {
    date?: string;
    limit?: number;
    organization_id?: string;
    unit_id?: string;
} = {}): Promise<EmployeesResponse> => {
    const { data } = await dashClient.get("/employees", { params: clean(params) });
    return unwrap<EmployeesResponse>(data);
};

/** Xizmatchi endpoint: enum → API-kalit mosligi (`mapped: false` — e'tibor talab qiladi). */
export const getStates = async (): Promise<StatesResponse> => {
    const { data } = await dashClient.get("/states");
    return unwrap<StatesResponse>(data);
};
