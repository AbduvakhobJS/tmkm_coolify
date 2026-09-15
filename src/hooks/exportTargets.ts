import { useQuery } from "@tanstack/react-query";
import { getExportTargetsDashboard } from "../services/exportTargets";

/**
 * "Eksport maqsadli ko'rsatkichlari" paneli uchun yig'ma ma'lumot
 * (`GET /export-targets/dashboard`).
 *
 * Endpoint parametr qabul qilmaydi (jadval 8x8, sahifalash/filtr kerak emas),
 * shuning uchun so'rov kaliti ham o'zgarmas.
 */
export const useExportTargetsDashboard = () =>
    useQuery({
        queryKey: ["export-targets-dashboard"],
        queryFn: getExportTargetsDashboard,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });
