import apiClient from "../api/api";

export interface LoginPayload {
    username: string;
    password: string;
}

export const login = async (payload: LoginPayload) => {
    const response = await apiClient.post("https://situation.uzkmt.uz/login", payload);
    return response.data;
}
