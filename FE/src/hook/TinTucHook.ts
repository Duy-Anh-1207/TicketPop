import {
  getListTinTuc,
  getTinTucById,
  createTinTuc,
  deleteTinTuc,
  updateTinTuc,
} from "../provider/TinTucProvide";

import type { NewsFilterType, PaginationResponse } from "../provider/TinTucProvide";

export type { NewsFilterType } from "../provider/TinTucProvide";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

import type { TinTuc } from "../types/tin-tuc"; 


export const useListTinTuc = (
  page: number = 1,
  type: NewsFilterType = 'all'
) =>
  useQuery<PaginationResponse<TinTuc>>({
    queryKey: ["tin-tuc", page, type],
    queryFn: () => getListTinTuc(page, type),
  });


export const useTinTucDetail = (id: number | string | null) =>
  useQuery<TinTuc>({
    queryKey: ["tin-tuc", id],
    queryFn: () => getTinTucById(id!),
    enabled: !!id, // chỉ chạy khi có id
  });


export const useCreateTinTuc = () => {
  const queryClient = useQueryClient();

  return useMutation({
   
    mutationFn: (values: {
      tieu_de: string;
      noi_dung: string;
      hinh_anh?: File; 
      type: 'tin_tuc' | 'uu_dai' | 'su_kien';
    }) => createTinTuc(values),

    onSuccess: (res) => {
      Swal.fire(
        "Thành công!",
        (res as { message: string }).message || "Đã thêm tin tức mới!", // Ép kiểu res
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể thêm tin tức.",
        "error"
      );
    },
  });
};

export const useUpdateTinTuc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string | number;
      // Cập nhật kiểu 'values'
      values: {
        tieu_de?: string;
        noi_dung?: string;
        hinh_anh?: string | File | null;
        type?: 'tin_tuc' | 'uu_dai' | 'su_kien'; // <-- Thêm trường 'type'
      };
    }) => updateTinTuc(id, values),

    onSuccess: (res) => {
      Swal.fire(
        "Thành công!",
        (res as { message: string }).message || "Đã cập nhật tin tức.", // Ép kiểu res
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể cập nhật tin tức.",
        "error"
      );
    },
  });
};


export const useDeleteTinTuc = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => deleteTinTuc(id),
    onSuccess: (res) => {
      Swal.fire(
        "Đã xóa!",
        (res as { message: string }).message || "Tin tức đã được xóa.", // Ép kiểu res
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["tin-tuc"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire(
        "Lỗi!",
        err.response?.data?.message || "Không thể xóa tin tức.",
        "error"
      );
    },
  });
};

