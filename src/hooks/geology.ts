import { useQuery } from "@tanstack/react-query";
import { getGeologyDashboard } from "../services/geology";

/**
 * «Геология лойиҳалари» дашборди (`GET /geology-projects/dashboard`).
 * Манба статик — ҳужжат бўйича сервер маълумоти жуда сийрак янгиланади,
 * шунинг учун узоқ `staleTime` ва автомат рефетч йўқ.
 */
export const useGeologyDashboard = () =>
    useQuery({
        queryKey: ["geology-dashboard"],
        queryFn: getGeologyDashboard,
        staleTime: 30 * 60_000,
        retry: 1,
    });
