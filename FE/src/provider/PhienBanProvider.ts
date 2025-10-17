import axios  from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Lấy danh sách phiên bản
export const getListPhienBan = async () => {
  const { data } = await axiosClient.get("/phien-ban");
  return data.data;
};

