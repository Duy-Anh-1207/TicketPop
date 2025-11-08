import {
  getListMenu,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from "../provider/MenuProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { Menu } from "../types/menu";

// 🔹 Lấy danh sách menu
export const useListMenu = () =>
  useQuery<Menu[]>({
    queryKey: ["menu"],
    queryFn: getListMenu,
  });

// 🔹 Lấy chi tiết menu theo ID
export const useMenuDetail = (id: number | string | null) =>
  useQuery<Menu>({
    queryKey: ["menu", id],
    queryFn: () => getMenuById(id!),
    enabled: !!id,
  });

// 🔹 Thêm menu
export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Omit<Menu, "id" | "created_at" | "updated_at">) =>
      createMenu(values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm menu.", "success");
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể thêm menu.", "error");
    },
  });
};

// 🔹 Cập nhật menu
export const useUpdateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Partial<Menu> }) =>
      updateMenu(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật menu.", "success");
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể cập nhật menu.", "error");
    },
  });
};

// 🔹 Xóa menu
export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteMenu(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Menu đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa menu.", "error");
    },
  });
};
