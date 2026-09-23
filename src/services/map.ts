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

/* ── /map/objects — umumiy xarita markerlari APIsi ──────────────────────
   MAP_API (2).md hujjatiga ko'ra: HAMMASI bitta `items[]` massivida, har biri
   `type: 'factory' | 'geology' | 'invest'` diskriminatori bilan. Koordinata
   faqat `factory` da o'z (`coordsSource: 'own'`); geology/invest uni bog'langan
   zavoddan MEROS qiladi (`coordsSource: 'linked'`, taxminiy joylashuv) yoki
   umuman yo'q (`coordsSource: null`, `lat`/`lon` — `null`, xaritaga tushmaydi). */
export type MapItemType = 'factory' | 'geology' | 'invest';

export interface MapLinkRef {
    type: MapItemType;
    id: string;
    name: string | null;
    confidence: 'exact' | 'partial';
}

// Har bir `type` uchun `detail` tarkibi boshqacha — MAP_API (2).md'dagi
// hujjatlashtirilgan maydonlar, qolgani `[key: string]: any` orqali o'qiladi.
export interface MapFactoryDetail {
    factoryId?: number;
    objectType?: string | null;
    importance?: string | null;
    importanceRaw?: string | null;
    workPercent?: number | null;
    enterpriseName?: string | null;
    projectGoal?: string | null;
    /** Bazadagi xom `location` ustuni, `[lat, lon]` tartibida — koordinata sifatida ISHLATILMAYDI. */
    location?: string | null;
    images?: string[];
    [key: string]: any;
}

export interface MapGeologyDetail {
    projectNo?: number;
    fullName?: string | null;
    groupName?: string | null;
    groupNo?: number | null;
    category?: string | null;
    direction?: string | null;
    district?: string | null;
    mineral?: string | null;
    metals?: string | null;
    oreReserve?: string | null;
    metalReserve?: string | null;
    funding?: string | null;
    endYear?: number | null;
    partner?: string | null;
    plan2026?: string | null;
    done2026?: string | null;
    result?: string | null;
    note?: string | null;
    slideNo?: number | null;
    [key: string]: any;
}

export interface MapInvestDetail {
    key?: string | null;
    projectCode?: string | null;
    enterprise?: string | null;
    goal?: string | null;
    kind?: string | null;
    priority?: number | null;
    capacity?: string | null;
    durationMonths?: number | null;
    startDateText?: string | null;
    endDateText?: string | null;
    disbursedMlnUsd?: number | null;
    /** Son/matn ikki qavatli: son bo'lmasa mos *Text maydonida "hali hisoblanmagan" kabi aniq izoh bo'ladi. */
    paybackYears?: number | null;
    paybackText?: string | null;
    irrShare?: number | null;
    irrText?: string | null;
    npvMlnUsd?: number | null;
    npvText?: string | null;
    jobs?: number | null;
    product?: string | null;
    annualOutputMlnUsd?: number | null;
    annualOutputQty?: number | null;
    annualOutputQtyText?: string | null;
    fsState?: string | null;
    buildStartText?: string | null;
    commissioningText?: string | null;
    docState?: string | null;
    areaHa?: number | null;
    equipment?: string | null;
    equipmentPayment?: string | null;
    objectKind?: string | null;
    proposalsOpen?: string | null;
    costBreakdown?: string | null;
    funding?: string | null;
    risks?: string | null;
    note?: string | null;
    [key: string]: any;
}

export interface MapItem {
    id: string;
    type: MapItemType;
    name: string | null;
    region: string | null;
    regionGroup: string | null;
    lat: number | null;
    lon: number | null;
    coordsSource: 'own' | 'linked' | null;
    linkedFrom: string | null;
    /** Kimyoviy belgilar — faqat `factory` da to'ladi, `geology`/`invest` da doim `[]`. */
    elements: string[];
    status: string | null;
    /** ULUSH (0…1), foiz emas — `factory`da `work_persent/100`, `invest`da manbada allaqachon ulush, `geology`da doim `null`. */
    progress: number | null;
    costMlnUsd: number | null;
    markerIcon: string | null;
    links: MapLinkRef[];
    detail: MapFactoryDetail | MapGeologyDetail | MapInvestDetail;
    [key: string]: any;
}

export interface MapObjectsData {
    items: MapItem[];
    summary: Record<string, any>;
    dataQuality: Record<string, any>;
    meta: { lang: string; generatedAt: string; counts: { factory: number; geology: number; invest: number }; matchStrategy: string };
}

export const getMapObjects = async (lang: string = "uz"): Promise<MapObjectsData> => {
    const response = await factoryClient.get("/map/objects", {
        params: { lang },
    });
    return response.data?.data ?? response.data;
}

/* ── /geology-projects/:id — geologiya loyihasining to'liq kartochkasi ───
   `/map/objects` dagi `items[]` faqat qisqa konvert beradi (`detail` da ham
   asosiy maydonlar bor xolos); to'liq "pasport" ma'lumoti (litsenziya, jamoa,
   rejalar va h.k.) shu alohida endpointdan olinadi. Javob shakli hali to'liq
   hujjatlashtirilmagan — shuning uchun keng (`Record<string, any>`) tip bilan
   qaytariladi, UI qatlami mavjud maydonlarni moslab o'qiydi. */
export const getGeologyProjectDetail = async (id: number | string, lang: string = "uz"): Promise<Record<string, any>> => {
    const response = await factoryClient.get(`/geology-projects/${id}`, {
        params: { lang },
    });
    return response.data?.data ?? response.data;
}

/* ── /invest-projects/:id — investitsiya loyihasining to'liq kartochkasi ──
   `/geology-projects/:id` bilan bir xil mantiq: `/map/objects`dagi qisqa
   `detail` darhol ko'rsatiladi, bu endpoint javobi kelgach ustiga qo'shiladi.
   Javob shakli hali to'liq hujjatlashtirilmagan. */
export const getInvestProjectDetail = async (id: number | string, lang: string = "uz"): Promise<Record<string, any>> => {
    const response = await factoryClient.get(`/invest-projects/${id}`, {
        params: { lang },
    });
    return response.data?.data ?? response.data;
}

/* ── /project-registry/:id — loyihalar reestri (Excel'dan import qilingan 144 ta
   loyiha) bo'yicha to'liq kartochka. `/map/objects`dagi invest markerlarining
   `detail.registryId` shu endpointning `id`siga mos keladi. Qoidalar:
   • `progressPercent` — FOIZ (0…100), `irrPercent` — ham foiz;
   • `*Text` juftlari — son YOKI izohli matn («baho, aniqlashtirilishi kerak»);
   • `fin*MlnUsd` — moliyalashtirish manbalari, yig'indisi `financeSourcesSumMlnUsd`. */
export interface ProjectRegistryDetail {
    id: number;
    key: string;
    clusterNo: string | null;
    clusterName: string | null;
    directionNo: string | null;
    directionName: string | null;
    responsible: string | null;
    name: string;
    region: string | null;
    coordsPlace: string | null;
    goal: string | null;
    kind: string | null;
    deadlineText: string | null;
    progressPercent: number | null;
    state: string | null;
    priority: number | null;
    processingCapacity: string | null;
    capacity: string | null;
    oreReserveText: string | null;
    durationMonths: number | null;
    durationText: string | null;
    startDateText: string | null;
    endDateText: string | null;
    totalCostMlnUsd: number | null;
    finTmkMlnUsd: number | null;
    finUzttjMlnUsd: number | null;
    finCreditMlnUsd: number | null;
    finPartnerMlnUsd: number | null;
    finOfftakeMlnUsd: number | null;
    finEurobondMlnUsd: number | null;
    financeSourcesSumMlnUsd: number | null;
    financeGapMlnUsd: number | null;
    disbursedMlnUsd: number | null;
    paybackYears: number | null;
    paybackText: string | null;
    irrPercent: number | null;
    irrText: string | null;
    npvMlnUsd: number | null;
    npvText: string | null;
    jobs: number | null;
    product: string | null;
    annualOutputMlnUsd: number | null;
    annualOutputText: string | null;
    annualOutputQty: number | null;
    annualOutputQtyText: string | null;
    fsState: string | null;
    designer: string | null;
    contractor: string | null;
    epcContractMlnUsd: number | null;
    epcContractText: string | null;
    buildStartText: string | null;
    assemblyText: string | null;
    commissioningText: string | null;
    docState: string | null;
    areaHa: number | null;
    areaText: string | null;
    equipment: string | null;
    objectKind: string | null;
    proposalsOpen: string | null;
    costBreakdown: string | null;
    powerGrid: string | null;
    powerDemandText: string | null;
    gasGrid: string | null;
    gasDemandText: string | null;
    drinkWaterGrid: string | null;
    techWaterGrid: string | null;
    railway: string | null;
    railwayDistanceKm: number | null;
    railwayDistanceText: string | null;
    road: string | null;
    settlementDistanceKm: number | null;
    settlementDistanceText: string | null;
    expectedResults: string | null;
    partnerCompany: string | null;
    importedAt: string | null;
    [key: string]: any;
}

export const getProjectRegistryDetail = async (id: number | string, lang: string = "uz"): Promise<ProjectRegistryDetail> => {
    const response = await factoryClient.get(`/project-registry/${id}`, {
        params: { lang },
    });
    return response.data?.data ?? response.data;
}

/* ── /invest-projects?type= — MINE / METALL / MARKET investitsiya loyihalari ro'yxati ──
   Backendning o'z nomlashi: `type` qiymatlari aynan "mine" | "metall" | "market"
   (METAL emas — "L" ikkita). Har biri hali qurilayotgan yoki reja bosqichidagi
   loyiha; maydonlar to'liq ro'yxati quyida — javob hujjatlashtirilmagan, shu
   sabab kengroq tip (`[key: string]: any`) bilan qaytariladi. */
export type InvestProjectType = 'mine' | 'metall' | 'market';

export interface InvestProjectListItem {
    id: number;
    key: string;
    type: InvestProjectType;
    projectCode: string | null;
    enterprise: string | null;
    name: string;
    region: string | null;
    goal: string | null;
    kind: string | null;
    progressShare: number | null;
    state: string | null;
    priority: number | null;
    capacity: string | null;
    durationMonths: number | null;
    startDateText: string | null;
    endDateText: string | null;
    totalCostMlnUsd: number | null;
    disbursedMlnUsd: number | null;
    jobs: number | null;
    product: string | null;
    commissioningText: string | null;
    fsState: string | null;
    /* INVEST_PROJECTS_API.md dagi qolgan maydonlar. Muhim qoidalar:
       • `progressShare`, `irrShare` — ULUSH (0…1), foiz emas;
       • `*Text` juftlari — son YOKI matn («TIA da aniqlanadi»), birga to'lmaydi;
       • `annualOutputQty` — aralash o'lchov (tonna/dona), hech qachon yig'ilmaydi. */
    sortOrder?: number | null;
    lat?: number | null;
    lon?: number | null;
    coordsAccuracy?: 'exact' | 'region' | null;
    paybackYears?: number | null;
    paybackText?: string | null;
    irrShare?: number | null;
    irrText?: string | null;
    npvMlnUsd?: number | null;
    npvText?: string | null;
    annualOutputMlnUsd?: number | null;
    annualOutputQty?: number | null;
    annualOutputQtyText?: string | null;
    buildStartText?: string | null;
    docState?: string | null;
    areaHa?: number | null;
    equipment?: string | null;
    objectKind?: string | null;
    funding?: string | null;
    risks?: string | null;
    [key: string]: any;
}

/** Parametrsiz — reestrdagi BARCHA loyihalar (hujjat: filtr berilmasa hammasi). */
export const getAllInvestProjects = async (lang: string = "uz"): Promise<InvestProjectListItem[]> => {
    const response = await factoryClient.get("/invest-projects", {
        params: { lang },
    });
    return response.data?.data ?? response.data ?? [];
}

export const getInvestProjectsList = async (type: InvestProjectType, lang: string = "uz"): Promise<InvestProjectListItem[]> => {
    const response = await factoryClient.get("/invest-projects", {
        params: { type, lang },
    });
    return response.data?.data ?? response.data ?? [];
}
