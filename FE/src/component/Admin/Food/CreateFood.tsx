import { useState } from "react";
import { useCreateFood } from "../../../hook/FoodHook";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function FoodCreate() {
  const createFood = useCreateFood();
  const navigate = useNavigate();

  // state form
  const [tenDoAn, setTenDoAn] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [moTa, setMoTa] = useState("");
  const [giaNhap, setGiaNhap] = useState<number | "">("");
  const [giaBan, setGiaBan] = useState<number | "">("");
  const [soLuongTon, setSoLuongTon] = useState<number | "">("");

  const handleSubmit = () => {
    if (!tenDoAn.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tên món ăn không được để trống.", "warning");
      return;
    }
    if (!image) {
      Swal.fire("⚠️ Lỗi!", "Ảnh món ăn không được để trống.", "warning");
      return;
    }
    if (giaNhap === "" || giaBan === "" || soLuongTon === "") {
      Swal.fire("⚠️ Lỗi!", "Các giá trị số không được để trống.", "warning");
      return;
    }

    // tạo FormData
    const formData = new FormData();
    formData.append("ten_do_an", tenDoAn);
    formData.append("mo_ta", moTa);
    formData.append("gia_nhap", String(giaNhap));
    formData.append("gia_ban", String(giaBan));
    formData.append("so_luong_ton", String(soLuongTon));
    formData.append("image", image);

    createFood.mutate(formData, {
      onSuccess: () => {
        Swal.fire("✅ Thành công!", "Đã thêm món ăn mới.", "success");
        navigate("/food");
      },
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">➕ Thêm món ăn mới</h4>

      <div className="card shadow-sm p-3">
        <div className="mb-3">
          <label className="form-label">Tên món ăn</label>
          <input
            type="text"
            className="form-control"
            value={tenDoAn}
            onChange={(e) => setTenDoAn(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Ảnh</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          />
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Giá nhập</label>
            <input
              type="number"
              className="form-control"
              value={giaNhap}
              onChange={(e) => setGiaNhap(Number(e.target.value))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Giá bán</label>
            <input
              type="number"
              className="form-control"
              value={giaBan}
              onChange={(e) => setGiaBan(Number(e.target.value))}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Số lượng tồn</label>
            <input
              type="number"
              className="form-control"
              value={soLuongTon}
              onChange={(e) => setSoLuongTon(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={createFood.isPending}
          >
            {createFood.isPending ? "Đang thêm..." : "Thêm mới"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/foods")}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
