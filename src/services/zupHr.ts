import axios from "axios";

/**
 * 1C:ZUP dan import qilingan kadrlar (HR) API'si — `@Controller('api/hr')`.
 *
 * ⚠️ Base URL haqida: controller yo'lining ichida `api/` allaqachon bor, nginx
 * esa `/api/` ni backend root'ga uzatadi — shuning uchun production'da real yo'l
 * `https://tmk.bgs.uz/api/api/hr/...` bo'lib qoladi. Agar server konfiguratsiyasi
 * o'zgarsa, `REACT_APP_ZUP_HR_BASE` env o'zgaruvchisi orqali almashtiring.
 *
 * Controllerda `@UseGuards` yo'q, lekin loyihadagi boshqa clientlar kabi token
 * baribir yuboriladi — oldinda turgan gateway/nginx uni talab qilishi mumkin.
 * Token `LoginPage` saqlagan "tmk-token-bgs" kalitidan olinadi.
 */
const ZUP_HR_BASE = process.env.REACT_APP_ZUP_HR_BASE ?? "https://tmk.bgs.uz/api/api/hr";

const zupClient = axios.create({ baseURL: ZUP_HR_BASE });

zupClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

/* ── Turlar (hujjatdagi interfeyslarga aynan mos) ── */

export type AgeGroups = {
    under_25: number;
    "25_30": number;
    "30_35": number;
    "35_40": number;
    "40_45": number;
    "45_50": number;
    "50_plus": number;
};

export type HrMetricsItem = {
    unit_id: string | null;
    unit_name: string | null;
    unit_level: string | null;
    period: string;
    period_type: string;
    source_updated_at: string | null;
    metrics: {
        hired: number;
        terminated: number;
        on_leave: number;
        on_sick_leave: number;
        absent_unconfirmed: number;
        unpaid_leave: number;
        maternity_leave: number;
        male?: number;
        female?: number;
        age_groups?: AgeGroups;
    };
};

export type HrMetricsResponse = {
    generated_at: string;
    period: { date_from?: string; date_to?: string; period_type: string };
    group_by?: string;
    data: HrMetricsItem[];
};

export type OrgUnit = {
    id: string;
    name: string;
    level: string | null;
    parent_id: string | null;
    code: string | null;
    is_active: boolean;
};

export type OrgStructureResponse = { generated_at: string; data: OrgUnit[] };

export type AbsenceItem = {
    id: string | null;
    employee_id: string | null;
    employee_name: string | null;
    unit_id: string | null;
    unit_name: string | null;
    absence_type: string;
    start_date: string;
    end_date: string | null;
    status: string | null;
};

export type AbsencesResponse = {
    generated_at: string;
    pagination: { page: number; limit: number; total: number };
    data: AbsenceItem[];
};

export type DemographyItem = {
    unit_id: string | null;
    unit_name: string | null;
    male: number;
    female: number;
    age_groups: AgeGroups;
};

export type DemographyResponse = { generated_at: string; date: string; data: DemographyItem[] };

export type MovementItem = {
    period: string;
    period_type: string;
    unit_id: string | null;
    unit_name: string | null;
    hired: number;
    terminated: number;
};

export type MovementsResponse = { generated_at: string; data: MovementItem[] };

export type ImportStatsResponse = {
    totalSnapshots: number;
    totalAbsences: number;
    totalOrgUnits: number;
    lastImport: string | null;
    sourceUpdatedAt: string | null;
};

export type PeriodType = "day" | "week" | "month" | "year";

/* ── So'rovlar ──
   Global `ValidationPipe({ forbidNonWhitelisted: true })` tufayli DTO'da
   e'lon qilinmagan HAR QANDAY query parametr 400 qaytaradi: cache-buster
   (`_t`), `sort`, `search` va h.k. yuborilmaydi. Bo'sh/undefined qiymatlar
   ham query'ga qo'shilmaydi. */

const clean = <T extends object>(params: T): Partial<T> => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== "") out[k] = v;
    }
    return out as Partial<T>;
};

export const getHrMetrics = async (params: {
    date_from?: string;
    date_to?: string;
    period_type?: PeriodType;
    /** ⚠️ Guruhlamaydi, `unit_level` bo'yicha FILTRLAYDI va 'ALL' qatorini yashiradi. */
    group_by?: "department" | "management" | "division";
}): Promise<HrMetricsResponse> => {
    const { data } = await zupClient.get("/metrics", { params: clean(params) });
    return data;
};

export const getOrgStructure = async (): Promise<OrgStructureResponse> => {
    const { data } = await zupClient.get("/org-structure");
    return data;
};

export const getAbsences = async (params: {
    date_from?: string;
    date_to?: string;
    unit_id?: string;
    absence_type?: string;
    page?: number;
    limit?: number;
}): Promise<AbsencesResponse> => {
    const { data } = await zupClient.get("/absences", { params: clean(params) });
    return data;
};

export const getDemography = async (params: { date?: string; unit_id?: string }): Promise<DemographyResponse> => {
    const { data } = await zupClient.get("/demography", { params: clean(params) });
    return data;
};

export const getMovements = async (params: {
    date_from?: string;
    date_to?: string;
    period_type?: PeriodType;
    unit_id?: string;
}): Promise<MovementsResponse> => {
    const { data } = await zupClient.get("/movements", { params: clean(params) });
    return data;
};

export const getImportStats = async (): Promise<ImportStatsResponse> => {
    const { data } = await zupClient.get("/stats");
    return data;
};

/**
 * 1C:ZUP dan qo'lda to'liq import.
 *
 * ⚠️ HTTP 200 muvaffaqiyat degani EMAS — service 1C xatosini yutadi va nollar
 * bilan javob beradi. Natijani qaytgan raqamlarga qarab baholang.
 * 1C ga ikkita 30s timeoutli so'rov ketadi — shuning uchun 90 soniya timeout.
 */
export const postHrSync = async (): Promise<{ orgUnits: number; snapshots: number; absences: number }> => {
    const { data } = await zupClient.post("/sync", undefined, { timeout: 90_000 });
    return data;
};
