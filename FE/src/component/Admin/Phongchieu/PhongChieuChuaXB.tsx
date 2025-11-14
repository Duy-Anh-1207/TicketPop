import {
  useDeletePhongChieu,
  useUpdatePhongChieu,
  useListPhongChieuTH0,
} from "../../../hook/PhongChieuHook";
import Swal from "sweetalert2";
import type { PhongChieu } from "../../../types/phongchieu";
import { useState, useMemo } from "react";
import SoDoGhe from "./SoDoGhe";

const ITEMS_PER_PAGE = 5; 

export default function PhongChieuChuaXuatBanList() {
  const { data: phongchieus, isLoading } = useListPhongChieuTH0();
  const deletePhongChieu = useDeletePhongChieu();
  const updatePhongChieu = useUpdatePhongChieu();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);


  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPhongChieus = useMemo(() => {
    if (!phongchieus) return []; 
    return phongchieus.filter((pc: PhongChieu) =>
      pc.ten_phong.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [phongchieus, searchTerm]);

  const paginatedPhongChieus = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPhongChieus.slice(start, end);
  }, [filteredPhongChieus, currentPage]);

  const totalPages = Math.ceil(filteredPhongChieus.length / ITEMS_PER_PAGE);


  if (isLoading)
    return <p className="text-center mt-4">Đang tải danh sách...</p>;

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
  const viewSoDoGhe = (id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🎥 Phòng chiếu chưa xuất bản</h4>
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
                    <span className="badge bg-secondary">Chưa xuất bản</span>
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
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleUpdate(pc.id, pc.ten_phong)}
                        disabled={updatePhongChieu.isPending}
                      >
                        {updatePhongChieu.isPending
                          ? "Đang lưu..."
                          : "Cập nhật"}
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
                  Không tìm thấy phòng chiếu nào chưa xuất bản.
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