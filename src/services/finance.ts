import axios from "axios";

/**
 * tmk.bgs.uz/api/finance-report uchun alohida axios instance.
 * Token localStorage'da "Bearer ..." bilan birga saqlanadi (LoginPage.tsx).
 */
const financeClient = axios.create({
    baseURL: "https://tmk.bgs.uz/api/finance-report",
});

financeClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /finance-report/dashboard

   "Moliyaviy vaziyat markazi" panelining BARCHA elementlari shu bitta
   endpointdan quriladi (FINANCIAL_DASHBOARD_API.md).

   Hujjatdagi muhim shartlar:
     • SO'ROV PARAMETRI YO'Q — `from`/`to` qabul qilinmaydi. Har chaqiruvda
       bazadagi bir xil oylik to'plam qaytadi, shuning uchun bu bo'lim
       boshqa bo'limlardagi davr tanlagichiga BOG'LANMAYDI (2- va 4-bo'lim);
     • `months[]` da YIL YO'Q — faqat oy nomlari. Yilni o'ylab qo'shmaslik
       kerak (4-bo'lim);
     • `rows[]` doim bir xil tartibda kelsa ham, frontend `key` bo'yicha
       qidiradi — tartibga tayanmaydi (3.2-bo'lim);
     • oylararo o'zgarish (%) va tarkib ulushlari (%) TAYYOR KELMAYDI —
       ikkalasini ham frontend hisoblaydi (5- va 6-bo'limlar).
   ══════════════════════════════════════════════════════════════════════════ */

/** Hujjatning 3.1-bo'limidagi 29 ta barqaror kalit. */
export type FinanceRowKey =
    | 'revenue' | 'profit' | 'margin' | 'netCash'
    | 'assetsTotal' | 'assetsCurrent' | 'assetsNonCurrent'
    | 'liabTotal' | 'liabCurrent' | 'liabNonCurrent'
    | 'equityAndLiab' | 'equityTotal'
    | 'buildInProgress' | 'subsidiaryInvest' | 'fixedAssets' | 'otherNonCurrent'
    | 'receivables' | 'inventories' | 'cash' | 'otherCurrent'
    | 'charterCapital' | 'retainedEarnings' | 'otherReserves'
    | 'currentRatio' | 'debtToEquity'
    | 'cfOperating' | 'cfInvesting' | 'cfFinancing' | 'cashEquivalents';

export type FinanceRow = {
    /** Barqaror kalit — ekran elementiga shu orqali bog'lanadi. */
    key: FinanceRowKey | string;
    /** Backend bergan tayyor nom (kirill o'zbekcha). */
    label: string;
    /** `months[]` bilan bir xil uzunlikdagi qiymatlar. */
    values: (number | null)[] | null;
};

export type FinanceDashboardData = {
    /** Oy nomlari, kirill o'zbekcha. Yil ko'rsatilmaydi. */
    months: string[] | null;
    rows: FinanceRow[] | null;
};

/** Hujjat bo'yicha javob doim `{success, data}`; konvertsiz shakl ham qabul qilinadi. */
const unwrap = (body: unknown): FinanceDashboardData => {
    if (body && typeof body === "object" && "success" in body && "data" in body) {
        return (body as { data: FinanceDashboardData }).data;
    }
    return body as FinanceDashboardData;
};

export const getFinanceDashboard = async (): Promise<FinanceDashboardData> => {
    const response = await financeClient.get("/dashboard");
    return unwrap(response.data);
};

export default financeClient;
