import {
  getListVaiTro,
  getVaiTroById,
  createVaiTro,
  updateVaiTro,
  deleteVaiTro,
  getListMenu,
  getMenuTree,
} from "../provider/VaiTroProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { VaiTro } from "../types/vaitro";
import type { Menu } from "../types/menu";

// 🔹 Lấy danh sách vai trò
export const useListVaiTro = () =>
  useQuery<VaiTro[]>({
    queryKey: ["vai-tro"],
    queryFn: getListVaiTro,
  });

// 🔹 Lấy chi tiết vai trò theo ID
export const useVaiTroDetail = (id: number | string | null) =>
  useQuery<VaiTro>({
    queryKey: ["vai-tro", id],
    queryFn: () => getVaiTroById(id!),
    enabled: !!id,
  });

// 🔹 Thêm vai trò
export const useCreateVaiTro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Omit<VaiTro, "id" | "created_at" | "updated_at">) =>
      createVaiTro(values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm vai trò.", "success");
      queryClient.invalidateQueries({ queryKey: ["vai-tro"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể thêm vai trò.",
        "error"
      );
    },
  });
};

// 🔹 Cập nhật vai trò
export const useUpdateVaiTro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: Partial<VaiTro>;
    }) => updateVaiTro(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật vai trò.", "success");
      queryClient.invalidateQueries({ queryKey: ["vai-tro"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể cập nhật vai trò.",
        "error"
      );
    },
  });
};

// 🔹 Xóa vai trò
export const useDeleteVaiTro = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteVaiTro(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Vai trò đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["vai-tro"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể xóa vai trò.",
        "error"
      );
    },
  });
};

export const useListMenu = () =>
  useQuery<any[]>({
    queryKey: ["menu"],
    queryFn: getListMenu,
  });

  // 🔹 Lấy menu dạng cây (cha - con - cháu)
export const useMenuTree = () =>
  useQuery<Menu[]>({
    queryKey: ["menu-tree"],
    queryFn: getMenuTree,
  });

