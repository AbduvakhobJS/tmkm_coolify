import {useQuery} from "@tanstack/react-query";
import {getTypeObject} from "../services/map";

export const useGetTypeObjectAll = () => {
    return useQuery({
        queryKey: ["accounting-transport-payment-get-all-total"],
        queryFn: () => getTypeObject(),
        retry: false,
    })
}