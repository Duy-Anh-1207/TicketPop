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

  // ✅ Hàm format tiền tệ chuẩn Việt Nam
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

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) deleteFood.mutate(id);
    });
  };

  // 🆕 NÂNG CẤP: Popup sửa đầy đủ thông tin
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
    <div className="container p-4">
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

      {/* ✅ Thanh tìm kiếm gọn gàng (50% chiều rộng) */}
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

      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center align-middle shadow-sm bg-white rounded">
          <thead className="table-light">
            <tr>
              <th>STT</th>
              <th>Tên món ăn</th>
              <th>Ảnh</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Số lượng tồn</th>
              <th>Hành động</th>
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
                    <td>{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td>
                    <td className="fw-semibold text-start">{food.ten_do_an}</td>
                    <td>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={food.ten_do_an}
                          className="img-thumbnail"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* ✅ Sử dụng hàm formatCurrency */}
                    <td className="text-end fw-bold text-secondary">{formatCurrency(Number(food.gia_nhap))}</td>
                    <td className="text-end fw-bold text-success">{formatCurrency(Number(food.gia_ban))}</td>
                    <td>
                      <span className={`badge ${food.so_luong_ton > 10 ? 'bg-info' : 'bg-warning'}`}>
                        {food.so_luong_ton}
                      </span>
                    </td>
                    <td className="d-flex justify-content-center gap-2">
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

      {/* Pagination giữ nguyên */}
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