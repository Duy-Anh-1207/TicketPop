import {
  useDeletePhongChieu,
  useListPhongChieuTH0,
  useChangeStatusPhongChieu,
  useUpdatePhongChieu,
} from "../../../hook/PhongChieuHook";
import Swal from "sweetalert2";
import type { PhongChieu } from "../../../types/phongchieu";
import { useState, useMemo } from "react";
import SoDoGhe from "./SoDoGhe";

const ITEMS_PER_PAGE = 5;

export default function PhongChieuChuaXuatBanList() {
  const { data: phongchieus, isLoading } = useListPhongChieuTH0();
  const deletePhongChieu = useDeletePhongChieu();
  const changeStatusPhongChieu = useChangeStatusPhongChieu();
  const updatePhongChieu = useUpdatePhongChieu();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  // menu đang mở
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // cập nhật chiếu phim
  const [chieuPhimInput, setChieuPhimInput] = useState<Record<number, string>>(
    {}
  );

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
    return filteredPhongChieus.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPhongChieus, currentPage]);

  if (isLoading) {
    return <p className="text-center mt-4">Đang tải...</p>;
  }

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    }).then((res) => {
      if (res.isConfirmed) deletePhongChieu.mutate(id);
    });
  };

  const handleChangeStatus = (id: number) => {
    Swal.fire({
      title: "Xuất bản phòng chiếu?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xuất bản",
    }).then((res) => {
      if (res.isConfirmed) changeStatusPhongChieu.mutate(id);
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-3 text-center">🎥 Phòng chiếu chưa xuất bản</h4>

      <input
        className="form-control mb-3"
        placeholder="Tìm theo tên phòng..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* ❌ KHÔNG dùng table-responsive */}
      <table className="table table-bordered align-middle text-center">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Tên phòng</th>
            <th>Loại sơ đồ</th>
            <th>Chiếu phim</th>
            <th>Hàng thường</th>
            <th>Hàng VIP</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {paginatedPhongChieus.map((pc, index) => (
            <tr key={pc.id}>
              <td>{index + 1}</td>
              <td>{pc.ten_phong}</td>
              <td>{pc.loai_so_do}</td>
              <td>{pc.chieu_phim}</td>
              <td>{pc.hang_thuong}</td>
              <td>{pc.hang_vip}</td>
              <td>
                <span className="badge bg-secondary">Chưa xuất bản</span>
              </td>
              <td>{new Date(pc.created_at).toLocaleDateString("vi-VN")}</td>

              {/* ===== MENU ACTION ===== */}
              <td style={{ position: "relative" }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() =>
                    setOpenMenuId(openMenuId === pc.id ? null : pc.id)
                  }
                >
                  ⋮
                </button>

                {openMenuId === pc.id && (
                  <div
                    className="border rounded bg-white shadow p-2"
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      width: 220,
                      zIndex: 9999,
                    }}
                  >
                    <button
                      className="btn btn-sm btn-light w-100 mb-1"
                      onClick={() => {
                        setSelectedId(pc.id);
                        setOpen(true);
                        setOpenMenuId(null);
                      }}
                    >
                      Xem bản đồ ghế
                    </button>

                    <button
                      className="btn btn-sm btn-success w-100 mb-1"
                      onClick={() => {
                        handleChangeStatus(pc.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Xuất bản
                    </button>

                    <button
                      className="btn btn-sm btn-danger w-100 mb-2"
                      onClick={() => {
                        handleDelete(pc.id);
                        setOpenMenuId(null);
                      }}
                    >
                      Xóa
                    </button>

                    <hr className="my-2" />

                    <div className="text-start mb-1 fw-semibold">
                      Cập nhật chiếu phim
                    </div>

                    <div className="d-flex gap-1">
                      <select
                        className="form-select form-select-sm"
                        value={chieuPhimInput[pc.id] ?? pc.chieu_phim}
                        onChange={(e) =>
                          setChieuPhimInput({
                            ...chieuPhimInput,
                            [pc.id]: e.target.value,
                          })
                        }
                      >
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="IMAX">IMAX</option>
                      </select>

                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          updatePhongChieu.mutate({
                            id: pc.id,
                            values: {
                              chieu_phim:
                                chieuPhimInput[pc.id] ?? pc.chieu_phim,
                            },
                          });
                          setOpenMenuId(null);
                        }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}

          {paginatedPhongChieus.length === 0 && (
            <tr>
              <td colSpan={9} className="text-muted py-3">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {open && selectedId && (
        <SoDoGhe open={open} onClose={() => setOpen(false)} id={selectedId} />
      )}
    </div>
  );
}
