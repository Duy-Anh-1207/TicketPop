

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

  const handleEdit = (food: Food) => {
    Swal.fire({
      title: "✏️ Sửa tên món ăn",
      input: "text",
      inputLabel: "Tên món ăn",
      inputValue: food.ten_do_an,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage("Tên món ăn không được để trống");
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateFood.mutate(
          { id: food.id, values: { ten_do_an: result.value } },
          {
            onSuccess: () => {
              Swal.fire("✅ Đã cập nhật!", "", "success");
            },
          }
        );
      }
    });
  };

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">🍽️ Quản lý món ăn</h4>
        
        {canCreate && (
          <button 
            className="btn btn-success"
            onClick={() => navigate("/admin/foods/them-moi")}
          >
            ➕ Thêm món ăn
          </button>
        )}
      </div>
      
      <div className="mb-3">
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
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>STT</th>
              <th>Tên món ăn</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Số lượng tồn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFoods.length > 0 ? (
              paginatedFoods.map((food: Food, index: number) => (
                <tr key={food.id}>
                  <td className="text-center">
                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
                  <td>{food.ten_do_an}</td>
                  <td className="text-end">{food.gia_nhap.toLocaleString()} ₫</td>
                  <td className="text-end">{food.gia_ban.toLocaleString()} ₫</td>
                  <td className="text-center">{food.so_luong_ton}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      {canEdit && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(food)}
                        >
                          Cập nhật
                        </button>
                      )}

                      {canDeletePerm && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(food.id)}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  Không tìm thấy món ăn nào.
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