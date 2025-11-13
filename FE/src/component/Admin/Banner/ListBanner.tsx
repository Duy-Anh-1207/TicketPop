// src/component/Admin/Banner/ListBanner.tsx
// --- CÓ THÊM LOGIC LỌC & PHÂN TRANG (CLIENT-SIDE) ---

import { useState, useMemo } from "react"; // 1. THÊM useState, useMemo
import { useListBanners, useUpdateBanner, useDeleteBanner } from "../../../hook/BannerHook";
import Swal from "sweetalert2";
import type { Banner } from "../../../types/banner";
import { useNavigate } from "react-router-dom"; // 2. THÊM useNavigate

const ITEMS_PER_PAGE = 5; // <-- 3. ĐỊNH NGHĨA SỐ ITEM MỖI TRANG

export default function BannerList() {
  const navigate = useNavigate(); // 4. Khởi tạo navigate

  // 5. GIỮ NGUYÊN HOOK LẤY TẤT CẢ DATA
  const { data: allBanners, isLoading } = useListBanners(); 
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  // 6. THÊM STATE CHO LỌC VÀ TRANG
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 7. LOGIC LỌC (THEO TIÊU ĐỀ) BẰNG useMemo
  const filteredBanners = useMemo(() => {
    if (!allBanners) return [];
    return allBanners.filter((banner: Banner) =>
      banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allBanners, searchTerm]);

  // 8. LOGIC PHÂN TRANG BẰNG useMemo
  const paginatedBanners = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredBanners.slice(start, end);
  }, [filteredBanners, currentPage]);

  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);


  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách banner...</p>;

  // ... (các hàm handleDelete, handleEdit giữ nguyên) ...
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBanner.mutate(id, {
          onSuccess: () => Swal.fire("✅ Đã xóa banner!", "", "success"),
        });
      }
    });
  };

  const handleEdit = (banner: Banner) => {
  Swal.fire({
    title: "✏️ Sửa thông tin banner",
    html: `
      <div class="text-start">
        <label class="form-label">Tiêu đề</label>
        <input id="title" class="form-control mb-2" value="${banner.title}" />

        <label class="form-label">Link</label>
        <input id="link_url" class="form-control mb-2" value="${banner.link_url ?? ''}" />

        <label class="form-label">Ngày bắt đầu</label>
        <input id="start_date" type="date" class="form-control mb-2"
               value="${banner.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : ''}" />

        <label class="form-label">Ngày kết thúc</label>
        <input id="end_date" type="date" class="form-control mb-2"
               value="${banner.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : ''}" />

        <label class="form-label">Ảnh</label>
        <input id="image" type="file" class="form-control mb-2" />
        <img src="${banner.image_url.startsWith('http') ? banner.image_url : `http://127.0.0.1:8000${banner.image_url}`}" alt="preview" style="max-width:100%;border-radius:8px;margin-top:8px"/>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Lưu thay đổi",
    cancelButtonText: "Hủy",
    preConfirm: () => {
      const title = (document.getElementById("title") as HTMLInputElement)?.value;
      const link_url = (document.getElementById("link_url") as HTMLInputElement)?.value;
      const start_date = (document.getElementById("start_date") as HTMLInputElement)?.value;
      const end_date = (document.getElementById("end_date") as HTMLInputElement)?.value;
      const image = (document.getElementById("image") as HTMLInputElement)?.files?.[0];

      if (!title.trim()) {
        Swal.showValidationMessage("Tiêu đề không được để trống");
        return false;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("link_url", link_url);
      formData.append("start_date", start_date);
      formData.append("end_date", end_date);
      if (image) formData.append("image_url", image);

      return formData;
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      updateBanner.mutate(
        { id: banner.id, values: result.value },
        {
          onSuccess: () => Swal.fire("✅ Cập nhật thành công!", "", "success"),
          onError: () => Swal.fire("❌ Cập nhật thất bại!", "", "error"),
        }
      );
    }
  });
};


  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">🖼️ Quản lý Banner</h4>
        <button 
          className="btn btn-success"
          onClick={() => navigate("/admin/banners/them-moi")}
        >
          ➕ Thêm mới banner
        </button>
      </div>

      {/* 9. THÊM UI BỘ LỌC */}
      <div className="mb-3">
        <input 
          type="text"
          className="form-control"
          placeholder="Tìm theo tiêu đề banner..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset về trang 1 khi tìm
          }}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>STT</th>
              <th>Tiêu đề</th>
              <th>Ảnh</th>
              <th>Link</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* 10. SỬA `banners` THÀNH `paginatedBanners` */}
            {paginatedBanners.length > 0 ? (
              paginatedBanners.map((banner: Banner, index: number) => (
                <tr key={banner.id}>
                  <td className="text-center">
                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
                  <td>{banner.title}</td>
                  <td className="text-center">
                    <img
                      src={banner.image_url.startsWith('http') ? banner.image_url : `http://127.0.0.1:8000${banner.image_url}`}
                      alt={banner.title}
                      className="rounded"
                      style={{ width: "120px", height: "60px", objectFit: "cover" }}
                    />
                  </td>
                  <td>
                    <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                      {banner.link_url}
                    </a>
                  </td>
                  <td className="text-center">
                    {banner.start_date ? new Date(banner.start_date).toLocaleDateString("vi-VN") : 'N/A'}
                  </td>
                  <td className="text-center">
                    {banner.end_date ? new Date(banner.end_date).toLocaleDateString("vi-VN") : 'N/A'}
                  </td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(banner)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  Không tìm thấy banner nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 11. THÊM UI PHÂN TRANG */}
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