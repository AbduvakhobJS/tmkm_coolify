import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAbsences, getDemography, getHrMetrics, getImportStats, getMovements, getOrgStructure,
    postHrSync, type PeriodType,
} from "../services/zupHr";

/**
 * Ma'lumot 1C:ZUP dan har kuni 02:00 da import qilinadi va endpointlar faqat
 * lokal jadvallardan o'qiydi — shu sabab `staleTime` uzun, tez-tez qayta
 * so'rashning ma'nosi yo'q. Bo'sh `data` — xato emas, o'sha sana uchun import
 * bo'lmagan holat.
 */
const HR_STALE = 5 * 60_000;

export const useZupMetrics = (params: {
    date_from?: string;
    date_to?: string;
    period_type?: PeriodType;
    group_by?: "department" | "management" | "division";
}) =>
    useQuery({
        queryKey: ["zup-hr-metrics", params],
        queryFn: () => getHrMetrics(params),
        staleTime: HR_STALE,
        retry: false,
    });

export const useZupOrgStructure = () =>
    useQuery({
        queryKey: ["zup-hr-org-structure"],
        queryFn: getOrgStructure,
        staleTime: HR_STALE,
        retry: false,
    });

export const useZupAbsences = (params: {
    date_from?: string;
    date_to?: string;
    unit_id?: string;
    absence_type?: string;
    page?: number;
    limit?: number;
}) =>
    useQuery({
        queryKey: ["zup-hr-absences", params],
        queryFn: () => getAbsences(params),
        staleTime: HR_STALE,
        retry: false,
    });

/**
 * `date` — aniq moslik (oraliq emas). Import bo'lmagan sana uchun `data: []`
 * qaytadi, shuning uchun sana metrics'dagi eng so'nggi `period` dan olinadi va
 * u ma'lum bo'lgunicha so'rov yuborilmaydi.
 */
export const useZupDemography = (date?: string, unitId?: string) =>
    useQuery({
        queryKey: ["zup-hr-demography", date, unitId],
        queryFn: () => getDemography({ date, unit_id: unitId }),
        enabled: !!date,
        staleTime: HR_STALE,
        retry: false,
    });

export const useZupMovements = (params: {
    date_from?: string;
    date_to?: string;
    period_type?: PeriodType;
    unit_id?: string;
}) =>
    useQuery({
        queryKey: ["zup-hr-movements", params],
        queryFn: () => getMovements(params),
        staleTime: HR_STALE,
        retry: false,
    });

export const useZupStats = () =>
    useQuery({
        queryKey: ["zup-hr-stats"],
        queryFn: getImportStats,
        staleTime: 60_000,
        retry: false,
    });

/** Qo'lda sinxronizatsiya. Tugma ikki marta bosilmasligi uchun `isPending` dan foydalaning. */
export const useZupSync = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: postHrSync,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["zup-hr-metrics"] });
            qc.invalidateQueries({ queryKey: ["zup-hr-org-structure"] });
            qc.invalidateQueries({ queryKey: ["zup-hr-absences"] });
            qc.invalidateQueries({ queryKey: ["zup-hr-demography"] });
            qc.invalidateQueries({ queryKey: ["zup-hr-movements"] });
            qc.invalidateQueries({ queryKey: ["zup-hr-stats"] });
        },
    });
};
