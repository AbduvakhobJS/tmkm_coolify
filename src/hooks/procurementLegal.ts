import { useQuery } from "@tanstack/react-query";
import { getProcurementDashboard } from "../services/stateProcurement";
import { getLegalAffairsDashboard } from "../services/legalAffairs";

// Davlat xaridlari — butun ekran bitta so'rovdan (GET /state-procurement/dashboard).
export const useProcurementDashboard = () =>
    useQuery({
        queryKey: ["state-procurement-dashboard"],
        queryFn: getProcurementDashboard,
        retry: false,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });

// Yuridik boshqarma — summary + uchala bo'lim ro'yxati (GET /legal-affairs/dashboard).
export const useLegalAffairsDashboard = () =>
    useQuery({
        queryKey: ["legal-affairs-dashboard"],
        queryFn: getLegalAffairsDashboard,
        retry: false,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    });
