import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Banner } from "../types/banner";

// 🧩 URL API backend (sửa lại nếu cần)
const API_URL = "http://localhost:8000/api/banners"; // hoặc URL API thực tế của bạn

// 📌 Lấy danh sách banner
export const useListBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ["banners"],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data;
    },
  });
};

export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      title: string;
      image_url: string;
      link_url?: string;
      start_date?: string;
      end_date?: string;
    }) => {
      const res = await axios.post("http://localhost:8000/api/banners", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};

// ✏️ Cập nhật banner
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number;
      values: FormData | Partial<Banner>;
    }) => {
      // Nếu là FormData thì gửi bằng multipart/form-data
      if (values instanceof FormData) {
        const res = await axios.post(`${API_URL}/${id}?_method=PUT`, values, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      }
      if (values instanceof FormData) {
  const res = await axios.post(`${API_URL}/${id}?_method=PUT`, values, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


      // Nếu chỉ là update text đơn giản (không có ảnh)
      const res = await axios.put(`${API_URL}/${id}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};

// ❌ Xóa banner
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await axios.delete(`${API_URL}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};
