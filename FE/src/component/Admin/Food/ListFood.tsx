import { useState, useMemo } from "react";
import { useListFood, useUpdateFood, useDeleteFood } from "../../../hook/FoodHook";
import Swal from "sweetalert2";
import type { Food } from "../../../types/foods";
import { canAccess } from "../../../utils/permissions";
import { useNavigate } from "react-router-dom";

// Đảm bảo biến môi trường đã đúng
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MENU_ID = 5;
const ITEMS_PER_PAGE = 5;

export default function FoodList() {
  const navigate = useNavigate();

  const { data: allFoods, isLoading } = useListFood();
  const updateFood = useUpdateFood();
  const deleteFood = useDeleteFood();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Format tiền tệ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const filteredFoods = useMemo(() => {
    if (!allFoods) return [];
    return allFoods.filter((food: Food) =>
      food.ten_do_an.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFoods, searchTerm]);

  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredFoods.slice(start, end);
  }, [filteredFoods, currentPage]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE);

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

  const canEdit = canAccess(MENU_ID, 2);
  const canDeletePerm = canAccess(MENU_ID, 3);
  const canCreate = canAccess(MENU_ID, 1);

  // Xử lý Xóa
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc3545",
    }).then((result) => {
      if (result.isConfirmed) deleteFood.mutate(id);
    });
  };

  // Popup Cập nhật (Đã thêm Mô Tả & Chia 2 cột)
  const handleEdit = (food: Food) => {
    // Logic lấy ảnh preview
    const currentImageUrl = food.image ? `${API_BASE_URL}${food.image}` : 'https://via.placeholder.com/100x100?text=No+Image';
    
    // Lấy mô tả hiện tại (nếu null thì để rỗng)
    const currentMoTa = food.mo_ta || "";

    Swal.fire({
      title: `✏️ Cập nhật: ${food.ten_do_an}`,
      width: '800px', // Tăng độ rộng để chứa 2 cột
      html: `
        <div class="text-start">
          <div class="row g-3">
              <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Tên món ăn <span class="text-danger">*</span></label>
                    <input id="swal-ten" class="form-control" value="${food.ten_do_an}">
                  </div>

                  <div class="row g-2">
                    <div class="col-6 mb-3">
                      <label class="form-label fw-bold">Giá nhập</label>
                      <input id="swal-gia-nhap" type="number" class="form-control" value="${Number(food.gia_nhap)}">
                    </div>
                    <div class="col-6 mb-3">
                      <label class="form-label fw-bold">Giá bán <span class="text-danger">*</span></label>
                      <input id="swal-gia-ban" type="number" class="form-control fw-bold text-success" value="${Number(food.gia_ban)}">
                    </div>
                    <div class="col-12 mb-3">
                       <label class="form-label fw-bold">Tồn kho</label>
                       <input id="swal-ton-kho" type="number" class="form-control" value="${food.so_luong_ton}">
                    </div>
                  </div>
              </div>

              <div class="col-md-6">
                  <div class="mb-3">
                     <label class="form-label fw-bold">Mô tả</label>
                     <textarea id="swal-mo-ta" class="form-control" rows="3" placeholder="Nhập mô tả món ăn...">${currentMoTa}</textarea>
                  </div>

                  <div class="mb-3 border-top pt-2">
                     <label class="form-label fw-bold">Hình ảnh</label>
                     <div class="d-flex align-items-center gap-3">
                        <img id="swal-preview-img" src="${currentImageUrl}" 
                             alt="Preview" class="img-thumbnail" 
                             style="width: 80px; height: 80px; object-fit: cover"
                             onerror="this.src='https://placehold.co/80?text=N/A'">
                        <div class="flex-grow-1">
                            <input id="swal-image-input" type="file" class="form-control text-sm" accept="image/*"
                                onchange="document.getElementById('swal-preview-img').src = window.URL.createObjectURL(this.files[0])">
                        </div>
                     </div>
                  </div>
              </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Lưu thay đổi",
      cancelButtonText: "Hủy",
      focusConfirm: false,
      preConfirm: () => {
        const ten_do_an = (document.getElementById('swal-ten') as HTMLInputElement).value;
        const gia_nhap = (document.getElementById('swal-gia-nhap') as HTMLInputElement).value;
        const gia_ban = (document.getElementById('swal-gia-ban') as HTMLInputElement).value;
        const so_luong_ton = (document.getElementById('swal-ton-kho') as HTMLInputElement).value;
        const imageInput = document.getElementById('swal-image-input') as HTMLInputElement;
        
        // Lấy giá trị mô tả
        const mo_ta = (document.getElementById('swal-mo-ta') as HTMLTextAreaElement).value;

        if (!ten_do_an || !gia_ban) {
          Swal.showValidationMessage('Vui lòng điền đủ thông tin!');
          return false;
        }

        const formData = new FormData();
        formData.append('_method', 'PUT'); // Quan trọng cho Backend PHP/Laravel
        
        formData.append('ten_do_an', ten_do_an);
        formData.append('gia_nhap', gia_nhap);
        formData.append('gia_ban', gia_ban);
        formData.append('so_luong_ton', so_luong_ton);
        formData.append('mo_ta', mo_ta); // Gửi mô tả lên server

        if (imageInput.files && imageInput.files[0]) {
            formData.append('image', imageInput.files[0]); 
        }

        return formData; 
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        updateFood.mutate(
          { id: food.id, values: result.value }, 
          { onSuccess: () => Swal.fire("✅ Đã cập nhật!", "", "success") }
        );
      }
    });
  };

  return (
    <div className="container p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0 fw-bold">🍽️ Quản lý món ăn</h4>
        {canCreate && (
          <button
            className="btn btn-success"
            onClick={() => navigate("/admin/foods/them-moi")}
          >
            ➕ Thêm món ăn
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-3 w-50">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên món ăn..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center align-middle shadow-sm bg-white rounded">
          <thead className="table-light">
            <tr>
              <th style={{ width: "50px" }}>STT</th>
              <th>Tên món ăn</th>
              <th>Ảnh</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Số lượng tồn</th>
              <th style={{ minWidth: "220px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFoods.length > 0 ? (
              paginatedFoods.map((food: Food, index: number) => {
                const imageUrl = food.image
                  ? `${API_BASE_URL}${food.image}`
                  : null;

                return (
                  <tr key={food.id}>
                    <td>{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td>
                    <td className="fw-semibold text-start">{food.ten_do_an}</td>
                    <td>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={food.ten_do_an}
                          className="img-thumbnail"
                          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "6px" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/60?text=N/A";
                            e.currentTarget.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center text-muted border rounded" style={{width: 60, height: 60, margin: '0 auto'}}>
                            <small>N/A</small>
                        </div>
                      )}
                    </td>
                    <td className="text-end fw-bold text-secondary">{formatCurrency(Number(food.gia_nhap))}</td>
                    <td className="text-end fw-bold text-success">{formatCurrency(Number(food.gia_ban))}</td>
                    <td>
                      <span className={`badge ${food.so_luong_ton > 10 ? 'bg-info' : 'bg-warning'}`}>
                        {food.so_luong_ton}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2 text-nowrap">
                        {canEdit && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(food)}
                          >
                            Cập nhật
                          </button>
                        )}
                        {canDeletePerm && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(food.id)}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-muted py-3">
                  Không tìm thấy món ăn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </button>
            </li>
            <li className="page-item active">
              <span className="page-link">
                {currentPage} / {totalPages}
              </span>
            </li>
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
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