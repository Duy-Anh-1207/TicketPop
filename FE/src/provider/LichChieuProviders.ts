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
  return data.data; // ✅ Chỉ lấy mảng "data" bên trong JSON
};

// Lấy chi tiết lịch chiếu theo ID
export const getLichChieuById = async (id: number | string) => {
  const { data } = await axiosClient.get(`/lich-chieu/${id}`);
  return data;
};

// Tạo lịch chiếu mới
export const createLichChieu = async (payload: {
  lich_chieu: {
    phim_id: number;
    phong_id: number;
    phien_ban_id?: number ;
    gio_chieu: string;        // datetime-local
    gia_ve_thuong: number;
    gia_ve_vip?: number;      // có thể gửi hoặc để backend tự nhân 1.3
  }[];
}) => {
  const res = await axiosClient.post("/lich-chieu", payload);
  return res.data;            // { message, data, ... }
};
export const createLichChieuAutoOneDay = async (payload: {
  phim_id: number;
  phong_id: number;
  ngay_chieu: string;          // "YYYY-MM-DD"
  gio_bat_dau: string;         // "HH:mm"  (lấy từ lịch #1)
  gio_ket_thuc_toi_da?: string; // ví dụ "03:00"
  gia_ve_thuong: number;       // giá ghế thường đầu ngày
  gia_ve_vip?: number;         // nếu không gửi, backend tự = 1.3 * thường
  phien_ban_id?: number ;
  khoang_nghi?: number;        // phút nghỉ thêm giữa các suất
}) => {
  const res = await axiosClient.post("/lich-chieu/auto-one-day", payload);
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