import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { LichChieu } from "../../../types/lichchieu";

export default function DeletedLichChieuList() {
  const navigate = useNavigate();
  const [deletedList, setDeletedList] = useState<LichChieu[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeleted = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/deleted");
      setDeletedList(res.data.data || []);
    } catch {
      Swal.fire("Lỗi", "Không thể tải danh sách đã xóa!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  // ♻️ Khôi phục
  const handleRestore = async (id: number) => {
    const result = await Swal.fire({
      title: "Khôi phục lịch chiếu?",
      text: "Lịch chiếu sẽ được đưa trở lại danh sách chính.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(`http://localhost:8000/api/lich-chieu/${id}/restore`);
        Swal.fire("🎉 Thành công", "Khôi phục thành công!", "success");
        fetchDeleted();
      } catch {
        Swal.fire("Lỗi", "Không thể khôi phục lịch chiếu!", "error");
      }
    }
  };

  // 🧹 Xóa vĩnh viễn
  const handleForceDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Xóa vĩnh viễn?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa vĩnh viễn",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/api/force-delete/${id}`);
        Swal.fire("🧹 Đã xóa", "Lịch chiếu đã bị xóa vĩnh viễn!", "success");
        fetchDeleted();
      } catch {
        Swal.fire("Lỗi", "Không thể xóa vĩnh viễn!", "error");
      }
    }
  };

  if (loading) return <p className="text-center">Đang tải danh sách đã xóa...</p>;

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>🗑️ Lịch chiếu đã xóa</h4>
        <button onClick={() => navigate("/admin/lich-chieu")} className="btn btn-outline-primary">
          ← Quay lại
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Phim</th>
              <th>Phòng</th>
              <th>Giờ chiếu</th>
              <th>Đã xóa lúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {deletedList.length ? (
              deletedList.map((lichChieu) => (
                <tr key={lichChieu.id}>
                  <td>{lichChieu.id}</td>
                  <td>{lichChieu.phim?.ten_phim}</td>
                  <td>{lichChieu.phong?.ten_phong}</td>
                  <td>{new Date(lichChieu.gio_chieu).toLocaleString()}</td>
                  <td>
                    {lichChieu.deleted_at
                      ? new Date(lichChieu.deleted_at).toLocaleString()
                      : ""}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleRestore(lichChieu.id)}
                      className="btn btn-success btn-sm me-2"
                    >
                      ♻️ Khôi phục
                    </button>
                    <button
                      onClick={() => handleForceDelete(lichChieu.id)}
                      className="btn btn-danger btn-sm"
                    >
                      🧹 Xóa vĩnh viễn
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  Không có lịch chiếu nào trong thùng rác.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
