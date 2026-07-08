import axios from "axios";

/**
 * situation.uzkmt.uz faqat Authorization headerini CORS orqali ruxsat etadi —
 * shu sabab umumiy apiClient (Api-Partner-Code/Version headerlari bilan) emas,
 * shu API uchun alohida, minimal headerli axios instance ishlatiladi.
 */
const situationClient = axios.create({
    baseURL: "https://situation.uzkmt.uz",
});

situationClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

export const getSituationSummary = async () => {
    const response = await situationClient.get("/api/v1/summary");
    return response.data;
};
