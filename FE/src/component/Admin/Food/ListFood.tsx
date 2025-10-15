import { useListFood, useUpdateFood, useDeleteFood } from "../../../hook/FoodHook";
import Swal from "sweetalert2";
import type { Food } from "../../../types/foods";

export default function FoodList() {
  const { data: foods, isLoading } = useListFood();
  const updateFood = useUpdateFood();
  const deleteFood = useDeleteFood();

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

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
      <h4 className="mb-4 text-center">🍽️ Quản lý món ăn</h4>
      {/* --- Danh sách --- */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>Tên món ăn</th>
              <th>Giá nhập</th>
              <th>Giá bán</th>
              <th>Số lượng tồn</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {foods?.length ? (
              foods.map((food: Food) => (
                <tr key={food.id}>
                  <td className="text-center">{food.id}</td>
                  <td>{food.ten_do_an}</td>
                  <td className="text-end">{food.gia_nhap.toLocaleString()}</td>
                  <td className="text-end">{food.gia_ban.toLocaleString()}</td>
                  <td className="text-center">{food.so_luong_ton}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(food)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(food.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  Không có món ăn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
