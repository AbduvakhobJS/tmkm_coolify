import axios from "axios";
const apiClient = axios.create({
    baseURL: "",
    headers: {
        "Content-Type": "application/json",
        "Api-Partner-Code": "APIK-2c81397d02f5406e813b",
        "Api-Partner-Version": "v1.0",
        "Accept": "application/json, text/plain, */*",
"Accept-Encoding": "gzip, deflate, br, zstd",
    },
});


apiClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("tmk-token");

        if (token) {

            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
