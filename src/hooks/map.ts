import {useQuery} from "@tanstack/react-query";
import {getTypeObject, getFactoryMarkers, getFactoryDetail, FactoryMarkerParams} from "../services/map";

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
