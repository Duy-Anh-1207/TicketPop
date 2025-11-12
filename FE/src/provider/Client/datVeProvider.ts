import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Gọi API đặt vé
export const datVe = async (payload: {
  lich_chieu_id: number;
  ghe: number[];
  do_an?: { do_an_id: number; so_luong: number }[];
}) => {
  try {
    const { data } = await axiosClient.post("/dat-ve", payload);
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi đặt vé:", error.response?.data || error.message);
    throw error;
  }
};


// Lấy danh sách vé của người dùng hiện tại
export const getDanhSachVeNguoiDung = async () => {
  try {
    const { data } = await axiosClient.get("/dat-ve");
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách vé:", error.response?.data || error.message);
    throw error;
  }
};

//Lấy chi tiết vé theo ID
export const getChiTietVe = async (id: number | string) => {
  try {
    const { data } = await axiosClient.get(`/dat-ve/${id}`);
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy chi tiết vé:", error.response?.data || error.message);
    throw error;
  }
};

//Huỷ vé
export const huyVe = async (id: number | string) => {
  try {
    const { data } = await axiosClient.delete(`/dat-ve/${id}`);
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi huỷ vé:", error.response?.data || error.message);
    throw error;
  }
};
