import axios from "axios";

const hrClient = axios.create({
    baseURL: "https://employees.uzkmt.uz",
});

export const getHrSituation = async () => {
    const response = await hrClient.get(`/api/situation/hr?_=${Date.now()}`);
    return response.data;
};
