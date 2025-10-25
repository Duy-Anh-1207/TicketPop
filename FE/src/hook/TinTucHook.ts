import {
  getListTinTuc,
  getTinTucById,
  createTinTuc,
  deleteTinTuc,
  updateTinTuc,
} from "../provider/TinTucProvide";

import type { PaginationResponse } from "../provider/TinTucProvide";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { TinTuc } from "../types/tin-tuc";

// 🔹 Lấy danh sách tin tức (phân trang)
export const useListTinTuc = (page: number = 1) =>
  useQuery<PaginationResponse<TinTuc>>({
    queryKey: ["tin-tuc", page],
    queryFn: () => getListTinTuc(page),
  });

// 🔹 Lấy chi tiết tin tức
export const useTinTucDetail = (id: number | string | null) =>
  useQuery<TinTuc>({
    queryKey: ["tin-tuc", id],
    queryFn: () => getTinTucById(id!),
    enabled: !!id, // chỉ chạy khi có id
  });

// 🔹 Thêm tin tức
export const useCreateTinTuc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      tieu_de: string;
      noi_dung: string;
      hinh_anh?: string;
    }) => createTinTuc(values),

    onSuccess: (res) => {
      Swal.fire(
        "Thành công!",
        res.message || "Đã thêm tin tức mới!",
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể thêm tin tức.",
        "error"
      );
    },
  });
};

// 🔹 Cập nhật tin tức
export const useUpdateTinTuc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: Partial<
        Omit<TinTuc, "id" | "created_at" | "updated_at" | "deleted_at">
      >;
    }) => updateTinTuc(id, values),

    onSuccess: (res) => {
      Swal.fire(
        "Thành công!",
        res.message || "Đã cập nhật tin tức.",
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể cập nhật tin tức.",
        "error"
      );
    },
  });
};

// 🔹 Xóa tin tức
export const useDeleteTinTuc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteTinTuc(id),
    onSuccess: () => {
      Swal.fire("Đã xóa!", "Tin tức đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể xóa tin tức.",
        "error"
      );
    },
  });
};
