import axios, { AxiosError } from "axios";
import type { TinTuc } from "../types/tin-tuc";
// ==========================
// CẤU HÌNH AXIOS CLIENT
// ==========================
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
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

export interface PaginationResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Lấy danh sách tin tức (phân trang)
export const getListTinTuc = async (page: number = 1) => {
  const { data } = await axiosClient.get("/tin-tuc", {
    params: { page },
  });
  return data as PaginationResponse<TinTuc>;
};

// Lấy chi tiết tin tức theo ID
export const getTinTucById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/tin-tucs/${id}`);
  return data.data as TinTuc;
};

export const createTinTuc = async (data: {
  tieu_de: string;
  noi_dung: string;
  hinh_anh?: File;
}) => {
  const formData = new FormData();
  formData.append("tieu_de", data.tieu_de);
  formData.append("noi_dung", data.noi_dung);
  if (data.hinh_anh) {
    formData.append("hinh_anh", data.hinh_anh);
  }

  const res = await axiosClient.post("/tin-tucs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// Tạo tin tức mới với file
export const createTinTucWithFile = async (data: {
  tieu_de: string;
  noi_dung: string;
  hinh_anh?: File;
}) => {
  const formData = new FormData();
  formData.append("tieu_de", data.tieu_de);
  formData.append("noi_dung", data.noi_dung);
  if (data.hinh_anh) {
    formData.append("hinh_anh", data.hinh_anh);
  }
  const res = await axiosClient.post("/tin-tucs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; 
};

// Cập nhật tin tức
export const updateTinTuc = async (
  id: number | string,
  values: {
    tieu_de?: string;
    noi_dung?: string;
    hinh_anh?: string | File | null;
  }
) => {
  const formData = new FormData();
  if (values.tieu_de) formData.append("tieu_de", values.tieu_de);
  if (values.noi_dung) formData.append("noi_dung", values.noi_dung);
  if (values.hinh_anh instanceof File) {
    formData.append("hinh_anh", values.hinh_anh);
  } else if (values.hinh_anh === null) {
    formData.append("hinh_anh", "");
  }
  const { data } = await axiosClient.put(`/tin-tucs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; 
};

export const deleteTinTuc = async (id: number | string) => {
  console.log('Calling DELETE for TinTuc ID:', id); 
  const response = await axiosClient.delete(`/tin-tucs/${id}`);
  console.log('Delete response:', response.data);
  return response.data; 
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;