import { useQuery } from "@tanstack/react-query";
import { getAllNarastayka, getDashboard, getFilters } from "../services/production";
import type { DashboardParams } from "../services/production";

export const useProductionFilters = () =>
    useQuery({
        queryKey: ["production-filters"],
        queryFn: getFilters,
        staleTime: 5 * 60_000,
    });

/**
 * Metallar dashboardi uchun yig'ma ko'rsatkichlar
 * (`GET /production-report/dashboard`).
 *
 * Barcha parametrlar ixtiyoriy: hech biri berilmasa backend butun davr
 * bo'yicha ma'lumot qaytaradi. `from`/`to` berilmasa `delta` maydonlari
 * `null` bo'ladi — taqqoslash uchun oldingi davr aniqlanmaydi.
 */
export const useProductionDashboard = (params: DashboardParams = {}) =>
    useQuery({
        queryKey: ["production-dashboard", params],
        queryFn: () => getDashboard(params),
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
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
