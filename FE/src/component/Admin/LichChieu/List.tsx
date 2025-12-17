import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLichTheoPhong, useListLichChieu } from "../../../hook/useLichChieu";
import type { LichChieu } from "../../../types/lichchieu";
import axios from "axios";

const ITEMS_PER_PAGE = 5;

export default function LichChieuList() {
  const navigate = useNavigate();
  const { data: allLichChieu, isLoading, refetch } = useListLichChieu();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhong, setSelectedPhong] = useState<number | null>(null);

  // 👉 lấy lịch theo phòng khi click
  const { data: lichTheoPhong } = useLichTheoPhong(selectedPhong);

  const filteredLichChieu = useMemo(() => {
    if (!allLichChieu) return [];
    return allLichChieu.filter((lichChieu: LichChieu) => {
      const phimName = lichChieu.phim?.ten_phim || "";
      const phongName = lichChieu.phong?.ten_phong || "";
      const search = searchTerm.toLowerCase();
      return (
        phimName.toLowerCase().includes(search) ||
        phongName.toLowerCase().includes(search)
      );
    });
  }, [allLichChieu, searchTerm]);

  const paginatedLichChieu = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredLichChieu.slice(start, end);
  }, [filteredLichChieu, currentPage]);

  const totalPages = Math.ceil(filteredLichChieu.length / ITEMS_PER_PAGE);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Lịch chiếu sẽ được đưa vào thùng rác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/lich-chieu/${id}`
        );
        Swal.fire("🎉 Thành công", response.data.message, "success");
        refetch();
      } catch {
        Swal.fire("Lỗi", "Không thể xóa lịch chiếu!", "error");
      }
    }
  };

  if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

  return (
    <div className="container p-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          onClick={() => navigate(`/admin/lich-chieu/them-moi`)}
          className="btn btn-success"
        >
          Thêm lịch chiếu
        </button>

        <input
          className="form-control w-50"
          placeholder="Tìm theo tên phim hoặc phòng..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Phim</th>
            <th>Phòng chiếu</th>
            <th>Phiên bản</th>
            <th>Giờ chiếu</th>
            <th>Giờ kết thúc</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {paginatedLichChieu.map((lichChieu, index) => (
            <tr key={lichChieu.id}>
              <td>{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td>
              <td>{lichChieu.phim?.ten_phim}</td>

              {/* 👉 CLICK PHÒNG */}
              <td>
                <button
                  className="btn btn-link p-0"
                  onClick={() => setSelectedPhong(lichChieu.phong?.id ?? null)}
                >
                  {lichChieu.phong?.ten_phong}
                </button>
              </td>

              <td>{lichChieu.phien_ban?.the_loai}</td>
              <td>{new Date(lichChieu.gio_chieu).toLocaleString()}</td>
              <td>{new Date(lichChieu.gio_ket_thuc).toLocaleString()}</td>

              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(lichChieu.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Trước
          </button>

          <span className="align-self-center">
            {currentPage}/{totalPages}
          </span>

          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      )}

      {/* 👉 HIỂN THỊ KHUNG GIỜ THEO PHÒNG */}
      {selectedPhong && (
        <div className="mt-4">
          <h5 className="mb-3">
            🎥 Lịch chiếu phòng: <span className="text-primary">{paginatedLichChieu.find(lc => lc.phong?.id === selectedPhong)?.phong?.ten_phong}</span>
          </h5>

          {lichTheoPhong?.length > 0 ? (
            <div className="row g-3">
              {lichTheoPhong.map((lc: LichChieu) => {
                const ngayChieu = new Date(lc.gio_chieu).toLocaleDateString("vi-VN");
                const gioBatDau = new Date(lc.gio_chieu).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const gioKetThuc = new Date(lc.gio_ket_thuc).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div className="col-md-6 col-lg-4" key={lc.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="card-title mb-2">
                          🎬 {lc.phim?.ten_phim}
                        </h6>

                        <div className="mb-2 text-muted">
                          📅 {ngayChieu}
                        </div>

                        <div>
                          <span className="badge bg-success me-2">
                            {gioBatDau}
                          </span>
                          <span className="badge bg-secondary">
                            {gioKetThuc}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="alert alert-warning">
              Phòng này hiện chưa có lịch chiếu.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
