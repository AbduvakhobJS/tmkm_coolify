import { useQuery } from "@tanstack/react-query";
import {
    getElectricityByType,
    getElectricityByObject,
    getHydrogenMonthly,
    getGasDayLogs,
    getSolarStations,
    getSolarDbKpi,
} from "../services/energyResources";

export const useElectricityByType = (from?: string, to?: string) =>
    useQuery({
        queryKey: ["energy-electricity", from, to],
        queryFn: () => getElectricityByType(from, to),
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });

export const useElectricityByObject = (from?: string, to?: string) =>
    useQuery({
        queryKey: ["energy-electricity-object", from, to],
        queryFn: () => getElectricityByObject(from, to),
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });

export const useHydrogenMonthly = (from?: string, to?: string) =>
    useQuery({
        queryKey: ["energy-hydrogen", from, to],
        queryFn: () => getHydrogenMonthly(from, to),
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });

/** Serverda `limit` yo'q — `from`/`to` tor oraliq bilan chaqiriladi. */
export const useGasDayLogs = (from?: string, to?: string) =>
    useQuery({
        queryKey: ["energy-gas-daylogs", from, to],
        queryFn: () => getGasDayLogs(from as string, to as string),
        enabled: !!from && !!to,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });

export const useSolarStations = () =>
    useQuery({
        queryKey: ["energy-solar-stations"],
        queryFn: getSolarStations,
        staleTime: 5 * 60_000,
    });

export const useSolarDbKpi = (startDate?: string, endDate?: string) =>
    useQuery({
        queryKey: ["energy-solar-kpi", startDate, endDate],
        queryFn: () => getSolarDbKpi(startDate as string, endDate as string),
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60_000,
        refetchInterval: 5 * 60_000,
    });
