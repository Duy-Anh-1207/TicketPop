
import { useState, useMemo } from "react";
import { useListMenu, useUpdateMenu, useDeleteMenu } from "../../../hook/MenuHook";
import Swal from "sweetalert2";
import type { Menu } from "../../../types/menu";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

export default function MenuList() {

  const { data: allMenus, isLoading } = useListMenu();
  const updateMenu = useUpdateMenu();
  const deleteMenu = useDeleteMenu();
  const navigate = useNavigate();


  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  const filteredMenus = useMemo(() => {
    if (!allMenus) return [];
    return allMenus.filter((menu: Menu) =>
      menu.ten_chuc_nang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.ma_chuc_nang.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMenus, searchTerm]);


  const paginatedMenus = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredMenus.slice(start, end);
  }, [filteredMenus, currentPage]);

  const totalPages = Math.ceil(filteredMenus.length / ITEMS_PER_PAGE);

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
          onClick={() => navigate("/admin/menu/create")}
        >
          ➕ Thêm mới menu
        </button>
      </div>


      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm theo tên hoặc mã chức năng..."
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
              <th>Mã chức năng</th>
              <th>Mã cha</th>
              <th>Tên chức năng</th>
              <th>State</th>
              <th>STT</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* 8. SỬA `menus` THÀNH `paginatedMenus` */}
            {paginatedMenus.length > 0 ? (
              paginatedMenus.map((menu: Menu, index: number) => (
                <tr key={menu.id}>
                  <td className="text-center">
                    {/* 9. SỬA LẠI STT CHO ĐÚNG KHI PHÂN TRANG */}
                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
                  <td>{menu.ma_chuc_nang}</td>
                  <td>{menu.ma_cha}</td>
                  <td>{menu.ten_chuc_nang}</td>
                  <td>{menu.state}</td>
                  <td>{menu.stt}</td>
                  <td className="text-center">
                    {/* Sửa lại logic hiển thị trạng thái (trangthai của bạn là number) */}
                    {Number(menu.trangthai) === 1 ? "Hoạt động" : "Không hoạt động"}
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
                  Không tìm thấy menu nào.
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