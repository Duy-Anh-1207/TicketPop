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
// API CHO BẢNG THỂ LOẠI
// ==========================

// Lấy danh sách thể loại
export const getListTheLoai = async () => {
  const { data } = await axiosClient.get("/the-loai");
  return data.data;
};

// Lấy chi tiết thể loại theo ID
export const getTheLoaiById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/the-loai/${id}`);
  return data;
};

// Tạo mới thể loại
export const createTheLoai = async (data: { ten_the_loai: string }) => {
  const res = await axiosClient.post("/the-loai", data);
  return res.data;
};

// Cập nhật thể loại
export const updateTheLoai = async (
  id: number | string,
  values: Record<string, any>
) => {
  const { data } = await axiosClient.put(`/the-loai/${id}`, values);
  return data;
};

// Xóa thể loại
export const deleteTheLoai = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/the-loai/${id}`);
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
