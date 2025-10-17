import {
  getListFood,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "../provider/FoodProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { Food } from "../types/foods";

// 🔹 Lấy danh sách food
export const useListFood = () =>
  useQuery<Food[]>({
    queryKey: ["foods"],
    queryFn: getListFood,
  });

// 🔹 Lấy chi tiết food theo ID
export const useFoodDetail = (id: number | string | null) =>
  useQuery<Food>({
    queryKey: ["foods", id],
    queryFn: () => getFoodById(id!),
    enabled: !!id,
  });

// 🔹 Thêm food
export const useCreateFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Omit<Food, "id" | "created_at" | "updated_at" | "deleted_at">) =>
      createFood(values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm food.", "success");
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể thêm food.", "error");
    },
  });
};

// 🔹 Cập nhật food
export const useUpdateFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Partial<Food> }) =>
      updateFood(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật food.", "success");
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể cập nhật food.", "error");
    },
  });
};

// 🔹 Xóa food
export const useDeleteFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteFood(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Food đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa food.", "error");
    },
  });
};
