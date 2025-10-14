import {
  getListTheLoai,
  getTheLoaiById,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai,
} from "../provider/TheLoaiProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { TheLoai } from "../types/theloai";

// 🔹 Lấy danh sách thể loại
export const useListTheLoai = () =>
  useQuery<TheLoai[]>({
    queryKey: ["the-loai"],
    queryFn: getListTheLoai,
  });

// 🔹 Lấy chi tiết thể loại theo ID
export const useTheLoaiDetail = (id: number | string | null) =>
  useQuery<TheLoai>({
    queryKey: ["the-loai", id],
    queryFn: () => getTheLoaiById(id!),
    enabled: !!id,
  });

// 🔹 Thêm thể loại
export const useCreateTheLoai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Omit<TheLoai, "id" | "created_at" | "updated_at">) =>
      createTheLoai(values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm thể loại.", "success");
      queryClient.invalidateQueries({ queryKey: ["the-loai"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể thêm thể loại.", "error");
    },
  });
};

// 🔹 Cập nhật thể loại
export const useUpdateTheLoai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Partial<TheLoai> }) =>
      updateTheLoai(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật thể loại.", "success");
      queryClient.invalidateQueries({ queryKey: ["the-loai"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể cập nhật thể loại.", "error");
    },
  });
};

// 🔹 Xóa thể loại
export const useDeleteTheLoai = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteTheLoai(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Thể loại đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["the-loai"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa thể loại.", "error");
    },
  });
};
