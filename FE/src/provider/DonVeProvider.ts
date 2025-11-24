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

// In vé theo mã giao dịch
export const getInVe = async (maGiaoDich: string) => {
  const { data } = await axiosClient.get(`/dat-ve/ma-giao-dich/${maGiaoDich}/in-ve`);
  return data;
};


// GET /dat-ve/ma-giao-dich/{maGiaoDich}
export const getChiTietVeTheoMaGD = async (maGiaoDich: string) => {
  const { data } = await axiosClient.get(`/dat-ve/ma-giao-dich/${maGiaoDich}`);
  return data; // BE trả về { message, data }
};

// Cập nhật trạng thái đã in vé
// Cập nhật trạng thái đã in vé theo mã giao dịch
export const capNhatTrangThaiTheoMaGD = async (maGiaoDich: string) => {
  // Gửi dữ liệu { da_quet: 1 } để BE không báo lỗi required
  const { data } = await axiosClient.put(`/dat-ve/ma-giao-dich/${maGiaoDich}/cap-nhat-trang-thai`, {
    da_quet: 1,
  });
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
