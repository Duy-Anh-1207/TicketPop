
import axios from "axios";
import type { PhienBan } from "../types/phienban";


const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});
// ==========================
// API CHO BẢNG PHIÊN BẢN
// ==========================

// Lấy danh sách phiên bản
export const getListPhienBan = async (): Promise<PhienBan[]> => {
  const { data } = await axiosClient.get("/phien-ban");
  return data.data as PhienBan[];
};

// Lấy chi tiết phiên bản theo ID
export const getPhienBanById = async (id: number | string): Promise<PhienBan> => {
  const { data } = await axiosClient.get(`/phien-ban/${id}`);
  return data.data as PhienBan;
};

// Tạo mới phiên bản
export const createPhienBan = async (
  values: Omit<PhienBan, "id" | "created_at" | "updated_at">
): Promise<PhienBan> => {
  const { data } = await axiosClient.post("/phien-ban", values);
  return data.data as PhienBan;
};

// Cập nhật phiên bản
export const updatePhienBan = async (
  id: number | string,
  values: Partial<PhienBan>
): Promise<PhienBan> => {
  const { data } = await axiosClient.put(`/phien-ban/${id}`, values);
  return data.data as PhienBan;
};

// Xóa phiên bản
export const deletePhienBan = async (id: number | string): Promise<void> => {
  await axiosClient.delete(`/phien-ban/${id}`);
};
