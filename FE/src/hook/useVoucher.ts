import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getListVouchers, getVoucherById, createVoucher, updateVoucher, deleteVoucher } from "../provider/VoucherProviders";
import type { Voucher } from "../types/Voucher";

// Lấy danh sách mã giảm giá
export const useListVouchers = () =>
  useQuery<Voucher[]>({
    queryKey: ["vouchers"],
    queryFn: getListVouchers,
  });

// Lấy chi tiết mã giảm giá
export const useVoucherDetail = (id: number | string | null) =>
  useQuery<Voucher>({
    queryKey: ["vouchers", id],
    queryFn: () => getVoucherById(id!),
    enabled: !!id,
  });

// Thêm mã giảm giá
export const useCreateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => createVoucher(data),
    onSuccess: (res) => {
      Swal.fire("Thành công!", res.message || "Đã thêm mã giảm giá mới!", "success");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể thêm mã giảm giá.",
        "error"
      );
    },
  });
};

// Cập nhật mã giảm giá
export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string | number; values: FormData }) => updateVoucher(id, values),
    onSuccess: (res) => {
      Swal.fire("Thành công!", res.message || "Đã cập nhật mã giảm giá.", "success");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể cập nhật mã giảm giá.",
        "error"
      );
    },
  });
};

// Xóa mã giảm giá
export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => deleteVoucher(id),
    onSuccess: () => {
      Swal.fire("Đã xóa!", "Mã giảm giá đã được xóa.", "success");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể xóa mã giảm giá.",
        "error"
      );
    },
  });
};