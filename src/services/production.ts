import axios from "axios";

/**
 * tmk.bgs.uz/api/production-report uchun alohida axios instance.
 * Token localStorage'da "Bearer ..." bilan birga saqlanadi (LoginPage.tsx).
 */
const productionClient = axios.create({
    baseURL: "https://tmk.bgs.uz/api/production-report",
});

productionClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

export type FiltersResponse = {
    success: boolean;
    data: {
        materials: string[];
        factories: string[];
        units: string[];
        dateRange: { min: string; max: string };
    };
};

export type NarastaykaRow = {
    for_day: string;
    product: string;
    short_name: string;
    material: string;
    factory: string;
    unit: string;
    base_unit: string;
    plan: number;
    fakt: number;
    plan_base: number;
    fakt_base: number;
    source_file: string;
};

export type NarastaykaListResponse = {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    data: NarastaykaRow[];
};

export const getFilters = async (): Promise<FiltersResponse> => {
    const response = await productionClient.get("/filters");
    return response.data;
};

export const getNarastaykaPage = async (
    from: string,
    to: string,
    page: number,
    limit: number
): Promise<NarastaykaListResponse> => {
    const response = await productionClient.get("/narastayka", {
        params: { from, to, page, limit },
    });
    return response.data;
};

/* ── /dashboard — metallar dashboardi uchun yig'ma ko'rsatkichlar ──
   Har bir son maydoni `null` bo'lishi mumkin: bu API'da (qarang Svodka/api/types.ts)
   ma'lumot topilmagan hollarda `null` qaytariladi. Frontend shu sababli har bir
   blokni alohida tekshiradi va yo'q bo'lsa mock dataga tushadi. */

export type DashboardMonth = {
    /** Ekranda ko'rsatiladigan yorliq, masalan "Yan 2026". */
    label: string;
    /** `YYYY-MM` — ixtiyoriy. */
    month?: string;
};

export type DashboardMetal = {
    /** Material belgisi, masalan "Mo". Nomi/rangi frontend tomonda aniqlanadi. */
    material: string | null;
    value: number | null;
    pct: number | null;
    delta: number | null;
    plan: number | null;
    /** Oylik dinamika — `months` bilan bir xil uzunlikda. */
    dyn: (number | null)[] | null;
};

export type DashboardPlant = {
    name: string;
    /** Oylik hajm — `months` bilan bir xil uzunlikda. */
    monthly: (number | null)[] | null;
};

export type DashboardData = {
    months: DashboardMonth[] | null;
    total: number | null;
    monthly: (number | null)[] | null;
    avgDaily: (number | null)[] | null;
    metals: DashboardMetal[] | null;
    plants: DashboardPlant[] | null;
};

/**
 * Bu API'dagi qolgan endpointlar javobni `{success, data}` konvertiga o'raydi.
 * `/dashboard` konvertsiz ham kelishi mumkin — ikkala shakl ham qabul qilinadi.
 */
const unwrapDashboard = (body: unknown): DashboardData => {
    if (body && typeof body === "object" && "success" in body && "data" in body) {
        return (body as { data: DashboardData }).data;
    }
    return body as DashboardData;
};

export const getDashboard = async (
    from: string,
    to: string,
    plant?: string
): Promise<DashboardData> => {
    const response = await productionClient.get("/dashboard", {
        params: { from, to, plant },
    });
    return unwrapDashboard(response.data);
};

/** Berilgan sana oralig'idagi barcha detal yozuvlarni sahifalab yig'ib beradi. */
export const getAllNarastayka = async (from: string, to: string): Promise<NarastaykaRow[]> => {
    const limit = 500;
    let page = 1;
    let all: NarastaykaRow[] = [];

    while (true) {
        const res = await getNarastaykaPage(from, to, page, limit);
        all = all.concat(res.data);
        if (res.data.length < limit || all.length >= res.total) break;
        page += 1;
    }

    return all;
};

export default productionClient;
