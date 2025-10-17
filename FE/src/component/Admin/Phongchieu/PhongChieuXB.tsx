import { useState } from "react";
import { useListPhongChieuTH1 } from "../../../hook/PhongChieuHook";
import type { PhongChieu } from "../../../types/phongchieu";
import SoDoGhe from "./SoDoGhe";

export default function PhongChieuList() {
  const { data: phongchieus, isLoading } = useListPhongChieuTH1();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách phòng chiếu...</p>;

  // Lọc chỉ những phòng chiếu đã xuất bản
  const phongChieuDaXuatBan =
    phongchieus?.filter((pc: PhongChieu) => Number(pc.trang_thai) === 1) || [];

  const viewSoDoGhe = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🎬 Danh sách phòng chiếu đã xuất bản</h4>

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
            {phongChieuDaXuatBan.length ? (
              phongChieuDaXuatBan.map((pc: PhongChieu) => (
                <tr key={pc.id}>
                  <td className="text-center">{pc.id}</td>
                  <td>{pc.ten_phong}</td>
                  <td>{pc.loai_so_do}</td>
                  <td className="text-center">{pc.hang_thuong}</td>
                  <td className="text-center">{pc.hang_vip}</td>
                  <td className="text-center">
                    <span className="badge bg-success">Đã xuất bản</span>
                  </td>
                  <td className="text-center">
                    {new Date(pc.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        onClick={() => viewSoDoGhe(pc.id)}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Xem bản đồ ghế
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  Không có phòng chiếu nào đã xuất bản.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ✅ chỉ hiển thị khi open = true */}
      {open && selectedId && (
        <SoDoGhe open={open} onClose={() => setOpen(false)} id={selectedId} />
      )}
    </div>
  );
}
