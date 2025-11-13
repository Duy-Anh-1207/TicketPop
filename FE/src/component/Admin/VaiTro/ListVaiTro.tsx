
import { useState, useMemo } from "react";
import { useListVaiTro, useCreateVaiTro, useDeleteVaiTro } from "../../../hook/VaiTroHook";
import Swal from "sweetalert2";
import type { VaiTro } from "../../../types/vaitro";
import RolePermissionModal from "../PhanQuyen/Phanquyen";
import { canAccess } from "../../../utils/permissions";

const MENU_ID = 9;
const ITEMS_PER_PAGE = 5;

export default function VaiTroList() {
  const { data: allVaiTros, isLoading } = useListVaiTro();
  const createVaiTro = useCreateVaiTro();
  const deleteVaiTro = useDeleteVaiTro();

  const [newTen, setNewTen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<VaiTro | null>(null);

  const filteredVaiTros = useMemo(() => {
    if (!allVaiTros) return [];
    return allVaiTros.filter((vt: VaiTro) =>
      vt.ten_vai_tro.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVaiTros, searchTerm]);

  const paginatedVaiTros = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredVaiTros.slice(start, end);
  }, [filteredVaiTros, currentPage]);

  const totalPages = Math.ceil(filteredVaiTros.length / ITEMS_PER_PAGE);

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

  const canCreate = canAccess(MENU_ID, 1);
  const canUpdate = canAccess(MENU_ID, 2);
  const canDeletePerm = canAccess(MENU_ID, 3);

  const handleAdd = () => {
    if (!newTen.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên vai trò không được để trống.", "warning");
      return;
    }
    createVaiTro.mutate({ ten_vai_tro: newTen }, { onSuccess: () => setNewTen("") });
  };
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) deleteVaiTro.mutate(id);
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🧩 Quản lý vai trò</h4>

        <div className="card shadow-sm p-3 mb-4">
        <h6>➕ Thêm vai trò mới</h6>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tên vai trò..."
              value={newTen}
              onChange={(e) => setNewTen(e.target.value)}
            />
          </div>
          <div className="col-md-3 d-grid">
            {canCreate && (
              <button
                className="btn btn-success"
                onClick={handleAdd}
                disabled={createVaiTro.isPending}
              >
                {createVaiTro.isPending ? "Đang thêm..." : "Thêm mới"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <input 
          type="text"
          className="form-control"
          placeholder="Tìm theo tên vai trò..."
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
              <th>Tên vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVaiTros.length > 0 ? (
              paginatedVaiTros.map((vt: VaiTro, index: number) => (
                <tr key={vt.id}>
                  <td className="text-center">
                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
                  <td>{vt.ten_vai_tro}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      {canUpdate && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            Swal.fire("✏️ Chưa làm!", "Phần sửa sẽ thêm sau.", "info")
                          }
                        >
                          Cập nhật
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => setSelectedRole(vt)}
                        >
                          Phân quyền
                        </button>
                      )}
                      {canDeletePerm && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(vt.id)}
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
                <td colSpan={3} className="text-center text-muted py-3">
                  Không tìm thấy vai trò nào.
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

      {selectedRole && (
        <RolePermissionModal
          role={selectedRole}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}