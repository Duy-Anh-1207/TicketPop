import axios, { AxiosError } from "axios";
import type { Voucher } from "../types/Voucher";

// Cấu hình Axios Client
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lấy danh sách mã giảm giá
export const getListVouchers = async (): Promise<Voucher[]> => {
  const { data } = await axiosClient.get("/ma-giam-gia");
  return data;
};

// Lấy chi tiết mã giảm giá theo ID
export const getVoucherById = async (id: number | string): Promise<Voucher> => {
  const { data } = await axiosClient.get(`/ma-giam-gia/${id}`);
  return data;
};

// Tạo mã giảm giá mới
export const createVoucher = async (data: FormData): Promise<{ message: string; data: Voucher }> => {
  const res = await axiosClient.post("/ma-giam-gia", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Cập nhật mã giảm giá
export const updateVoucher = async (
  id: number | string,
  data: FormData
): Promise<{ message: string; data: Voucher }> => {
  data.append('_method', 'PUT'); 

  const { data: responseData } = await axiosClient.post(`/ma-giam-gia/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return responseData;
};


// Xóa mã giảm giá
export const deleteVoucher = async (id: number | string): Promise<{ message: string }> => {
  const { data } = await axiosClient.delete(`/ma-giam-gia/${id}`);
  return data;
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;