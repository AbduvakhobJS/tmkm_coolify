import axios from "axios";

/* ══════════════════════════════════════════════════════════════════════════
   YURIDIK BOSHQARMA — `GET /legal-affairs/dashboard`
   (hujjat: LEGAL_AFFAIRS_API.md)

   Asosiy qoidalar:
     • `null` — «manbada ko'rsatilmagan» (manbadagi «-» ham `null`).
     • `rulingDate` (ISO) va `rulingDateText` (xom matn) hech qachon birga
       to'lmaydi — qaysi biri bor bo'lsa o'shani ko'rsatish kerak.
     • `reviewedDate` — kun emas, OY (`reviewedDateIsMonthOnly`); yil
       ketma-ketlikdan chiqsa `reviewedDateYearSuspect` (manbada 2001).
     • `claims.amountRaw` — sarlavha «млн сўм», qiymat aslida so'm
       (`amountUnitSuspect`): birlikni ishonchli deb yozmaslik kerak.
   ══════════════════════════════════════════════════════════════════════════ */

const client = axios.create({ baseURL: "https://tmk.bgs.uz/api/legal-affairs" });

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    return config;
});

export interface LegalExtraCell {
    excelRow: number;
    column: string;
    value: string;
}

export interface LegalCourtCase {
    id: number;
    key: string;
    ordinal: number | null;
    sortOrder: number;
    subject: string;
    rulingDate: string | null;
    rulingDateText: string | null;
    courtName: string | null;
    caseNumber: string | null;
    lawyer: string | null;
    hearingDate: string | null;
    hearingDateText: string | null;
    result: string | null;
    appealSummary: string | null;
    appealHearingText: string | null;
    appealPostponedText: string | null;
    note: string | null;
    extras: LegalExtraCell[];
}

export interface LegalClaim {
    id: number;
    key: string;
    ordinal: number | null;
    subject: string;
    respondent: string | null;
    amountRaw: number | null;
    amountText: string | null;
    amountUnitLabel: string;
    amountUnitSuspect: boolean;
    sentDate: string | null;
    sentDateText: string | null;
    deadlineText: string | null;
    responseText: string | null;
    note: string | null;
}

export interface LegalContractReview {
    id: number;
    key: string;
    ordinal: number | null;
    contractName: string;
    counterparty: string | null;
    receivedDate: string | null;
    receivedDateText: string | null;
    reviewedDate: string | null;
    reviewedDateText: string | null;
    reviewedDateIsMonthOnly: boolean;
    reviewedDateYearSuspect: boolean;
    conclusion: string | null;
}

export interface LegalSectionSummary {
    section: "courtCases" | "claims" | "contractReviews";
    title: string;
    recordCount: number;
    physicalRowCount: number;
    columnCount: number;
    filledColumnCount: number;
    emptyColumnCount: number;
}

export interface LegalAffairsDashboard {
    totals: {
        courtCases: number;
        claims: number;
        contractReviews: number;
        records: number;
        physicalRows: number;
        claimsAmountRawSum: number | null;
        claimsAmountUnitLabel: string;
        claimsAmountUnitSuspect: boolean;
    };
    sections: LegalSectionSummary[];
    byLawyer: { lawyer: string; cases: number }[];
    byCourt: { court: string; cases: number }[];
    dataQuality: { warnings: string[]; [key: string]: any };
    meta: { source: string; importedAt: string | null };
    courtCases: LegalCourtCase[];
    claims: LegalClaim[];
    contractReviews: LegalContractReview[];
}

export const getLegalAffairsDashboard = async (): Promise<LegalAffairsDashboard> => {
    const response = await client.get("/dashboard");
    return response.data?.data ?? response.data;
};
