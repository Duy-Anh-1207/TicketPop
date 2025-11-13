// src/component/Admin/Phim/ListPhim.tsx
// --- CÓ THÊM LOGIC LỌC & PHÂN TRANG (CLIENT-SIDE) ---

import { useState, useMemo } from "react"; // <-- 1. THÊM useState, useMemo
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useListPhim, useDeletePhim } from "../../../hook/PhimHook";
import { useListTheLoai } from "../../../hook/TheLoaiHook";
import { useListPhienBan } from "../../../hook/PhienBanHook";
import { canAccess } from "../../../utils/permissions";

const MENU_ID = 1; // menu_id cho Quản lý Phim
const ITEMS_PER_PAGE = 5; // <-- 2. ĐỊNH NGHĨA SỐ ITEM MỖI TRANG (bạn có thể đổi số này)

const DanhSachPhimTable = () => {
  const navigate = useNavigate();

  // 3. GIỮ NGUYÊN HOOK LẤY TẤT CẢ DATA
  const { data: allPhims, isLoading } = useListPhim({}); // <-- Đây là toàn bộ phim
  const { data: theloais, isLoading: loadingTheLoai } = useListTheLoai();
  const { data: phienbans, isLoading: loadingPhienBan } = useListPhienBan();
  const deletePhimMutation = useDeletePhim({});

  // 4. THÊM STATE CHO LỌC VÀ TRANG
  const [search, setSearch] = useState("");
  const [loaiSuat, setLoaiSuat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 5. LOGIC LỌC (THEO TÊN VÀ LOẠI SUẤT) BẰNG useMemo
  const filteredPhims = useMemo(() => {
    if (!allPhims) return []; // Nếu chưa có data thì trả về mảng rỗng
    return allPhims.filter((phim: any) => {
      const matchSearch = phim.ten_phim.toLowerCase().includes(search.toLowerCase());
      const matchLoaiSuat = !loaiSuat || phim.loai_suat_chieu === loaiSuat;
      return matchSearch && matchLoaiSuat;
    });
  }, [allPhims, search, loaiSuat]); // Chỉ tính toán lại khi `allPhims`, `search`, `loaiSuat` thay đổi

  // 6. LOGIC PHÂN TRANG BẰNG useMemo
  const paginatedPhims = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredPhims.slice(start, end); // Cắt mảng đã lọc
  }, [filteredPhims, currentPage]); // Chỉ tính toán lại khi `filteredPhims` hoặc `currentPage` thay đổi

  const totalPages = Math.ceil(filteredPhims.length / ITEMS_PER_PAGE);

  // ... (các hàm handle... giữ nguyên) ...
  const handleAdd = () => navigate("/admin/phim/create");
  const handleEdit = (id: number | string) => navigate(`/admin/phim/edit/${id}`);
  const handleDelete = (id: number | string) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa phim này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) deletePhimMutation.mutate(id);
    });
  };

  if (isLoading || loadingTheLoai || loadingPhienBan)
    return <p>Đang tải dữ liệu...</p>;

  // Quyền thao tác
  const canCreate = canAccess(MENU_ID, 1);
  const canEdit = canAccess(MENU_ID, 2);
  const canDeletePerm = canAccess(MENU_ID, 3);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🎬 Danh sách phim</h2>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleAdd}>
            ➕ Thêm phim
          </button>
        )}
      </div>

      {/* 7. THÊM UI BỘ LỌC */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên phim..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={loaiSuat}
            onChange={(e) => {
              setLoaiSuat(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi lọc
            }}
          >
            <option value="">Tất cả loại suất</option>
            <option value="Thường">Thường</option>
            <option value="Đặc biệt">Đặc biệt</option>
            <option value="Sớm">Sớm</option>
          </select>
        </div>
      </div>

      {/* 8. SỬA ĐIỀU KIỆN `allPhims` */}
      {allPhims && allPhims.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover text-center align-middle">
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Tên phim</th>
                <th>Ảnh poster</th>
                <th>Thể loại</th>
                <th>Phiên bản</th>
                <th>Thời lượng</th>
                <th>Ngày công chiếu</th>
                <th>Ngày kết thúc</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* 9. THAY `phims.map` THÀNH `paginatedPhims.map` */}
              {paginatedPhims.length > 0 ? (
                paginatedPhims.map((phim: any, index: number) => {
                  const theLoaiIds: number[] = Array.isArray(phim.the_loai_id)
                    ? phim.the_loai_id.map(Number)
                    : JSON.parse(phim.the_loai_id || "[]").map(Number);

                  const phienBanIds: number[] = Array.isArray(phim.phien_ban_id)
                    ? phim.phien_ban_id.map(Number)
                    : JSON.parse(phim.phien_ban_id || "[]").map(Number);

                  const theLoaiNames = theLoaiIds
                    .map(
                      (id) =>
                        theloais?.find((tl: any) => tl.id === id)?.ten_the_loai
                    )
                    .filter(Boolean)
                    .join(", ");

                  const phienBanNames = phienBanIds
                    .map(
                      (id) =>
                        phienbans?.find((pb: any) => pb.id === id)?.the_loai
                    )
                    .filter(Boolean)
                    .join(", ");

                  const imageUrl = phim.anh_poster
                    ? phim.anh_poster.startsWith("http")
                      ? phim.anh_poster
                      : `${import.meta.env.VITE_API_BASE_URL}/storage/${phim.anh_poster.replace("posters/", "posters/")}`
                    : null;


                  return (
                    <tr key={phim.id}>
                      <td>{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td> {/* Sửa STT */}
                      <td className="fw-semibold">{phim.ten_phim}</td>
                      <td>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="poster"
                            className="img-thumbnail"
                            style={{
                              width: 80,
                              height: 110,
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{theLoaiNames || "Không xác định"}</td>
                      <td>{phienBanNames || "Không xác định"}</td>
                      <td>
                        {phim.thoi_luong ? `${phim.thoi_luong} phút` : "—"}
                      </td>
                      <td>
                        {phim.ngay_cong_chieu
                          ? new Date(phim.ngay_cong_chieu).toLocaleDateString(
                            "vi-VN"
                          )
                          : "—"}
                      </td>
                      <td>
                        {phim.ngay_ket_thuc
                          ? new Date(phim.ngay_ket_thuc).toLocaleDateString(
                            "vi-VN"
                          )
                          : "—"}
                      </td>
                      <td
                        style={{
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={phim.mo_ta}
                      >
                        {phim.mo_ta || "—"}
                      </td>
                      <td className="d-flex justify-content-center gap-2">
                        {canEdit && (
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => handleEdit(phim.id)}
                          >
                            Sửa
                          </button>
                        )}
                        {canDeletePerm && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(phim.id)}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Nếu không có kết quả lọc
                <tr>
                  <td colSpan={10} className="text-center text-muted py-3">
                    Không tìm thấy phim nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Chưa có phim nào.</p>
      )}

      {/* 10. THÊM UI PHÂN TRANG */}
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
};

export default DanhSachPhimTable;