import axios from "axios";
import type { PhienBan } from "../types/phienban";

// Nếu đã proxy Vite cho /api → 8000, dùng đường dẫn ngắn:
const API = "/api/phien-ban";
// Nếu chưa proxy, thay bằng: const API = "http://localhost:8000/api/phien-ban";

export const getListPhienBan = async (): Promise<PhienBan[]> => {
  const res = await axios.get(API);
  return res.data.data as PhienBan[];
};

export const getPhienBanById = async (id: number | string): Promise<PhienBan> => {
  const res = await axios.get(`${API}/${id}`);
  return res.data.data as PhienBan;
};

export const createPhienBan = async (
  values: Omit<PhienBan, "id" | "created_at" | "updated_at">
): Promise<PhienBan> => {
  const res = await axios.post(API, values);
  return res.data.data as PhienBan;
};

export const updatePhienBan = async (
  id: number | string,
  values: Partial<PhienBan>
): Promise<PhienBan> => {
  const res = await axios.put(`${API}/${id}`, values);
  return res.data.data as PhienBan;
};

export const deletePhienBan = async (id: number | string): Promise<void> => {
  await axios.delete(`${API}/${id}`);
};
