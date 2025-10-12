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

// 🔹 Thêm user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      values: Omit<User, "id" | "created_at" | "updated_at"> & { password: string }
    ) =>
      createUser({
        ...values,
        email_verified_at: values.email_verified_at ?? undefined, // chuyển null => undefined
      }),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm người dùng.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể thêm.", "error");
    },
  });
};



// 🔹 Cập nhật user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Partial<User> }) =>
      updateUser(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật người dùng.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể cập nhật.", "error");
    },
  });
};

// 🔹 Xóa user
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
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa.", "error");
    },
  });
};

export const useToggleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => toggleUserStatus(id),
    onSuccess: (data) => {
      // Sử dụng thông báo từ API trả về
      Swal.fire("Cập nhật!", data.message || "Trạng thái người dùng đã thay đổi.", "success");

      // Làm mới danh sách người dùng
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      Swal.fire(
        "Lỗi!",
        error?.response?.data?.message,
        "error"
      );
    },
  });
};

// 🔹 Gán vai trò
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: string }) =>
      assignUserRole(id, role),
    onSuccess: (res) => {
      Swal.fire("Cập nhật!", res.message || "Vai trò người dùng đã được thay đổi.", "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể thay đổi vai trò.",
        "error"
      );
    },
  });
};

