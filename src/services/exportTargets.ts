import axios from "axios";

/**
 * tmk.bgs.uz/api/export-targets uchun alohida axios instance.
 * Token localStorage'da "Bearer ..." bilan birga saqlanadi (LoginPage.tsx).
 */
const exportTargetsClient = axios.create({
    baseURL: "https://tmk.bgs.uz/api/export-targets",
});

exportTargetsClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /export-targets/dashboard

   Eksportning maqsadli ko'rsatkichlari (2024-2030) — bitta so'rovda hammasi,
   parametrsiz (EXPORT_TARGETS_API.md).

   Eslatmalar (hujjatdan):
     • `values[].volume` mahsulotlar bo'ylab QO'SHILMAYDI — o'lchov birligi
       mahsulotga bog'liq (products[].unit). Faqat valueThousandUsd yig'iladi.
     • `null` — 0 EMAS: ma'lumot yo'qligini bildiradi.
     • 2026 yil ikki marta uchraydi: "2026-actual" (Yanvar-Avgust, QISMAN yil)
       va "2026-forecast" (to'liq yil prognozi) — periodKey bilan ajratiladi,
       bittasiga yig'ib bo'lmaydi.
     • `periods[].totalValueThousandUsd` (hisoblangan) va
       `sourceTotals[].valueThousandUsd` (manbadagi "ЖАМИ") ataylab ikkitasi.
   ══════════════════════════════════════════════════════════════════════════ */

export type ExportTargetPeriodKind = "actual" | "forecast";

export type ExportTargetPeriod = {
    periodKey: string;
    year: number;
    kind: ExportTargetPeriodKind;
    label: string;
    /** Qisman yil belgisi, masalan "Январь-Август". To'liq yil bo'lsa `null`. */
    note: string | null;
    sortOrder: number;
    totalValueThousandUsd: number | null;
};

export type ExportTargetProduct = {
    rowNo: number;
    name: string;
    unit: string | null;
    sortOrder: number;
};

export type ExportTargetValue = {
    rowNo: number;
    periodKey: string;
    volume: number | null;
    valueThousandUsd: number | null;
};

export type ExportTargetSourceTotal = {
    periodKey: string;
    valueThousandUsd: number | null;
};

export type ExportTargetGeography = {
    year: number;
    /** Ruscha nomlar, manbadagi tartibda. */
    countries: string[];
    count: number;
};

export type ExportTargetsDashboardData = {
    title: string;
    periods: ExportTargetPeriod[];
    products: ExportTargetProduct[];
    values: ExportTargetValue[];
    sourceTotals: ExportTargetSourceTotal[];
    geography: ExportTargetGeography[];
    meta: { source: string } | null;
};

/** Javob doim `{success, data}`; konvertsiz shakl ham qabul qilinadi. */
const unwrap = <T,>(body: unknown): T => {
    if (body && typeof body === "object" && "success" in body && "data" in body) {
        return (body as { data: T }).data;
    }
    return body as T;
};

export const getExportTargetsDashboard = async (): Promise<ExportTargetsDashboardData> => {
    const response = await exportTargetsClient.get("/dashboard");
    return unwrap<ExportTargetsDashboardData>(response.data);
};

export default exportTargetsClient;
