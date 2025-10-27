import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Lấy danh sách phim */
export const getListPhim = async ({ resource = "phim" }) => {
  const { data } = await axiosClient.get(resource);
  return data;
};

export const getListTheLoai = async ({ resource = "the-loai" }) => {
  const { data } = await axiosClient.get(resource);
  return data;
};

export const getListPhienBan = async ({ resource = "phien-ban" }) => {
  const { data } = await axiosClient.get(resource);
  return data;
};

/** Xóa phim */
export const getDeletePhim = async ({ resource = "phim", id }: any) => {
  if (!id) return;
  const { data } = await axiosClient.delete(`${resource}/${id}`);
  return data;
};

/** Tạo phim */
export const getCreatePhim = async ({ resource = "phim", values }: any) => {
  const isFormData = values instanceof FormData;
  const { data } = await axiosClient.post(resource, values, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return data;
};

/** Cập nhật phim */
export const getUpdatePhim = async ({ resource = "phim", id, values }: any) => {
  if (!id || !values) return;

  const isFormData = values instanceof FormData;

  if (isFormData) {
    values.append("_method", "PUT");
    const { data } = await axiosClient.post(`${resource}/${id}`, values, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await axiosClient.put(`${resource}/${id}`, values);
  return data;
};

export const getPhimById = async (id: number) => {
  const response = await axiosClient.get(`/phim/${id}`);
  return response.data;
};

export const getPhimBySlug = async (slug: string) => {
  const response = await axiosClient.get(`/phim/slug/${slug}`);
  return response.data;
};
