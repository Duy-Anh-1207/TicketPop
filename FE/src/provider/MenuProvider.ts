import axios, { AxiosError } from "axios";
import type { Menu } from "../types/menu";

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
// API CHO BẢNG MENU
// ==========================

// Lấy danh sách menu
export const getListMenu = async () => {
  const { data } = await axiosClient.get("/menu");
  return data;
};

// Lấy chi tiết menu theo ID
export const getMenuById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/menu/${id}`);
  return data;
};

// Tạo mới menu
export const createMenu = async (
  data: Omit<Menu, "id" | "created_at" | "updated_at">
) => {
  const res = await axiosClient.post("/menu", data);
  return res.data;
};

// Cập nhật menu
export const updateMenu = async (
  id: number | string,
  values: Partial<Menu>
) => {
  const { data } = await axiosClient.put(`/menu/${id}`, values);
  return data;
};

// Xóa menu
export const deleteMenu = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/menu/${id}`);
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
