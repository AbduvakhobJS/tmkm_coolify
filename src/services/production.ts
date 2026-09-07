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

/* ══════════════════════════════════════════════════════════════════════════
   GET /production-report/dashboard

   "Texnologik metallar ishlab chiqarish" dashboardining BARCHA elementlari
   shu bitta endpointdan quriladi (METAL_PRODUCTION_DASHBOARD_API.md, 5-bo'lim).

   Eslatmalar (hujjatdan):
     • javob doim `{ success, data }` konvertida keladi;
     • `delta`/`totalDelta` — oldingi davr bilan taqqoslash. `from`/`to`
       berilmasa yoki oldingi davr uchun ma'lumot bo'lmasa `null` qaytadi
       (bu — normal holat, xato emas);
     • `metals[].material` `null` bo'lishi mumkin — metall biriktirilmagan
       guruh. Backend unga NOM BERMAYDI, ko'rsatiladigan matnni frontend
       tanlaydi;
     • `metals[]` hajm bo'yicha kamayish tartibida keladi.
   ══════════════════════════════════════════════════════════════════════════ */

export type DashboardMonth = {
    /** `YYYY-MM`. */
    key: string;
    /** Ekranda ko'rsatiladigan yorliq, masalan "May 2026". */
    label: string;
};

export type DashboardMetal = {
    /** Metall belgisi ("Mo", "W", ...). `null` — metall biriktirilmagan guruh. */
    material: string | null;
    value: number | null;
    plan: number | null;
    /** Umumiy hajmdagi ulush, % — donut uchun tayyor qiymat. */
    pct: number | null;
    /** Reja bajarilishi, % (`fakt/reja×100`) — davrlar taqqoslashi EMAS. */
    percent: number | null;
    /** Oldingi davrga nisbatan o'zgarish, %. */
    delta: number | null;
    /** Oldingi davrdagi hajm (xom son). */
    previous: number | null;
    /** Oylik dinamika — `months` bilan bir xil uzunlikda. */
    dyn: (number | null)[] | null;
    /** Oylik reja. */
    planDyn: (number | null)[] | null;
};

export type DashboardPlant = {
    name: string;
    /** Oylik hajm — `months` bilan bir xil uzunlikda. */
    monthly: (number | null)[] | null;
    /** Butun davr bo'yicha jami hajm. */
    value: number | null;
};

export type DashboardData = {
    period: {
        from: string | null;
        to: string | null;
        previous: { from: string; to: string } | null;
    } | null;
    /** Javobdagi barcha sonlar shu o'lchov birligida (standart `тн`). */
    unit: string | null;
    months: DashboardMonth[] | null;
    total: number | null;
    totalPlan: number | null;
    /** Reja bajarilishi, %. Reja 0 bo'lsa `null`. */
    totalPercent: number | null;
    /** Oldingi davrga nisbatan o'zgarish, %. */
    totalDelta: number | null;
    previousTotal: number | null;
    /** Metall biriktirilmagan mahsulotlarning umumiy hajmdagi ulushi, %. */
    unknownShare: number | null;
    metals: DashboardMetal[] | null;
    monthly: (number | null)[] | null;
    monthlyPlan: (number | null)[] | null;
    avgDaily: (number | null)[] | null;
    /** Har oyda ma'lumot mavjud bo'lgan kunlar soni. */
    days: (number | null)[] | null;
    plants: DashboardPlant[] | null;
};

/** So'rov parametrlari — barchasi ixtiyoriy (hujjat, 2.1-bo'lim). */
export type DashboardParams = {
    /** `YYYY-MM-DD`. Format noto'g'ri bo'lsa backend 500 qaytarishi mumkin. */
    from?: string;
    to?: string;
    /** Standart `тн` — dashboard tonna uchun mo'ljallangan. */
    unit?: string;
    plant?: string;
    workshop?: string;
    /** Bitta metall bo'yicha filtr — umumiy ko'rinish uchun BERILMAYDI. */
    material?: string;
    category?: string;
    process?: string;
    /** Xomashyo qazish hajmini chiqarib tashlaydi (standart `true`). */
    excludeDobycha?: boolean;
};

/** Hujjat bo'yicha javob doim `{success, data}`; konvertsiz shakl ham qabul qilinadi. */
const unwrapDashboard = (body: unknown): DashboardData => {
    if (body && typeof body === "object" && "success" in body && "data" in body) {
        return (body as { data: DashboardData }).data;
    }
    return body as DashboardData;
};

export const getDashboard = async (params: DashboardParams = {}): Promise<DashboardData> => {
    const { unit = "тн", excludeDobycha = true, ...rest } = params;
    /* Bo'sh qiymatlar yuborilmaydi — backend ularni filtr deb qabul qilmasin. */
    const query: Record<string, string | boolean> = { unit, excludeDobycha };
    for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined && v !== null && v !== "") query[k] = v as string;
    }

    const response = await productionClient.get("/dashboard", { params: query });
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
