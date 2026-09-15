import axios from "axios";
import productionClient from "./production";

/* ══════════════════════════════════════════════════════════════════════════
   Energetika va resurslar — elektr energiya, quyosh stansiyalari, vodorod,
   gaz (ENERGY_RESOURCES_API.md).

   Uchta turli backend modulidan o'qiladi, har birining javob konverti
   BOSHQACHA (hujjat, 1.3-bo'lim):
     • production-report (elektr, vodorod) — xato HTTP statusida keladi;
     • gas-integration / fusion-solar — xato ham HTTP 200 bilan keladi,
       `success` va `data !== null` ikkalasi ham tekshirilishi shart.

   Sonlar ham har xil (1.4-bo'lim): production-report `number` qaytaradi,
   gas-integration/fusion-solar esa Postgres numeric/decimal/bigint bo'lgani
   uchun `string` qaytaradi — shu sabab `num()` yordamchisi bilan aylantiriladi
   va `null` alohida saqlanadi (0 ga aylantirilmaydi).

   ⚠ Gazning ikkita mustaqil manbasi bor (hisoblagich va ishlab chiqarish
   hisoboti) va ular bir xil son bermaydi. Bu ekranda faqat hisoblagich
   (`gas-integration/day-logs`) ishlatiladi — svodkadagi qabul qilingan
   amaliyot bilan bir xil (ikkalasini "jami gaz sarfi" sifatida qo'shmaslik).
   ══════════════════════════════════════════════════════════════════════════ */

const authInterceptor = (config: any) => {
    const token = localStorage.getItem("tmk-token-bgs");
    if (token) {
        config.headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return config;
};

const gasClient = axios.create({ baseURL: "https://tmk.bgs.uz/api/gas-integration" });
gasClient.interceptors.request.use(authInterceptor);

const solarClient = axios.create({ baseURL: "https://tmk.bgs.uz/api/fusion-solar" });
solarClient.interceptors.request.use(authInterceptor);

/* ── Umumiy yordamchilar ── */

/** `production-report`: xato HTTP statusida keladi, `success` doim ishonchli. */
const unwrapReport = <T,>(body: unknown): T | null => {
    if (body && typeof body === "object" && (body as any).success === true && "data" in (body as any)) {
        return (body as { data: T }).data;
    }
    return null;
};

/** `gas-integration` / `fusion-solar`: xato ham HTTP 200 bilan keladi. */
const unwrapLive = <T,>(body: unknown): T | null => {
    if (!body || typeof body !== "object") return null;
    const b = body as { success?: boolean; data?: T | null };
    if (b.success !== true) return null;
    if (b.data === null || b.data === undefined) return null;
    return b.data;
};

/** `null` → `null` (0 EMAS), matn → son. "ma'lumot yo'q" bilan "0" adashtirilmasin. */
export const num = (v: string | number | null | undefined): number | null => {
    if (v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
};

/* ── 2. Elektr energiya ── */

/** `period=monthly` da `month`, `daily` da `day` keladi. */
export type ElectricityTypeRow = { month?: string; day?: string; type: string; kwh: number | null };

export const getElectricityByType = async (from?: string, to?: string): Promise<ElectricityTypeRow[]> => {
    const response = await productionClient.get("/electricity", {
        params: { from, to, period: "monthly", groupBy: "type" },
    });
    return unwrapReport<ElectricityTypeRow[]>(response.data) ?? [];
};

export type ElectricityObjectRow = { month?: string; day?: string; object: string; kwh: number | null };

/** Sex/obyekt kesimida — `"Belgilanmagan"` bo'sh `type_object` uchun keladi (COALESCE). */
export const getElectricityByObject = async (from?: string, to?: string): Promise<ElectricityObjectRow[]> => {
    const response = await productionClient.get("/electricity", {
        params: { from, to, period: "monthly", groupBy: "object" },
    });
    return unwrapReport<ElectricityObjectRow[]>(response.data) ?? [];
};

/* ── 4. Vodorod ── */

export type HydrogenRow = { month?: string; day?: string; object?: string; value: number | null };

export const getHydrogenMonthly = async (from?: string, to?: string): Promise<HydrogenRow[]> => {
    const response = await productionClient.get("/hydrogen", {
        params: { from, to, kind: "hydrogen", period: "monthly" },
    });
    return unwrapReport<HydrogenRow[]>(response.data) ?? [];
};

/* ── 5. Gaz — hisoblagich (ASUPG) ── */

export type GasObjectRow = {
    id: number;
    tubeGuid: string;
    objectName: string | null;
    objectState: string | null;
    syncedAt: string | null;
    createdAt: string;
};

export type GasDayLogRow = {
    id: number;
    tubehrdayId: string;
    tubehrdayDatehrday: string;
    gasObjectId: number;
    gasObject: GasObjectRow | null;
    tubehrdayTemperature: string | null;
    tubehrdayDeltapressure: string | null;
    tubehrdayVolume: string | null;
    /** ⭐ ASOSIY: korreksiya qilingan hajm, m³. */
    tubehrdayCorrvolume: string | null;
    tubehrdayPressure: string | null;
    tubehrdayFloattime: string | null;
    tubehrVolumeC: string | null;
    tubehrCorrvolumeC: string | null;
    createdAt: string;
    updatedAt: string;
};

/** Serverda `limit` yo'q — `from`/`to` doim tor oraliq bilan berilsin. */
export const getGasDayLogs = async (from: string, to: string): Promise<GasDayLogRow[]> => {
    const response = await gasClient.get("/day-logs", { params: { from, to } });
    return unwrapLive<GasDayLogRow[]>(response.data) ?? [];
};

/* ── 3. Quyosh stansiyalari ── */

export type SolarStationRow = {
    id: string;
    stationCode: string;
    stationName: string | null;
    address: string | null;
    /** O'rnatilgan quvvat, MVt — decimal → matn. */
    capacity: string | null;
    contactPerson: string | null;
    contactMethod: string | null;
    gridConnectionDate: string | null;
    latitude: string | null;
    longitude: string | null;
    createdAt: string;
    updatedAt: string;
};

export const getSolarStations = async (): Promise<SolarStationRow[]> => {
    const response = await solarClient.get("/stations");
    return unwrapLive<SolarStationRow[]>(response.data) ?? [];
};

export type SolarKpiRow = {
    id: string;
    stationCode: string;
    collectTime: string;
    /** ISO timestamp; kun kaliti — birinchi 10 belgi. */
    collectDate: string;
    installedCapacity: string | null;
    radiationIntensity: string | null;
    theoryPower: string | null;
    performanceRatio: string | null;
    /** ⭐ HAQIQIY ishlab chiqarilgan energiya, kVt·soat — asosiy ko'rsatkich. */
    inverterPower: string | null;
    powerProfit: string | null;
    perpowerRatio: string | null;
    reductionTotalCo2: string | null;
    reductionTotalCoal: string | null;
    createdAt: string;
    updatedAt: string;
};

export const getSolarDbKpi = async (startDate: string, endDate: string): Promise<SolarKpiRow[]> => {
    const response = await solarClient.get("/db-kpi", { params: { startDate, endDate } });
    return unwrapLive<SolarKpiRow[]>(response.data) ?? [];
};
