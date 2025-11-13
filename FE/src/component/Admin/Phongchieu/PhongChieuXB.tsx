import { useState, useMemo } from "react";
import { useListPhongChieuTH1 } from "../../../hook/PhongChieuHook";
import type { PhongChieu } from "../../../types/phongchieu";
import SoDoGhe from "./SoDoGhe";

const ITEMS_PER_PAGE = 5;

export default function PhongChieuList() {
  const { data: phongChieuDaXuatBan, isLoading } = useListPhongChieuTH1();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPhongChieus = useMemo(() => {
    if (!phongChieuDaXuatBan) return [];
    return phongChieuDaXuatBan.filter((pc: PhongChieu) =>
      pc.ten_phong.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [phongChieuDaXuatBan, searchTerm]);

  const paginatedPhongChieus = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPhongChieus.slice(start, end);
  }, [filteredPhongChieus, currentPage]);

  const totalPages = Math.ceil(filteredPhongChieus.length / ITEMS_PER_PAGE);


  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách phòng chiếu...</p>;

  const viewSoDoGhe = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🎬 Danh sách phòng chiếu đã xuất bản</h4>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên phòng..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle mx-auto">
          <thead className="table-light text-center">
            <tr>
              <th>STT</th>
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
            {paginatedPhongChieus.length > 0 ? (
              paginatedPhongChieus.map((pc: PhongChieu, index: number) => (
                <tr key={pc.id}>
                  <td className="text-center">

                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
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
                  Không tìm thấy phòng chiếu nào đã xuất bản.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
            </li>
            <li className="page-item active">
              <span className="page-link">{currentPage} / {totalPages}</span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </li>
          </ul>
        </nav>
      )}

      {open && selectedId && (
        <SoDoGhe open={open} onClose={() => setOpen(false)} id={selectedId} />
      )}
    </div>
  );
}