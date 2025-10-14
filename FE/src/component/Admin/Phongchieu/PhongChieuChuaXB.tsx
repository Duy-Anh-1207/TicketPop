import {
    useDeletePhongChieu,
    useUpdatePhongChieu,
    useListPhongChieuTH0,
} from "../../../hook/PhongChieuHook";
import Swal from "sweetalert2";
import type { PhongChieu } from "../../../types/phongchieu";

export default function PhongChieuChuaXuatBanList() {
    const { data: phongchieus, isLoading } = useListPhongChieuTH0();
    const deletePhongChieu = useDeletePhongChieu();
    const updatePhongChieu = useUpdatePhongChieu();

    if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

    // Lọc phòng chiếu chưa xuất bản (trang_thai = 0)
    const phongChieuChuaXuatBan =
        phongchieus?.filter((pc: PhongChieu) => Number(pc.trang_thai) === 0) || [];

    const handleDelete = (id: number) => {
        Swal.fire({
            title: "Xác nhận xóa?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) deletePhongChieu.mutate(id);
        });
    };

    const handleUpdate = (id: number, currentName: string) => {
        Swal.fire({
            title: "Cập nhật tên phòng chiếu",
            input: "text",
            inputValue: currentName,
            inputPlaceholder: "Nhập tên mới...",
            showCancelButton: true,
            confirmButtonText: "Lưu",
            cancelButtonText: "Hủy",
            preConfirm: (value) => {
                if (!value.trim()) {
                    Swal.showValidationMessage("Tên phòng chiếu không được để trống!");
                }
                return value;
            },
        }).then((result) => {
            if (result.isConfirmed) {
                updatePhongChieu.mutate({
                    id,
                    values: { ten_phong: result.value },
                });
            }
        });
    };

    return (
        <div className="container p-4">
            <h4 className="mb-4 text-center">🎥 Phòng chiếu chưa xuất bản</h4>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle mx-auto">
                    <thead className="table-light text-center">
                        <tr>
                            <th>ID</th>
                            <th>Tên phòng</th>
                            <th>Loại sơ đồ</th>
                            <th>Hàng thường</th>
                            <th>Hàng VIP</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phongChieuChuaXuatBan.length ? (
                            phongChieuChuaXuatBan.map((pc: PhongChieu) => (
                                <tr key={pc.id}>
                                    <td className="text-center">{pc.id}</td>
                                    <td>{pc.ten_phong}</td>
                                    <td>{pc.loai_so_do}</td>
                                    <td className="text-center">{pc.hang_thuong}</td>
                                    <td className="text-center">{pc.hang_vip}</td>
                                    <td className="text-center">
                                        <span className="badge bg-secondary">Chưa xuất bản</span>
                                    </td>
                                    <td className="text-center">
                                        {new Date(pc.created_at).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group">
                                            <button
                                                className="btn btn-outline-secondary btn-sm">
                                                Xem bản đồ ghế
                                            </button>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleUpdate(pc.id, pc.ten_phong)}
                                                disabled={updatePhongChieu.isPending}
                                            >
                                                {updatePhongChieu.isPending ? "Đang lưu..." : "Cập nhật"}
                                            </button>

                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(pc.id)}
                                                disabled={deletePhongChieu.isPending}
                                            >
                                                {deletePhongChieu.isPending ? "Đang xóa..." : "Xóa"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center text-muted py-3">
                                    Không có phòng chiếu nào chưa xuất bản.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
