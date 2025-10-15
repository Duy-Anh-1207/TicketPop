import { useState } from "react";
import { useListVaiTro, useCreateVaiTro, useDeleteVaiTro } from "../../../hook/VaiTroHook";
import Swal from "sweetalert2";
import type { VaiTro } from "../../../types/vaitro";

export default function VaiTroList() {
  const { data: vaitros, isLoading } = useListVaiTro();
  const createVaiTro = useCreateVaiTro();
  const deleteVaiTro = useDeleteVaiTro();

  // form input cho thêm mới
  const [newTen, setNewTen] = useState("");
  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

  const handleAdd = () => {
    if (!newTen.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên vai trò không được để trống.", "warning");
      return;
    }

    createVaiTro.mutate(
      { ten_vai_tro: newTen },
      {
        onSuccess: () => {
          setNewTen("");
        },
      }
    );
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

      {/* --- Form thêm nhanh --- */}
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
            <button
              className="btn btn-success"
              onClick={handleAdd}
              disabled={createVaiTro.isPending}
            >
              {createVaiTro.isPending ? "Đang thêm..." : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>

      {/* --- Danh sách --- */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped mx-auto align-middle">
          <thead className="table-light text-center">
            <tr>
              <th>ID</th>
              <th>Tên vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vaitros?.length ? (
              vaitros.map((vt: VaiTro) => (
                <tr key={vt.id}>
                  <td className="text-center">{vt.id}</td>
                  <td>{vt.ten_vai_tro}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          Swal.fire("✏️ Chưa làm!", "Phần sửa sẽ thêm sau.", "info")
                        }
                      >
                        Cập nhật
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(vt.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  Không có vai trò nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
