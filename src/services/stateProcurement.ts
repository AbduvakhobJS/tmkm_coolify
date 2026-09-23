import axios from "axios";

/* ══════════════════════════════════════════════════════════════════════════
   DAVLAT XARIDLARI — `GET /state-procurement/dashboard`
   (hujjat: STATE_PROCUREMENT_API.md)

   Asosiy qoidalar:
     • `null` ≠ 0 — `null` «manbada ko'rsatilmagan», `0` esa haqiqiy nol.
     • `facts` da yig'indi qatori YO'Q — u alohida `totalRow` da (etalon).
     • `quartersCount/quartersAmount` — faqat chorak slotlari; `total`
       slotlar choraklarning yig'indisi, qo'shilsa ikki barobar chiqadi.
     • `2025-TOTAL` summa sarlavhasi «млрд» deydi, aslida млн (`amountUnitSuspect`).
   ══════════════════════════════════════════════════════════════════════════ */

const client = axios.create({ baseURL: "https://tmk.bgs.uz/api/state-procurement" });

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return config;
});

export interface ProcurementPeriod {
    key: string;
    year: number;
    kind: "quarter" | "total";
    quarter: number | null;
    label: string;
    quarterLabel: string | null;
    amountUnitLabel: string;
    amountUnitSuspect: boolean;
    hasApprovedTmbColumn: boolean;
}

export interface ProcurementType {
    key: string;
    no: number | null;
    name: string;
    nameCyrillic: string;
}

export interface ProcurementFact {
    id: number;
    key: string;
    isTotal: boolean;
    purchaseTypeKey: string;
    purchaseTypeName: string;
    periodKey: string;
    periodYear: number;
    periodKind: "quarter" | "total";
    periodQuarter: number | null;
    count: number | null;
    countRawText: string | null;
    countWasText: boolean;
    contractAmount: number | null;
    amountUnitSuspect: boolean;
    approvedTmb: number | null;
    hasApprovedTmbColumn: boolean;
}

export interface ProcurementPeriodStat {
    periodKey: string;
    computedCount: number | null;
    computedAmount: number | null;
    declaredCount: number | null;
    declaredAmount: number | null;
    matches: boolean;
    typesWithCount: number;
    typesWithAmount: number;
}

export interface ProcurementTypeStat {
    purchaseTypeKey: string;
    purchaseTypeName: string;
    purchaseTypeNo: number | null;
    quartersCount: number | null;
    quartersAmount: number | null;
    declared2025Count: number | null;
    declared2025Amount: number | null;
    declared2026Count: number | null;
    declared2026Amount: number | null;
}

export interface ProcurementTotalCheck {
    periodKey: string;
    measure: "count" | "amount";
    column: string;
    computed: number | null;
    declared: number | null;
    diff: number | null;
    matches: boolean;
    reason: string | null;
}

export interface ProcurementOutlier {
    purchaseTypeKey: string;
    purchaseTypeName: string;
    periodKey: string;
    value: number;
    medianOfOthers: number;
    ratio: number;
    shareOfPeriod: number;
    reason: string;
}

export interface ProcurementDashboard {
    totals: {
        facts: number;
        totalFacts: number;
        purchaseTypes: number;
        periods: number;
        quartersCount: number | null;
        quartersAmount: number | null;
        amountUnitLabel: string;
    };
    periods: ProcurementPeriod[];
    purchaseTypes: ProcurementType[];
    byPeriod: ProcurementPeriodStat[];
    byType: ProcurementTypeStat[];
    totalRow: ProcurementFact[];
    facts: ProcurementFact[];
    dataQuality: {
        totalMismatches: ProcurementTotalCheck[];
        totalSlotMismatches: any[];
        emptyColumns: any[];
        unitConflicts: any[];
        textCountCells: any[];
        amountOutliers: ProcurementOutlier[];
        warnings: string[];
        [key: string]: any;
    };
    meta: { source: string; sheet: string; importedAt: string | null };
}

export const getProcurementDashboard = async (): Promise<ProcurementDashboard> => {
    const response = await client.get("/dashboard");
    return response.data?.data ?? response.data;
};
