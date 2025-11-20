// DonVeProvider.ts
import axios, { AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Thêm token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================= API ĐẶT VÉ =======================

// 1. Danh sách vé đã đặt (GET /dat-ve)
export const getDanhSachDatVe = async () => {
  const { data } = await axiosClient.get("/dat-ve");
  return data;
};

// 2. Chi tiết vé (GET /dat-ve/{id})
export const getChiTietVe = async (id: number | string) => {
  const { data } = await axiosClient.get(`/dat-ve/${id}`);
  return data;
};

// 3. In vé (GET /dat-ve/{id}/in-ve)
export const getInVe = async (id: number | string) => {
  const { data } = await axiosClient.get(`/dat-ve/${id}/in-ve`);
  return data;
};

// ======================= Xử lý lỗi =======================
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
