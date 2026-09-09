import axios from "axios";

/* ══════════════════════════════════════════════════════════════════════════
   «Геология лойиҳалари» дашборди — GEOLOGY_DASHBOARD_API.md ҳужжатига мос.

   Иккита эндпойнт бор, параметрсиз — ҳар сафар 46 та лойиҳанинг ҳаммаси
   қайтади (фильтрлаш фронтендда). `dashboard` бир сўровда лойиҳалар, иш
   режаси, 2026 йил иш ҳажмлари ва серверда ҳисобланган жамланмани беради.

   Маълумот СТАТИК (ҳужжат, §8.6): 14.04.2026 ҳолати, автомат янгиланиш йўқ.
   ══════════════════════════════════════════════════════════════════════════ */

const BASE = process.env.REACT_APP_GEOLOGY_BASE ?? "https://tmk.bgs.uz/api";

const geologyClient = axios.create({ baseURL: BASE });

geologyClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
});

/* ── Турлар — ҳужжат §3.2 / §3.4 га мос ── */

export type GeologyWork = {
    id: number;
    projectNo: number;
    groupName: string;
    groupNo: number;
    shortName: string;
    work: string;
    deadlineText: string;
    year: number;
    month: number;
    status: string;
    sortOrder: number;
};

export type GeologyVolume = {
    id: number;
    projectNo: number;
    groupName: string;
    groupNo: number;
    shortName: string;
    drillPlan: number | null;
    drillDone: number | null;
    samplePlan: number | null;
    sampleDone: number | null;
    trenchPlan: number | null;
    trenchDone: number | null;
    labPlan: number | null;
    budgetMlnUsd2026: number | null;
    drillPercent: number | null;
    samplePercent: number | null;
    trenchPercent: number | null;
};

export type GeologyProject = {
    id: number;
    projectNo: number;
    groupName: string;
    groupNo: number;
    name: string;
    shortName: string;
    category: string;
    direction: string;
    region: string | null;
    district: string | null;
    mineral: string;
    metals: string | null;
    oreReserve: string | null;
    metalReserve: string | null;
    costMlnUsd: number | null;
    funding: string | null;
    endYear: number | null;
    partner: string | null;
    plan2026: string | null;
    done2026: string | null;
    result: string | null;
    note: string | null;
    slideNo: number | null;
    works: GeologyWork[];
    volume: GeologyVolume | null;
};

export type GeologyCountKey = { key: string; count: number };

export type GeologySummary = {
    totalProjects: number;
    byGroup: GeologyCountKey[];
    byCategory: GeologyCountKey[];
    byDirection: GeologyCountKey[];
    byRegion: { key: string | null; count: number }[];
    byEndYear: { year: number | null; count: number }[];
    cost: { totalMlnUsd: number; projectsWithCost: number; projectsWithoutCost: number };
    works: {
        total: number;
        projectsWithWorks: number;
        byStatus: GeologyCountKey[];
        byYear: { year: number; count: number }[];
    };
    volumes2026: {
        projectsWithVolumes: number;
        drillPlan: number; drillDone: number; drillDoneReported: number;
        samplePlan: number; sampleDone: number; sampleDoneReported: number;
        trenchPlan: number; trenchDone: number; trenchDoneReported: number;
        labPlan: number; budgetMlnUsd: number;
        drillPercent: number | null; samplePercent: number | null; trenchPercent: number | null;
    };
};

export type GeologyDashboardData = {
    projects: GeologyProject[];
    summary: GeologySummary;
    meta: { source: string; asOf: string };
};

const unwrap = <T,>(body: unknown): T => {
    if (body && typeof body === "object" && "success" in body && "data" in body) {
        return (body as { data: T }).data;
    }
    return body as T;
};

export const getGeologyDashboard = async (): Promise<GeologyDashboardData> => {
    const response = await geologyClient.get("/geology-projects/dashboard");
    return unwrap<GeologyDashboardData>(response.data);
};

export default geologyClient;
