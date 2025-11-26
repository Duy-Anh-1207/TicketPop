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
// API CHO BẢNG PHÒNG CHIẾU
// ==========================

// Lấy danh sách phòng chiếu
export const getListPhongChieu = async () => {
  const { data } = await axiosClient.get("/room");
  return data.data;
};

// Lấy chi tiết phòng chiếu theo ID
export const getPhongChieuById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/room/${id}`);
  return data.data;
};

// Tạo mới phòng chiếu
export const createPhongChieu = async (data: Record<string, any>) => {
  const res = await axiosClient.post("/room", data);
  return res.data;
};

// Cập nhật phòng chiếu
export const updatePhongChieu = async (
  id: number | string,
  values: Record<string, any>
) => {
  const { data } = await axiosClient.put(`/room/${id}`, values);
  return data;
};

// Xóa phòng chiếu
export const deletePhongChieu = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/room/${id}`);
  return data;
};

export const changeStatusPhongChieu = async (id: number | string) => {
  const { data } = await axiosClient.put(`/room/${id}/change-status`);
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
