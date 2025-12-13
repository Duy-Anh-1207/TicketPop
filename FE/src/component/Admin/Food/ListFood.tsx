import { useState, useMemo } from "react";
import { useListFood, useUpdateFood, useDeleteFood } from "../../../hook/FoodHook";
import Swal from "sweetalert2";
import type { Food } from "../../../types/foods";
import { canAccess } from "../../../utils/permissions";
import { useNavigate } from "react-router-dom";

const MENU_ID = 5;
const ITEMS_PER_PAGE = 5;

export default function FoodList() {
  const navigate = useNavigate();

  const { data: allFoods, isLoading } = useListFood();
  const updateFood = useUpdateFood();
  const deleteFood = useDeleteFood();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  if (isLoading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const canEdit = canAccess(MENU_ID, 2);
  const canDeletePerm = canAccess(MENU_ID, 3);
  const canCreate = canAccess(MENU_ID, 1);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) deleteFood.mutate(id);
    });
  };

  const handleEdit = (food: Food) => {
    Swal.fire({
      title: `✏️ Cập nhật: ${food.ten_do_an}`,
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label fw-bold">Tên món ăn</label>
            <input id="swal-input1" class="form-control" value="${food.ten_do_an}">
          </div>
          <div class="row g-2">
            <div class="col-6 mb-3">
              <label class="form-label fw-bold">Giá nhập</label>
              <input id="swal-input2" type="number" class="form-control" value="${Number(food.gia_nhap)}">
            </div>
            <div class="col-6 mb-3">
              <label class="form-label fw-bold">Giá bán</label>
              <input id="swal-input3" type="number" class="form-control" value="${Number(food.gia_ban)}">
            </div>
            <div class="col-12 mb-3">
              <label class="form-label fw-bold">Số lượng tồn</label>
              <input id="swal-input4" type="number" class="form-control" value="${food.so_luong_ton}">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Lưu thay đổi",
      cancelButtonText: "Hủy",
      focusConfirm: false,
      preConfirm: () => {
        const ten_do_an = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const gia_nhap = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const gia_ban = (document.getElementById('swal-input3') as HTMLInputElement).value;
        const so_luong_ton = (document.getElementById('swal-input4') as HTMLInputElement).value;

        if (!ten_do_an || !gia_nhap || !gia_ban || !so_luong_ton) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
          return false;
        }

        return { 
          ten_do_an, 
          gia_nhap: Number(gia_nhap), 
          gia_ban: Number(gia_ban), 
          so_luong_ton: Number(so_luong_ton) 
        };
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
    <div className="container py-4">
      {/* Header & Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 fw-bold text-primary">🍽️ Quản lý món ăn</h4>
        {canCreate && (
          <button
            className="btn btn-success shadow-sm"
            onClick={() => navigate("/admin/foods/them-moi")}
          >
            <span className="me-2">➕</span> Thêm món mới
          </button>
        )}
      </div>

      {/* Card bao quanh nội dung chính */}
      <div className="card shadow border-0 rounded-3">
        <div className="card-body">
          
          {/* Search Bar - Stylized */}
          <div className="row mb-3">
            <div className="col-md-6 col-12">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary">
                <tr className="text-nowrap">
                  <th className="text-center" style={{ width: "50px" }}>STT</th>
                  <th>Tên món ăn</th>
                  <th className="text-center">Ảnh</th>
                  <th className="text-end">Giá nhập</th>
                  <th className="text-end">Giá bán</th>
                  <th className="text-center">Tồn kho</th>
                  <th className="text-center" style={{ width: "150px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFoods.length > 0 ? (
                  paginatedFoods.map((food: Food, index: number) => {
                    const imageUrl = food.image
                      ? `${import.meta.env.VITE_API_BASE_URL}${food.image}`
                      : null;

                    return (
                      <tr key={food.id}>
                        <td className="text-center text-muted fw-bold">
                          {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                        </td>
                        <td className="fw-semibold">{food.ten_do_an}</td>
                        <td className="text-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={food.ten_do_an}
                              className="rounded shadow-sm"
                              style={{
                                width: 50,
                                height: 50,
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <span className="text-muted small">No Image</span>
                          )}
                        </td>
                        <td className="text-end text-secondary">{formatCurrency(Number(food.gia_nhap))}</td>
                        <td className="text-end text-success fw-bold">{formatCurrency(Number(food.gia_ban))}</td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${food.so_luong_ton > 10 ? 'bg-light text-dark border' : 'bg-warning text-dark'}`}>
                            {food.so_luong_ton}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {canEdit && (
                              <button
                                className="btn btn-sm btn-outline-primary border-0"
                                onClick={() => handleEdit(food)}
                                title="Cập nhật"
                              >
                                ✏️
                              </button>
                            )}
                            {canDeletePerm && (
                              <button
                                className="btn btn-sm btn-outline-danger border-0"
                                onClick={() => handleDelete(food.id)}
                                title="Xóa"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-5">
                      <div className="d-flex flex-column align-items-center">
                        <span style={{ fontSize: "2rem" }}>🍲</span>
                        <span className="mt-2">Không tìm thấy món ăn nào phù hợp.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer của Card chứa Pagination */}
        {totalPages > 1 && (
            <div className="card-footer bg-white border-top-0 py-3">
             <nav>
               <ul className="pagination justify-content-center mb-0">
                 <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                   <button
                     className="page-link border-0"
                     onClick={() => setCurrentPage((p) => p - 1)}
                     disabled={currentPage === 1}
                   >
                     &laquo; Trước
                   </button>
                 </li>
                 <li className="page-item active mx-2">
                   <span className="page-link rounded-pill px-3">
                     {currentPage} / {totalPages}
                   </span>
                 </li>
                 <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                   <button
                     className="page-link border-0"
                     onClick={() => setCurrentPage((p) => p + 1)}
                     disabled={currentPage === totalPages}
                   >
                     Sau &raquo;
                   </button>
                 </li>
               </ul>
             </nav>
            </div>
        )}
      </div>
    </div>
  );
}