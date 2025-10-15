import { useState } from "react";
import {
  useListPhienBan,
  useCreatePhienBan,
  useUpdatePhienBan,
  useDeletePhienBan,
} from "../../../hook/PhienBanHook";
import Swal from "sweetalert2";
import type { PhienBan } from "../../../types/phienban";

export default function PhienBanList() {
  const { data: phienbans, isLoading, isError, error } = useListPhienBan();
  const createPB = useCreatePhienBan();
  const updatePB = useUpdatePhienBan();
  const deletePB = useDeletePhienBan();

  const [newTen, setNewTen] = useState("");

  if (isLoading) return <p className="text-center mt-4">Đang tải danh sách...</p>;
  if (isError)
    return (
      <div className="alert alert-danger m-3">
        Không tải được dữ liệu phiên bản.
        <pre className="small mt-2">{String((error as any)?.message ?? "")}</pre>
      </div>
    );

  const handleAdd = () => {
    const name = newTen.trim();
    if (!name) {
      Swal.fire("⚠️ Lỗi!", "Tên phiên bản không được để trống.", "warning");
      return;
    }
    createPB.mutate(
      { ten_phien_ban: name },
      {
        onSuccess: () => setNewTen(""),
      }
    );
  };

  const handleUpdate = async (pb: PhienBan) => {
    const { value } = await Swal.fire({
      title: "Cập nhật tên phiên bản",
      input: "text",
      inputValue: pb.ten_phien_ban,
      showCancelButton: true,
      confirmButtonText: "Lưu",
      cancelButtonText: "Hủy",
      inputValidator: (v) => (!v.trim() ? "Tên không được trống" : undefined),
    });
    if (!value || !value.trim()) return;

    // ✅ Dùng payload { id, values } → hết lỗi TS2353
    updatePB.mutate({ id: pb.id, values: { ten_phien_ban: value.trim() } });
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((r) => {
      if (r.isConfirmed) deletePB.mutate(id);
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🎬 Quản lý phiên bản phim</h4>

      <div className="card shadow-sm p-3 mb-4">
        <h6>➕ Thêm phiên bản mới</h6>
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="VD: Lồng tiếng, Phụ đề, Vietsub"
              value={newTen}
              onChange={(e) => setNewTen(e.target.value)}
            />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-success" onClick={handleAdd} disabled={createPB.isPending}>
              {createPB.isPending ? "Đang thêm..." : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-light text-center">
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Tên phiên bản</th>
              <th style={{ width: 200 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {phienbans?.length ? (
              phienbans.map((pb) => (
                <tr key={pb.id}>
                  <td className="text-center">{pb.id}</td>
                  <td>{pb.ten_phien_ban}</td>
                  <td className="text-center">
                    <div className="btn-group">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => handleUpdate(pb)}>
                        Cập nhật
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(pb.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-muted py-3">
                  Chưa có phiên bản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
