import { useQuery } from "@tanstack/react-query";
import { getHrSituation } from "../services/hrSituation";

export const useHrSituation = () => {
    return useQuery({
        queryKey: ["hr-situation"],
        queryFn: () => getHrSituation(),
        retry: false,
        staleTime: 60_000,
        refetchInterval: 60_000,
    });
};
