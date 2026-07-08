import { useMutation } from "@tanstack/react-query";
import { login, LoginPayload } from "../services/auth";

export const useLogin = () => {
    return useMutation({
        mutationFn: (payload: LoginPayload) => login(payload),
    });
}
