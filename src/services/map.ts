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
