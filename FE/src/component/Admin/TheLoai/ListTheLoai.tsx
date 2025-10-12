import { useState } from "react";
import { useListTheLoai, useCreateTheLoai, useDeleteTheLoai } from "../../../hook/TheLoaiHook";
import Swal from "sweetalert2";
import type { TheLoai } from "../../../types/theloai";

export default function TheLoaiList() {
  const { data: theloais, isLoading } = useListTheLoai();
  const createTheLoai = useCreateTheLoai();
  const deleteTheLoai = useDeleteTheLoai();

  // form input cho thêm mới
  const [newTen, setNewTen] = useState("");
  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

  const handleAdd = () => {
    if (!newTen.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên thể loại không được để trống.", "warning");
      return;
    }

    createTheLoai.mutate(
      { ten_the_loai: newTen},
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
      if (result.isConfirmed) deleteTheLoai.mutate(id);
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">📚 Quản lý thể loại</h4>

      {/* --- Form thêm nhanh --- */}
      <div className="card shadow-sm p-3 mb-4">
        <h6>➕ Thêm thể loại mới</h6>
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Tên thể loại..."
              value={newTen}
              onChange={(e) => setNewTen(e.target.value)}
            />
          </div>
          <div className="col-md-3 d-grid">
            <button
              className="btn btn-success"
              onClick={handleAdd}
              disabled={createTheLoai.isPending}
            >
              {createTheLoai.isPending ? "Đang thêm..." : "Thêm mới"}
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
              <th>Tên thể loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {theloais?.length ? (
              theloais.map((tl: TheLoai) => (
                <tr key={tl.id}>
                  <td className="text-center">{tl.id}</td>
                  <td>{tl.ten_the_loai}</td>
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
                        onClick={() => handleDelete(tl.id)}
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
                  Không có thể loại nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
