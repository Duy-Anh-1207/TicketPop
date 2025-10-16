import {
  getListPhienBan,
  getPhienBanById,
  createPhienBan,
  updatePhienBan,
  deletePhienBan,
} from "../provider/PhienBanProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { PhienBan } from "../types/phienban";

// 🔹 Lấy danh sách
export const useListPhienBan = () =>
  useQuery<PhienBan[]>({
    queryKey: ["phien-ban"],
    queryFn: getListPhienBan,
  });

// 🔹 Lấy chi tiết theo ID
export const usePhienBanDetail = (id: number | string | null) =>
  useQuery<PhienBan>({
    queryKey: ["phien-ban", id],
    queryFn: () => getPhienBanById(id!),
    enabled: !!id,
  });

// 🔹 Thêm
export const useCreatePhienBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Omit<PhienBan, "id" | "created_at" | "updated_at">) =>
      createPhienBan(values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã thêm phiên bản.", "success");
      queryClient.invalidateQueries({ queryKey: ["phien-ban"] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.errors?.ten_phien_ban?.[0] ||
        error?.response?.data?.message ||
        "Không thể thêm phiên bản.";
      Swal.fire("❌ Lỗi!", msg, "error");
    },
  });
};

// 🔹 Cập nhật  ——  payload { id, values }
export const useUpdatePhienBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: Partial<PhienBan> }) =>
      updatePhienBan(id, values),
    onSuccess: () => {
      Swal.fire("✅ Thành công!", "Đã cập nhật phiên bản.", "success");
      queryClient.invalidateQueries({ queryKey: ["phien-ban"] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.errors?.ten_phien_ban?.[0] ||
        error?.response?.data?.message ||
        "Không thể cập nhật phiên bản.";
      Swal.fire("❌ Lỗi!", msg, "error");
    },
  });
};

// 🔹 Xóa
export const useDeletePhienBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deletePhienBan(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Phiên bản đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["phien-ban"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể xóa phiên bản.";
      Swal.fire("❌ Lỗi!", msg, "error");
    },
  });
};
