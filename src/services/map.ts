import axios from "axios";

/**
 * tmk.bgs.uz faqat Authorization headerini CORS orqali ruxsat etadi (situationClient bilan bir xil sabab) —
 * umumiy apiClient qo'shadigan Content-Type/Accept/Accept-Encoding headerlari CORS preflightni buzib,
 * so'rovni butunlay bloklaydi. Shu sabab bu API uchun alohida, minimal headerli axios instance ishlatiladi.
 */
const factoryClient = axios.create({
    baseURL: "https://tmk.bgs.uz/api",
});

factoryClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

export interface FactoryMarkerParams {
    lang?: string;
    project_category?: string;
    object_type?: string;
    factory_param_id?: number;
}

export const getTypeObject = async () => {
    const response = await factoryClient.get("/factory/object-types", {
        params: { lang: "ru" },
    });
    return response.data;
}

export const getFactoryMarkers = async (params: FactoryMarkerParams = {}) => {
    const response = await factoryClient.get("/factory/marker", {
        params: { lang: "ru", ...params },
    });
    return response.data;
}

export const getFactoryDetail = async (id: number | string, lang: string = "ru") => {
    const response = await factoryClient.get(`/factory/${id}`, {
        params: { lang },
    });
    return response.data;
}
