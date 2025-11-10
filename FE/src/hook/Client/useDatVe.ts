import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { datVe, getDanhSachVeNguoiDung, getChiTietVe, huyVe } from "../../provider/Client/datVeProvider";

//Đặt vé mới
export const useDatVe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      lich_chieu_id: number;
      ghe: number[];
    }) => datVe(payload),

    onSuccess: (res) => {
      Swal.fire("✅ Thành công!", res.message || "Đặt vé thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["dat-ve"] });
    },

    onError: (error: any) => {
      Swal.fire(
        "❌ Lỗi!",
        error?.response?.data?.message || "Không thể đặt vé. Vui lòng thử lại.",
        "error"
      );
    },
  });
};

// Lấy danh sách vé của người dùng hiện tại
export const useDanhSachVeNguoiDung = () =>
  useQuery({
    queryKey: ["dat-ve"],
    queryFn: getDanhSachVeNguoiDung,
  });

// Lấy chi tiết 1 vé theo ID
export const useChiTietVe = (id: number | string | null) =>
  useQuery({
    queryKey: ["dat-ve", id],
    queryFn: () => getChiTietVe(id!),
    enabled: !!id,
  });

// Huỷ vé (nếu backend có API huỷ vé)
export const useHuyVe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => huyVe(id),

    onSuccess: (res) => {
      Swal.fire("🗑️ Huỷ vé!", res.message || "Huỷ vé thành công!", "success");
      queryClient.invalidateQueries({ queryKey: ["dat-ve"] });
    },

    onError: (error: any) => {
      Swal.fire(
        "❌ Lỗi!",
        error?.response?.data?.message || "Không thể huỷ vé. Vui lòng thử lại.",
        "error"
      );
    },
  });
};
