import { useQuery } from "@tanstack/react-query";
import { getContactHubSummary } from "../services/contactHub";

export const useContactHubSummary = () => {
    return useQuery({
        queryKey: ["contacthub-summary"],
        queryFn: () => getContactHubSummary(),
        retry: false,
        staleTime: 60_000,
    });
};
