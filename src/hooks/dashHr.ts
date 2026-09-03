import { useQuery } from "@tanstack/react-query";
import {
    getAbsences, getDemography, getEmployees, getHeadcount, getMetrics,
    getMovements, getOrgStructure, getStates,
    type AbsenceMode, type PeriodType, type UnitLevel,
} from "../services/dashHr";

/**
 * `dash_HR_API` (1C:ZUP) uchun react-query hook'lari.
 *
 * API kesh ishlatmaydi — har so'rovda 1C bazasiga boradi (spetsifikatsiya §4),
 * shu sabab client tomonda `staleTime` uzun qilingan: bir ekranda 8 ta
 * endpoint chaqiriladi va ularning har biri 1C uchun og'ir so'rov.
 *
 * `retry: false` — 1C xatosi (401/500/timeout) darhol ko'rsatiladi, chunki
 * qayta urinish faqat bazaga yuk qo'shadi.
 */
const STALE = 5 * 60_000;

export const useDashOrgStructure = (params: { active_only?: boolean; organization_id?: string } = {}) =>
    useQuery({
        queryKey: ["dash-hr", "org-structure", params],
        queryFn: () => getOrgStructure(params),
        staleTime: STALE,
        retry: false,
    });

export const useDashMovements = (params: {
    date_from: string;
    date_to: string;
    period_type?: PeriodType;
    organization_id?: string;
}) =>
    useQuery({
        queryKey: ["dash-hr", "movements", params],
        queryFn: () => getMovements(params),
        enabled: !!params.date_from && !!params.date_to,
        staleTime: STALE,
        retry: false,
    });

export const useDashDemography = (params: { date?: string; organization_id?: string } = {}) =>
    useQuery({
        queryKey: ["dash-hr", "demography", params],
        queryFn: () => getDemography(params),
        staleTime: STALE,
        retry: false,
    });

/**
 * `mode=period` bo'lganda `date_from`/`date_to` MAJBURIY (aks holda 1C 400
 * qaytaradi) — shu sabab so'rov faqat kerakli parametrlar to'liq bo'lgandagina
 * yuboriladi.
 */
export const useDashAbsences = (params: {
    mode: AbsenceMode;
    date?: string;
    date_from?: string;
    date_to?: string;
    organization_id?: string;
}) =>
    useQuery({
        queryKey: ["dash-hr", "absences", params],
        queryFn: () => getAbsences(params),
        enabled: params.mode === "on_date" ? true : !!params.date_from && !!params.date_to,
        staleTime: STALE,
        retry: false,
    });

export const useDashMetrics = (params: {
    date_from: string;
    date_to: string;
    period_type?: PeriodType;
    group_by?: UnitLevel;
    organization_id?: string;
    include_gender?: boolean;
    include_age_groups?: boolean;
    include_absences?: boolean;
}) =>
    useQuery({
        queryKey: ["dash-hr", "metrics", params],
        queryFn: () => getMetrics(params),
        enabled: !!params.date_from && !!params.date_to,
        staleTime: STALE,
        retry: false,
    });

export const useDashHeadcount = (params: { date?: string; organization_id?: string; unit_id?: string } = {}) =>
    useQuery({
        queryKey: ["dash-hr", "headcount", params],
        queryFn: () => getHeadcount(params),
        staleTime: STALE,
        retry: false,
    });

export const useDashEmployees = (params: {
    date?: string;
    limit?: number;
    organization_id?: string;
    unit_id?: string;
} = {}) =>
    useQuery({
        queryKey: ["dash-hr", "employees", params],
        queryFn: () => getEmployees(params),
        staleTime: STALE,
        retry: false,
    });

/** Enum mapping o'zgarmaydi — kun bo'yi kesh yetarli. */
export const useDashStates = () =>
    useQuery({
        queryKey: ["dash-hr", "states"],
        queryFn: getStates,
        staleTime: 60 * 60_000,
        retry: false,
    });
