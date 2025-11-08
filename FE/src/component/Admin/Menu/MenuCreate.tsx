import { useState } from "react";
import { useCreateMenu } from "../../../hook/MenuHook";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import type { Menu } from "../../../types/menu";

export default function MenuCreate() {
  const createMenu = useCreateMenu();
  const navigate = useNavigate();

  // state form
  const [maChucNang, setMaChucNang] = useState("");
  const [maCha, setMaCha] = useState("");
  const [tenChucNang, setTenChucNang] = useState("");
  const [state, setSate] = useState("");
  const [stt, setStt] = useState("");
  const [trangThai, setTrangThai] = useState<number>(1);

  const handleSubmit = () => {
    if (!maChucNang.trim() || !tenChucNang.trim()) {
      Swal.fire("⚠️ Lỗi!", "Mã chức năng và tên chức năng không được để trống.", "warning");
      return;
    }

    createMenu.mutate(
      {
        ma_chuc_nang: maChucNang,
        ma_cha: maCha,
        ten_chuc_nang: tenChucNang,
        state: state,
        stt: stt,
        trangthai: trangThai,
      } as Omit<Menu, "id" | "created_at" | "updated_at">,
      {
        onSuccess: () => {
          Swal.fire("✅ Thành công!", "Đã thêm menu mới.", "success");
          navigate("/admin/menu"); // quay lại danh sách
        },
      }
    );
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">➕ Thêm menu mới</h4>

      <div className="card shadow-sm p-3">
        <div className="mb-3">
          <label className="form-label">Mã chức năng</label>
          <input
            type="text"
            className="form-control"
            value={maChucNang}
            onChange={(e) => setMaChucNang(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mã cha</label>
          <input
            type="text"
            className="form-control"
            value={maCha}
            onChange={(e) => setMaCha(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tên chức năng</label>
          <input
            type="text"
            className="form-control"
            value={tenChucNang}
            onChange={(e) => setTenChucNang(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Sate</label>
          <input
            type="text"
            className="form-control"
            value={state}
            onChange={(e) => setSate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">STT</label>
          <input
            type="text"
            className="form-control"
            value={stt}
            onChange={(e) => setStt(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Trạng thái</label>
          <select
            className="form-select"
            value={trangThai}
            onChange={(e) => setTrangThai(Number(e.target.value))}
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Không hoạt động</option>
          </select>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={createMenu.isPending}
          >
            {createMenu.isPending ? "Đang thêm..." : "Thêm mới"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/menu")}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
