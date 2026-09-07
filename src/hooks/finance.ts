import { useQuery } from "@tanstack/react-query";
import { getFinanceDashboard } from "../services/finance";

/**
 * "Moliyaviy vaziyat markazi" paneli uchun yig'ma ko'rsatkichlar
 * (`GET /finance-report/dashboard`).
 *
 * Endpoint parametr qabul qilmaydi va har doim bir xil oylik to'plamni
 * qaytaradi, shuning uchun so'rov kaliti ham o'zgarmas.
 */
export const useFinanceDashboard = () =>
    useQuery({
        queryKey: ["finance-dashboard"],
        queryFn: getFinanceDashboard,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });
