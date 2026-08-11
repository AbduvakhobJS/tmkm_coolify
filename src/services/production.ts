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
