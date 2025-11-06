import axios, { AxiosError } from "axios";
// Import 'type' từ file types/tin-tuc.ts (sau khi bạn đã cập nhật file đó ở Bước 2.1)
import type { TinTuc } from "../types/tin-tuc";

// ==========================
// CẤU HÌNH AXIOS CLIENT
// (Giữ nguyên code của bạn)
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

export type NewsFilterType = 'tin_tuc' | 'uu_dai' | 'su_kien' | 'all';


export interface PaginationResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  from: number;
  to: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}


export const getListTinTuc = async (
  page: number = 1,
  type: NewsFilterType = 'all'
) => {

  const params: { page: number; type?: NewsFilterType } = { page };
  if (type !== 'all') {
    params.type = type;
  }


  const { data } = await axiosClient.get("/tin-tucs", { params });
  return data as PaginationResponse<TinTuc>;
};


export const getTinTucById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/tin-tucs/${id}`);
  return data.data as TinTuc;
};


export const createTinTuc = async (data: {
  tieu_de: string;
  noi_dung: string;
  hinh_anh?: File;
  type: 'tin_tuc' | 'uu_dai' | 'su_kien';
}) => {
  const formData = new FormData();
  formData.append("tieu_de", data.tieu_de);
  formData.append("noi_dung", data.noi_dung);
  formData.append("type", data.type);
  if (data.hinh_anh) {
    formData.append("hinh_anh", data.hinh_anh);
  }


  const res = await axiosClient.post("/tin-tucs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


export const updateTinTuc = async (
  id: number | string,
  values: {
    tieu_de?: string;
    noi_dung?: string;
    hinh_anh?: string | File | null;
    type?: 'tin_tuc' | 'uu_dai' | 'su_kien';
  }
) => {
  const formData = new FormData();
  formData.append("_method", "PUT")

  if (values.tieu_de) formData.append("tieu_de", values.tieu_de);
  if (values.noi_dung) formData.append("noi_dung", values.noi_dung);
  if (values.type) formData.append("type", values.type);

  // Xử lý hình ảnh
  if (values.hinh_anh instanceof File) {
    formData.append("hinh_anh", values.hinh_anh);
  } else if (values.hinh_anh === null) {
    formData.append("hinh_anh", "");
  }


  const { data } = await axiosClient.post(`/tin-tucs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};


export const deleteTinTuc = async (id: number | string) => {
  // Dựa theo file routes/api.php, route là /tin-tucs/{id}
  const response = await axiosClient.delete(`/tin-tucs/${id}`);
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

