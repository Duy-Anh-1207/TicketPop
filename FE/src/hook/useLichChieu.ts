import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import {
  getListLichChieu,
  getLichChieuById,
  createLichChieu,
  updateLichChieu,
  deleteLichChieu,
} from "../provider/LichChieuProviders";
import type { LichChieu } from "../types/lichchieu";

// 🔹 Lấy danh sách lịch chiếu
export const useListLichChieu = () =>
  useQuery<LichChieu[]>({
    queryKey: ["lich-chieu"],
    queryFn: getListLichChieu,
  });

// 🔹 Lấy chi tiết lịch chiếu
export const useLichChieuDetail = (id: number | string | null) =>
  useQuery<LichChieu>({
    queryKey: ["lich-chieu", id],
    queryFn: () => getLichChieuById(id!),
    enabled: !!id, // Chỉ chạy khi có id
  });

// 🔹 Thêm lịch chiếu
export const useCreateLichChieu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      phim_id: number;
      phong_id: number;
      phien_ban_id?: number;
      gio_chieu: string;
      gio_ket_thuc: string;
    }) => createLichChieu(values),

    onSuccess: (res) => {
      Swal.fire("✅ Thành công!", res.message || "Đã thêm lịch chiếu mới!", "success");
      queryClient.invalidateQueries({ queryKey: ["lich-chieu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể thêm lịch chiếu.",
        "error"
      );
    },
  });
};

// 🔹 Cập nhật lịch chiếu
export const useUpdateLichChieu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      values: Partial<Omit<LichChieu, "id" | "created_at" | "updated_at" | "deleted_at">>;
    }) => updateLichChieu(id, values),

    onSuccess: (res) => {
      Swal.fire("✅ Thành công!", res.message || "Đã cập nhật lịch chiếu.", "success");
      queryClient.invalidateQueries({ queryKey: ["lich-chieu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "❌ Lỗi!",
        err.response?.data?.message || "Không thể cập nhật lịch chiếu.",
        "error"
      );
    },
  });
};

// 🔹 Xóa lịch chiếu
export const useDeleteLichChieu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteLichChieu(id),
    onSuccess: () => {
      Swal.fire("🗑️ Đã xóa!", "Lịch chiếu đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["lich-chieu"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("❌ Lỗi!", err.response?.data?.message || "Không thể xóa lịch chiếu.", "error");
    },
  });
};
