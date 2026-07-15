import apiClient from "../api/api";

export interface LoginPayload {
    email: string;
    password: string;
}

export const login = async (payload: LoginPayload) => {
    const response = await apiClient.post("https://tmk.bgs.uz/api/auth/login", payload);
    return response.data;
}
