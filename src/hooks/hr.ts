import { useQuery } from "@tanstack/react-query";
import { getSituationSummary } from "../services/hr";

export const useSituationSummary = () => {
    return useQuery({
        queryKey: ["situation-summary"],
        queryFn: () => getSituationSummary(),
        retry: false,
        staleTime: 60_000,
    });
};
