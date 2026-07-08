import apiClient from "../api/api";

export const getTypeObject = async () => {
    const response = await apiClient.get("http://localhost:3001/object-types?lang=ru");
    return response.data;
}
//
// export const getAllAccountingFuelPayments = async (page, size, sort, carId) => {
//     const response = await apiClient.get("/accounting-fuel/paged?page=" + page + "&size=" + size + "&sort=" + sort + (carId > 0 ? "&carId=" + carId : ""));
//     return {
//         totalCount: response.headers['x-total-count'],
//         ...response.data
//     };
// };
//
// export const deleteAccountingFuelPayment = async (id) => {
//     const response = await apiClient.delete("/accounting-fuel/" + id);
//     return response.data;
// }
//
//
// export const updateAccountingFuelPayment = async (id, data) => {
//     const response = await apiClient.put("/accounting-fuel/" + id, data);
//     return response.data;
// }
//
// export const getAllAccountingFuelPaymentsTotal = async () => {
//     const response = await apiClient.get("/accounting-fuel/paged-with-total?page=0&size=10&sort=createdAt,desc");
//     return {
//         totalCount: response.headers['x-total-count'],
//         ...response.data
//     };
// };