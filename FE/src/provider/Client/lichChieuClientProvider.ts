import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Lấy tất cả lịch chiếu 
export const getAllLichChieu = async () => {
  const { data } = await axiosClient.get("/lich-chieu");
  return data;
};

// Lấy lịch chiếu theo phim
export const getLichChieuTheoPhim = async (phimId: number, ngayChieu?: string) => {
  const { data } = await axiosClient.get("/lich-chieu", {
    params: {
      phim_id: phimId,
      ngay_chieu: ngayChieu,
    },
  });
  return data;
};

// Lấy chi tiết một lịch chiếu
export const getChiTietLichChieu = async (id: number | string) => {
  const { data } = await axiosClient.get(`/lich-chieu/${id}`);
  return data;
};

// Lấy danh sách phiên bản chiếu của phim
export const getPhienBanTheoPhim = async (phimId: number | string) => {
  const { data } = await axiosClient.get(`/phim/${phimId}/phien-ban`);
  return data;
};

// Tìm giờ chiếu kế tiếp (dùng khi chọn phòng/phim)
export const getNextAvailableTime = async (params: {
  phong_id: number;
  thoi_luong?: number;
}) => {
  const { data } = await axiosClient.get("/lich-chieu/find-next", { params });
  return data;
};
