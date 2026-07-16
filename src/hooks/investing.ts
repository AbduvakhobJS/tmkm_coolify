import { useQuery } from "@tanstack/react-query";
import {getHrSituation} from "../services/investing";

export const useGetAllInvesting = () => {
    return useQuery({
        queryKey: ["situation-summary"],
        queryFn: () => getHrSituation(),
        retry: false,
        staleTime: 60_000,
    });
};
