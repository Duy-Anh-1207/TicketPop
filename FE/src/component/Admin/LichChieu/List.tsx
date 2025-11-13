
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useListLichChieu } from "../../../hook/useLichChieu";
import type { LichChieu } from "../../../types/lichchieu";
import axios from "axios";

const ITEMS_PER_PAGE = 5; 

export default function LichChieuList() {
  const navigate = useNavigate();
  const { data: allLichChieu, isLoading, refetch } = useListLichChieu();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#f37b63",
    });
    if (result.isConfirmed) {
      Swal.fire({
        title: "Đang xóa...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/lich-chieu/${id}`
        );
        Swal.fire("🎉 Thành công", response.data.message, "success");
        refetch();
      } catch (error: any) {
        console.error("Lỗi khi xóa lịch chiếu:", error.response || error);
        Swal.fire(
          "Lỗi",
          error.response?.data?.message || "Không thể xóa lịch chiếu!",
          "error"
        );
      }
    }
  };

  if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          onClick={() => navigate(`/admin/lich-chieu/them-moi`)}
          className="btn btn-success rounded"
        >
          Thêm lịch chiếu
        </button>
        <div className="w-50">
          <input 
            type="text"
            className="form-control"
            placeholder="Tìm theo tên phim hoặc tên phòng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered mx-auto">
          <thead className="table-light">
            <tr>
              <th className="text-center">STT</th>
              <th className="text-center">Phim</th>
              <th className="text-center">Phòng chiếu</th>
              <th className="text-center">Phiên bản</th>
              <th className="text-center">Giờ chiếu</th>
              <th className="text-center">Giờ kết thúc</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLichChieu.length > 0 ? (
              paginatedLichChieu.map((lichChieu: LichChieu, index: number) => {
                const phimName = lichChieu.phim?.ten_phim || "Không xác định";
                const phongName = lichChieu.phong?.ten_phong || "Không xác định";
                const phienBanName = lichChieu.phien_ban?.the_loai || "Không có phiên bản";

                return (
                  <tr key={lichChieu.id}>
                    <td className="text-center">
                      {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                    </td>
                    <td className="text-center">{phimName}</td>
                    <td className="text-center">{phongName}</td>
                    <td className="text-center">{phienBanName}</td>
                    <td className="text-center">
                      {new Date(lichChieu.gio_chieu).toLocaleString()}
                    </td>
                    <td className="text-center">
                      {new Date(lichChieu.gio_ket_thuc).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <div className="dropup position-static">
                        <button
                          className="btn btn-outline-secondary btn-sm rounded"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <ul className="dropdown-menu" style={{ minWidth: "220px" }}>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => navigate(`/admin/lich-chieu/${lichChieu.id}`)}
                            >
                              Xem chi tiết
                            </button>
                             <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDelete(lichChieu.id)}
                            >
                              Xóa
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              // Nếu không có kết quả lọc
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  Không tìm thấy lịch chiếu nào.
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

    </div>
  );
}