import axios from "axios";

const hrClient = axios.create({
    baseURL: "https://tmk.bgs.uz",
});

export const getHrSituation = async () => {
    const response = await hrClient.get(`/factory/all/`);
    return response.data;
};
