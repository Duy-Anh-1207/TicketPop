import axios, { AxiosError } from "axios";

// ==========================
// CẤU HÌNH AXIOS CLIENT
// ==========================
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

//Gắn token tự động nếu có
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


//Lấy danh sách người dùng
export const getListUsers = async () => {
  const { data } = await axiosClient.get("/users");
  return data;
};

//Lấy chi tiết người dùng theo ID
export const getUserById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/users/${id}`);
  return data;
};

//Tạo người dùng mới
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  email_verified_at?: string;
}) => {
  const res = await axiosClient.post("/users", data);
  return res.data;
};

//Cập nhật người dùng
export const updateUser = async (
  id: number | string,
  values: Record<string, any>
) => {
  const { data } = await axiosClient.put(`/users/${id}`, values);
  return data;
};

//Xóa người dùng
export const deleteUser = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/users/${id}`);
  return data;
};

// PATCH APIs (tác vụ riêng)
export const toggleUserStatus = async (id: number | string) => {
  const { data } = await axiosClient.patch(`/users/${id}/toggle-status`);
  return data;
};

export const assignUserRole = async (id: number | string, role: string) => {
  const { data } = await axiosClient.patch(`/users/${id}/role`, { role });
  return data;
};

export const resetUserPassword = async (id: number | string) => {
  const { data } = await axiosClient.patch(`/users/${id}/reset-password`);
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
