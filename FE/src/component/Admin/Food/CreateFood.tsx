import { useState } from "react";
import { useCreateFood } from "../../../hook/FoodHook";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function FoodCreate() {
  const createFood = useCreateFood();
  const navigate = useNavigate();

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
        navigate("/admin/foods");
      },
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center fw-bold">➕ Thêm món ăn mới</h4>
      <div className="card shadow-sm p-4 mx-auto bg-white" style={{ maxWidth: "800px", borderRadius: "12px" }}>
        <div className="mb-3">
          <label className="form-label fw-semibold">Tên món ăn</label>
          <input
            type="text"
            className="form-control"
            value={tenDoAn}
            onChange={(e) => setTenDoAn(e.target.value)}
            placeholder="Ví dụ: Bắp rang bơ..."
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Mô tả</label>
          <textarea
            className="form-control"
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            rows={3}
            placeholder="Nhập mô tả ngắn..."
          />
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Giá nhập (VNĐ)</label>
            <input
              type="number"
              className="form-control"
              value={giaNhap}
              onChange={(e) => setGiaNhap(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Giá bán (VNĐ)</label>
            <input
              type="number"
              className="form-control"
              value={giaBan}
              onChange={(e) => setGiaBan(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              min={0}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Số lượng tồn</label>
            <input
              type="number"
              className="form-control"
              value={soLuongTon}
              onChange={(e) => setSoLuongTon(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              min={0}
            />
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/foods")}
          >
            Hủy
          </button>
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={createFood.isPending}
          >
            {createFood.isPending ? "Đang thêm..." : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}