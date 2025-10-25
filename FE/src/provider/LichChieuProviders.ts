import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Lấy danh sách lịch chiếu
export const getListLichChieu = async () => {
  const { data } = await axiosClient.get("/lich-chieu");
  return data;
};

// Lấy chi tiết lịch chiếu theo ID
export const getLichChieuById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/lich-chieu/${id}`);
  return data;
};

// Tạo lịch chiếu mới
export const createLichChieu = async (data: {
  phim_id: number;
  phong_id: number;
  phien_ban_id?: number;
  gio_chieu: string;
  gio_ket_thuc: string;
}) => {
  const res = await axiosClient.post("/lich-chieu", data);
  return res.data;
};

// Cập nhật lịch chiếu
export const updateLichChieu = async (
  id: number | string,
  values: Partial<{
    phim_id: number;
    phong_id: number;
    phien_ban_id?: number;
    gio_chieu: string;
    gio_ket_thuc: string;
  }>
) => {
  const { data } = await axiosClient.put(`/lich-chieu/${id}`, values);
  return data;
};

// Xóa lịch chiếu
export const deleteLichChieu = async (id: number | string) => {
  const { data } = await axiosClient.delete(`/lich-chieu/${id}`);
  return data;
};