import { useQuery } from "@tanstack/react-query";
import { getAllNarastayka, getDashboard, getFilters } from "../services/production";

export const useProductionFilters = () =>
    useQuery({
        queryKey: ["production-filters"],
        queryFn: getFilters,
        staleTime: 5 * 60_000,
    });

/**
 * Metallar dashboardi uchun yig'ma ko'rsatkichlar.
 *
 * `retry: false` — endpoint hali mavjud bo'lmasa (404) yoki xato qaytarsa,
 * ekran uch marta qayta urinib kutib turmasdan darhol mock dataga tushadi.
 */
export const useProductionDashboard = (from?: string, to?: string, plant?: string) =>
    useQuery({
        queryKey: ["production-dashboard", from, to, plant],
        queryFn: () => getDashboard(from as string, to as string, plant),
        enabled: !!from && !!to,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
        retry: false,
    });

/** So'nggi 30 kun va undan oldingi 30 kunlik oynalar uchun detal ma'lumotlarni yig'ib beradi. */
export const useProductionNarastayka = (
    curStart?: string,
    curEnd?: string,
    prevStart?: string,
    prevEnd?: string
) =>
    useQuery({
        queryKey: ["production-narastayka", curStart, curEnd, prevStart, prevEnd],
        queryFn: async () => {
            const [current, previous] = await Promise.all([
                getAllNarastayka(curStart as string, curEnd as string),
                getAllNarastayka(prevStart as string, prevEnd as string),
            ]);
            return { current, previous };
        },
        enabled: !!curStart && !!curEnd && !!prevStart && !!prevEnd,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });
