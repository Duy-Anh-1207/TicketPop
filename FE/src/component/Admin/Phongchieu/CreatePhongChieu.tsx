import { useState, useMemo } from "react";
import { useCreatePhongChieu, useListPhongChieuTH0, useListPhongChieuTH1 } from "../../../hook/PhongChieuHook";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import type { PhongChieu } from "../../../types/phongchieu";

export default function CreatePhongChieu() {
  const navigate = useNavigate();
  const createPhongChieu = useCreatePhongChieu();

  // 🔹 Lấy tất cả phòng chiếu để check trùng tên
  const { data: phongChieuTH0 } = useListPhongChieuTH0();
  const { data: phongChieuTH1 } = useListPhongChieuTH1();
  const allPhongChieu = useMemo(() => [...(phongChieuTH0 || []), ...(phongChieuTH1 || [])], [phongChieuTH0, phongChieuTH1]);

  // form mặc định
  const [form, setForm] = useState<Omit<PhongChieu, "id" | "created_at" | "updated_at">>({
    ten_phong: "",
    loai_so_do: "",
    hang_thuong: 0,
    hang_vip: 0,
    trang_thai: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "hang_thuong" || name === "hang_vip" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.ten_phong.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên phòng chiếu không được để trống.", "warning");
      return;
    }

    // 🔹 Check trùng tên phòng
    const isDuplicate = allPhongChieu.some(
      (pc) => pc.ten_phong.toLowerCase() === form.ten_phong.trim().toLowerCase()
    );
    if (isDuplicate) {
      Swal.fire("⚠️ Lỗi!", "Tên phòng chiếu đã tồn tại, vui lòng chọn tên khác.", "warning");
      return;
    }

    createPhongChieu.mutate(form, {
      onSuccess: () => {
        Swal.fire("✅ Thành công!", "Đã thêm phòng chiếu mới.", "success");

        // Điều hướng theo trạng thái phòng chiếu
        if (form.trang_thai === "1") {
          navigate("/admin/roomxb"); // danh sách phòng đã xuất bản
        } else {
          navigate("/admin/roomcxb"); // danh sách phòng chưa xuất bản
        }
      },
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">➕ Thêm phòng chiếu mới</h4>

      <form
        className="card shadow-sm p-4 mx-auto"
        style={{ maxWidth: "600px" }}
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label">Tên phòng chiếu</label>
          <input
            type="text"
            className="form-control"
            name="ten_phong"
            value={form.ten_phong}
            onChange={handleChange}
            placeholder="Nhập tên phòng..."
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Loại sơ đồ</label>
          <input
            type="text"
            className="form-control"
            name="loai_so_do"
            value={form.loai_so_do}
            onChange={handleChange}
            placeholder="6x6, 8x8,... , 16x16"
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Số hàng thường</label>
            <input
              type="text"
              className="form-control"
              name="hang_thuong"
              value={form.hang_thuong}
              onChange={handleChange}
              min={0}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Số hàng VIP</label>
            <input
              type="text"
              className="form-control"
              name="hang_vip"
              value={form.hang_vip}
              onChange={handleChange}
              min={0}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Trạng thái</label>
          <select
            className="form-select"
            name="trang_thai"
            value={form.trang_thai}
            onChange={handleChange}
          >
            <option value="0">Chưa xuất bản</option>
            <option value="1">Đã xuất bản</option>
          </select>
        </div>

        <div className="d-flex justify-content-between">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createPhongChieu.isPending}
          >
            {createPhongChieu.isPending ? "Đang thêm..." : "Thêm mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
