import {
    getListPhongChieu,
    getPhongChieuById,
    createPhongChieu,
    updatePhongChieu,
    deletePhongChieu,
    changeStatusPhongChieu,
} from "../provider/PhongChieuProvider";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import type { PhongChieu } from "../types/phongchieu";

// 🔹 Lấy danh sách phòng chiếu
export const useListPhongChieuTH1 = (status: string = "1") =>
    useQuery<PhongChieu[]>({
        queryKey: ["room", status],
        queryFn: async () => {
            const data = await getListPhongChieu();
            const filtered = data.filter((pc: PhongChieu) => String(pc.trang_thai) === status);
            return filtered;
        },
    });

export const useListPhongChieuTH0 = (status: string = "0") =>
    useQuery<PhongChieu[]>({
        queryKey: ["room", status],
        queryFn: async () => {
            const data = await getListPhongChieu();
            const filtered = data.filter((pc: PhongChieu) => String(pc.trang_thai) === status);
            return filtered;
        },
    });

// 🔹 Lấy chi tiết phòng chiếu theo ID
export const usePhongChieuDetail = (id: number | string | null) =>
    useQuery<PhongChieu>({
        queryKey: ["room", id],
        queryFn: () => getPhongChieuById(id!),
        enabled: !!id,
    });

// 🔹 Thêm phòng chiếu
export const useCreatePhongChieu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: Omit<PhongChieu, "id" | "created_at" | "updated_at">) =>
            createPhongChieu(values),
        onSuccess: () => {
            Swal.fire("✅ Thành công!", "Đã thêm phòng chiếu mới.", "success");
            queryClient.invalidateQueries({ queryKey: ["room"] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire(
                "❌ Lỗi!",
                err.response?.data?.message || "Không thể thêm phòng chiếu.",
                "error"
            );
        },
    });
};

// 🔹 Cập nhật phòng chiếu
export const useUpdatePhongChieu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            values,
        }: {
            id: number | string;
            values: Partial<Omit<PhongChieu, "id" | "created_at" | "updated_at">>;
        }) => updatePhongChieu(id, values),
        onSuccess: () => {
            Swal.fire("✅ Thành công!", "Đã cập nhật thông tin phòng chiếu.", "success");
            queryClient.invalidateQueries({ queryKey: ["room"] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire(
                "❌ Lỗi!",
                err.response?.data?.message || "Không thể cập nhật phòng chiếu.",
                "error"
            );
        },
    });
};

// 🔹 Xóa phòng chiếu
export const useDeletePhongChieu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number | string) => deletePhongChieu(id),
        onSuccess: () => {
            Swal.fire("🗑️ Đã xóa!", "Phòng chiếu đã được xóa.", "success");
            queryClient.invalidateQueries({ queryKey: ["room"] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire(
                "❌ Lỗi!",
                err.response?.data?.message || "Không thể xóa phòng chiếu.",
                "error"
            );
        },
    });
};

// 🔹 Chuyển trạng thái phòng chiếu (Active ↔ Inactive)
export const useChangeStatusPhongChieu = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number | string) => changeStatusPhongChieu(id),
        onSuccess: (data) => {
            Swal.fire(
                "🔄 Thành công!",
                `Trạng thái phòng đã đổi sang: ${data?.data?.trang_thai_moi == 1 ? "Hoạt động" : "Ngừng hoạt động"
                }`,
                "success"
            );
            queryClient.invalidateQueries({ queryKey: ["room"] });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire(
                "❌ Lỗi!",
                err.response?.data?.message || "Phòng đang có lịch chiếu hoạt động!",
                "error"
            );
        },
    });
};

