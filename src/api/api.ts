import axios from "axios";
const apiClient = axios.create({
    baseURL: "",
    headers: {
    //     "Content-Type": "application/json",
    //     "Accept": "application/json, text/plain, */*",
    // "Accept-Encoding": "gzip, deflate, br, zstd",
    },
});


apiClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("tmk-token-bgs");

        if (token) {

            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
