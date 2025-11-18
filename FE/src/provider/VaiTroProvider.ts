import axios, { AxiosError } from "axios";

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
// API CHO BẢNG VAI TRÒ
// ==========================

// Lấy danh sách vai trò
export const getListVaiTro = async () => {
  const { data } = await axiosClient.get("/vai-tro");
  return data.data;
};

// Lấy chi tiết vai trò theo ID
export const getVaiTroById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/vai-tro/${id}`);
  return data;
};

// Tạo mới vai trò
export const createVaiTro = async (data: { ten_vai_tro: string }) => {
  const res = await axiosClient.post("/vai-tro", data);
  return res.data;
};

// Cập nhật vai trò
export const updateVaiTro = async (
  id: number | string,
  values: Record<string, any>
) => {
  const { data } = await axiosClient.put(`/vai-tro/${id}`, values);
  return data;
};

// Xóa vai trò
export const deleteVaiTro = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/vai-tro/${id}`);
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

export const getListMenu = async () => {
  const { data } = await axiosClient.get("/menu");
  return data;
};


export const getMenuTree = async () => {
  const res = await axiosClient.get("/menu/tree"); // Laravel đã có route này
  return res.data;
};


export default axiosClient;
