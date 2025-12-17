import axios, { AxiosError } from "axios";
import type { Food } from "../types/foods";

// ==========================
// CẤU HÌNH AXIOS CLIENT
// ==========================
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// ==========================
// GẮN TOKEN TỰ ĐỘNG (Nếu có)
// ==========================
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==========================
// API CHO BẢNG FOOD
// ==========================

// Lấy danh sách food
export const getListFood = async () => {
    const { data } = await axiosClient.get("/foods");
    return data;
};

// Lấy chi tiết food theo ID
export const getFoodById = async (id: number | string) => {
    const { data } = await axiosClient.get(`/foods/${id}`);
    return data;
};

// Tạo mới food
export const createFood = async (data: Omit<Food, "id" | "created_at" | "updated_at" | "deleted_at">) => {
    const res = await axiosClient.post("/foods", data); // endpoint đúng /do-an
    return res.data;
};

// Cập nhật food
export const updateFood = async (
    id: number | string,
    values: FormData | Record<string, any>
) => {
    if (values instanceof FormData) {
        const { data } = await axiosClient.post(`/foods/${id}`, values, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return data;
    }
    const { data } = await axiosClient.put(`/foods/${id}`, values);
    return data;
};

// Xóa food
export const deleteFood = async (id: number | string) => {
    const { data } = await axiosClient.delete(`/foods/${id}`);
    return data;
};

// ==========================
// XỬ LÝ LỖI CHUNG
// ==========================
axiosClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;
