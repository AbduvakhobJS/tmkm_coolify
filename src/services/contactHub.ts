import axios from "axios";

/**
 * situation.uzkmt.uz uchun alohida, minimal headerli axios instance —
 * umumiy apiClient (Api-Partner-Code/Version headerlari bilan) CORS preflightni buzadi.
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

export const getContactHubSummary = async () => {
    const response = await situationClient.get("/api/summary");
    return response.data;
};
