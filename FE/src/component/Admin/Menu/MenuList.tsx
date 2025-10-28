import { useListMenu, useUpdateMenu, useDeleteMenu } from "../../../hook/MenuHook";
import Swal from "sweetalert2";
import type { Menu } from "../../../types/menu";
import { useNavigate } from "react-router-dom";

export default function MenuList() {
  const { data: menus, isLoading } = useListMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const navigate = useNavigate();

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
      if (result.isConfirmed) deleteMenu.mutate(id);
    });
  };

  const handleEditName = (menu: Menu) => {
    Swal.fire({
      title: "✏️ Sửa tên chức năng",
      input: "text",
      inputLabel: "Tên chức năng",
      inputValue: menu.ten_chuc_nang,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage("Tên chức năng không được để trống");
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateMenu.mutate(
          { id: menu.id, values: { ten_chuc_nang: result.value } },
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
        <h4 className="mb-0">📋 Quản lý menu</h4>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/menu/create")} // đường dẫn tới trang thêm banner
        >
          ➕ Thêm mới menu
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>Mã chức năng</th>
              <th>Mã cha</th>
              <th>Tên chức năng</th>
              <th>Sate</th>
              <th>STT</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {menus?.length ? (
              menus.map((menu: Menu) => (
                <tr key={menu.id}>
                  <td className="text-center">{menu.id}</td>
                  <td>{menu.ma_chuc_nang}</td>
                  <td>{menu.ma_cha}</td>
                  <td>{menu.ten_chuc_nang}</td>
                  <td>{menu.state}</td>
                  <td>{menu.stt}</td>
                  <td className="text-center">
                    {menu.trangthai === 1 ? "Không hoạt động" : "Hoạt động"}
                  </td>

                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEditName(menu)}
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(menu.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted py-3">
                  Không có menu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
