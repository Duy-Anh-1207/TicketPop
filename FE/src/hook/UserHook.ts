import {
  getListUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  assignUserRole,
} from "../provider/UserProviders";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { User } from "../types/user";

// 🔹 Lấy danh sách user
export const useListUsers = () =>
  useQuery<User[]>({
    queryKey: ["users"],
    queryFn: getListUsers,
  });

// 🔹 Lấy chi tiết user
export const useUserDetail = (id: number | string | null) =>
  useQuery<User>({
    queryKey: ["users", id],
    queryFn: () => getUserById(id!),
    enabled: !!id, // chỉ chạy khi có id
  });

// 🔹 Thêm người dùng
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      ten: string;
      email: string;
      password: string;
      so_dien_thoai?: string;
      anh_dai_dien?: string;
      trang_thai?: string;
      vai_tro_id: number | string;
    }) => {
      // Map 'ten' to 'name' for API compatibility
      const { ten, ...rest } = values;
      return createUser({ name: ten, ...rest });
    },

    onSuccess: (res) => {
      Swal.fire("✅ Thành công!", res.message || "Đã thêm người dùng mới!", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["vai-tro"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể thêm người dùng.",
        "error"
      );
    },
  });
};

// 🔹 Cập nhật người dùng
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
    }) => updateUser(id, values),

    onSuccess: (res) => {
      Swal.fire("✅ Thành công!", res.message || "Đã cập nhật người dùng.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể cập nhật người dùng.",
        "error"
      );
    },
  });
};

// 🔹 Xóa người dùng
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteUser(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Người dùng đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa người dùng.", "error");
    },
  });
};

// 🔹 Đổi trạng thái hoạt động
export const useToggleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => toggleUserStatus(id),
    onSuccess: (data) => {
      Swal.fire("Cập nhật!", data.message || "Trạng thái người dùng đã thay đổi.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      Swal.fire("Lỗi!", error?.response?.data?.message || "Không thể cập nhật trạng thái.", "error");
    },
  });
};

// 🔹 Gán vai trò người dùng
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vai_tro_id }: { id: string | number; vai_tro_id: number | string }) =>
      assignUserRole(String(id), String(vai_tro_id)),

    onSuccess: (res) => {
      Swal.fire("Cập nhật!", res.message || "Vai trò người dùng đã được thay đổi.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["vai-tro"] });
    },
    onError: (err: any) => {
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể thay đổi vai trò.", "error");
    },
  });
};
