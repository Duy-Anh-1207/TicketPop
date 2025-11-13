

import { useState, useMemo } from "react";
import { useListTheLoai, useCreateTheLoai, useUpdateTheLoai, useDeleteTheLoai } from "../../../hook/TheLoaiHook";
import Swal from "sweetalert2";
import type { TheLoai } from "../../../types/theloai";

const ITEMS_PER_PAGE = 5;

export default function TheLoaiList() {

  const { data: allTheLoais, isLoading } = useListTheLoai();
  const createTheLoai = useCreateTheLoai();
  const updateTheLoai = useUpdateTheLoai();
  const deleteTheLoai = useDeleteTheLoai();


  const [newTen, setNewTen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  const filteredTheLoais = useMemo(() => {
    if (!allTheLoais) return [];
    return allTheLoais.filter((tl: TheLoai) =>
      tl.ten_the_loai.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTheLoais, searchTerm]);


  const paginatedTheLoais = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTheLoais.slice(start, end);
  }, [filteredTheLoais, currentPage]);

  const totalPages = Math.ceil(filteredTheLoais.length / ITEMS_PER_PAGE);

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;

  const handleAdd = () => {
    if (!newTen.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên thể loại không được để trống.", "warning");
      return;
    }
    createTheLoai.mutate(
      { ten_the_loai: newTen },
      { onSuccess: () => { setNewTen(""); } }
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
  const handleEdit = (tl: TheLoai) => {
    Swal.fire({
      title: "✏️ Sửa tên thể loại",
      input: "text",
      inputLabel: "Tên thể loại",
      inputValue: tl.ten_the_loai,
      showCancelButton: true,
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage("Tên thể loại không được để trống");
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        updateTheLoai.mutate(
          { id: tl.id, values: { ten_the_loai: result.value } },
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
      <h4 className="mb-4 text-center">📚 Quản lý thể loại</h4>

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

      <div className="mb-3">
        <input 
          type="text"
          className="form-control"
          placeholder="Tìm theo tên thể loại..."
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
              <th>Tên thể loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTheLoais.length > 0 ? (
              paginatedTheLoais.map((tl: TheLoai, index: number) => (
                <tr key={tl.id}>
                  <td className="text-center">
                    {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                  </td>
                  <td>{tl.ten_the_loai}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit(tl)}
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
                <td colSpan={3} className="text-center text-muted py-3">
                  Không tìm thấy thể loại nào.
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