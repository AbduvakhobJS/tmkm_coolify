import {useQuery} from "@tanstack/react-query";
import {getTypeObject, getFactoryMarkers, getFactoryDetail, getMapObjects, getGeologyProjectDetail, getInvestProjectDetail, getInvestProjectsList, InvestProjectType, FactoryMarkerParams} from "../services/map";

export const useGetTypeObjectAll = () => {
    return useQuery({
        queryKey: ["accounting-transport-payment-get-all-total"],
        queryFn: () => getTypeObject(),
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    })
}

// Markerlar ro'yxati fon rejimida qayta so'ralganda vaqtinchalik tarmoq nosozligi
// xaritadagi markerlarni bekorga o'chirib yubormasligi uchun avtomatik qayta
// so'rovlar o'chirilgan — filtr o'zgarganda queryKey o'zgarib, o'zi qayta so'raladi.
export const useGetFactoryMarkers = (params: FactoryMarkerParams = {}) => {
    return useQuery({
        queryKey: ["factory-markers", params],
        queryFn: () => getFactoryMarkers(params),
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}

export const useGetFactoryDetail = (id: number | string | null | undefined, lang: string = "uz") => {
    return useQuery({
        queryKey: ["factory-detail", id, lang],
        queryFn: () => getFactoryDetail(id as number | string, lang),
        enabled: id !== null && id !== undefined,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

// Xaritadagi barcha obyektlar — factory, geology, invest — bittа so'rovda
// (GET /map/objects, `items[].type` bo'yicha ajratiladi). Filtrlash (toifa,
// active/inactive) frontendda.
export const useGetMapObjects = (lang: string = "uz") => {
    return useQuery({
        queryKey: ["map-objects", lang],
        queryFn: () => getMapObjects(lang),
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}

// Geologiya loyihasining to'liq "pasport" kartochkasi (GET /geology-projects/:id).
export const useGetGeologyProjectDetail = (id: number | string | null | undefined, lang: string = "uz") => {
    return useQuery({
        queryKey: ["geology-project-detail", id, lang],
        queryFn: () => getGeologyProjectDetail(id as number | string, lang),
        enabled: id !== null && id !== undefined && id !== '',
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

// Investitsiya loyihasining to'liq "pasport" kartochkasi (GET /invest-projects/:id).
export const useGetInvestProjectDetail = (id: number | string | null | undefined, lang: string = "uz") => {
    return useQuery({
        queryKey: ["invest-project-detail", id, lang],
        queryFn: () => getInvestProjectDetail(id as number | string, lang),
        enabled: id !== null && id !== undefined && id !== '',
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

// MINE / METALL / MARKET investitsiya loyihalari ro'yxati (GET /invest-projects?type=).
export const useGetInvestProjectsList = (type: InvestProjectType, lang: string = "uz") => {
    return useQuery({
        queryKey: ["invest-projects-list", type, lang],
        queryFn: () => getInvestProjectsList(type, lang),
        retry: false,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
    });
}
