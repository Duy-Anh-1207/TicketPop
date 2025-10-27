import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCreateVoucher } from "../../../hook/useVoucher";

export default function CreateVoucher() {
  const navigate = useNavigate();
  const { mutate: createVoucher, isPending: loading } = useCreateVoucher();

  const [formData, setFormData] = useState({
    ma: "",
    phan_tram_giam: "",
    giam_toi_da: "",
    gia_tri_don_hang_toi_thieu: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    so_lan_su_dung: "",
    so_lan_da_su_dung: "0",
    trang_thai: "CHƯA KÍCH HOẠT",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.ma) {
      Swal.fire("❗ Lỗi!", "Mã giảm giá là bắt buộc.", "warning");
      return;
    }
    if (!formData.ngay_bat_dau || !formData.ngay_ket_thuc) {
      Swal.fire(
        "❗ Lỗi!",
        "Ngày bắt đầu và ngày kết thúc là bắt buộc.",
        "warning"
      );
      return;
    }
    if (new Date(formData.ngay_ket_thuc) < new Date(formData.ngay_bat_dau)) {
      Swal.fire(
        "❗ Lỗi!",
        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.",
        "warning"
      );
      return;
    }
    if (
      formData.phan_tram_giam &&
      (Number(formData.phan_tram_giam) < 0 ||
        Number(formData.phan_tram_giam) > 100)
    ) {
      Swal.fire("❗ Lỗi!", "Phần trăm giảm phải từ 0 đến 100.", "warning");
      return;
    }
    if (formData.giam_toi_da && Number(formData.giam_toi_da) < 0) {
      Swal.fire("❗ Lỗi!", "Số tiền giảm tối đa không được âm.", "warning");
      return;
    }
    if (
      formData.gia_tri_don_hang_toi_thieu &&
      Number(formData.gia_tri_don_hang_toi_thieu) < 0
    ) {
      Swal.fire(
        "❗ Lỗi!",
        "Giá trị đơn hàng tối thiểu không được âm.",
        "warning"
      );
      return;
    }
    if (formData.so_lan_su_dung && Number(formData.so_lan_su_dung) < 0) {
      Swal.fire("❗ Lỗi!", "Số lần sử dụng không được âm.", "warning");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ma", formData.ma);
      if (formData.phan_tram_giam) {
        formDataToSend.append("phan_tram_giam", formData.phan_tram_giam);
      }
      if (formData.giam_toi_da) {
        formDataToSend.append("giam_toi_da", formData.giam_toi_da);
      }
      if (formData.gia_tri_don_hang_toi_thieu) {
        formDataToSend.append(
          "gia_tri_don_hang_toi_thieu",
          formData.gia_tri_don_hang_toi_thieu
        );
      }
      formDataToSend.append("ngay_bat_dau", formData.ngay_bat_dau);
      formDataToSend.append("ngay_ket_thuc", formData.ngay_ket_thuc);
      if (formData.so_lan_su_dung) {
        formDataToSend.append("so_lan_su_dung", formData.so_lan_su_dung);
      }
      formDataToSend.append("so_lan_da_su_dung", formData.so_lan_da_su_dung);
      formDataToSend.append("trang_thai", formData.trang_thai.toString());
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await createVoucher(formDataToSend);

      navigate("/admin/vouchers");
    } catch (err: any) {
      console.error("❌ Lỗi tạo mã giảm giá:", err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Thêm Mã Giảm Giá Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Mã giảm giá */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mã giảm giá</label>
              <input
                type="text"
                name="ma"
                className="form-control"
                placeholder="Nhập mã giảm giá..."
                value={formData.ma}
                onChange={handleChange}
                required
              />
            </div>

            {/* Phần trăm giảm */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="phan_tram_giam"
                className="form-control"
                placeholder="Nhập phần trăm giảm (0-100)..."
                value={formData.phan_tram_giam}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </div>

            {/* Giảm tối đa */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                name="giam_toi_da"
                className="form-control"
                placeholder="Nhập số tiền giảm tối đa..."
                value={formData.giam_toi_da}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Giá trị đơn hàng tối thiểu */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="gia_tri_don_hang_toi_thieu"
                className="form-control"
                placeholder="Nhập giá trị đơn hàng tối thiểu..."
                value={formData.gia_tri_don_hang_toi_thieu}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Ngày bắt đầu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ngày bắt đầu</label>
              <input
                type="date"
                name="ngay_bat_dau"
                className="form-control"
                value={formData.ngay_bat_dau}
                onChange={handleChange}
                required
              />
            </div>

            {/* Ngày kết thúc */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ngày kết thúc</label>
              <input
                type="date"
                name="ngay_ket_thuc"
                className="form-control"
                value={formData.ngay_ket_thuc}
                onChange={handleChange}
                required
              />
            </div>

            {/* Số lần sử dụng */}
            <div className="mb-3">
              <label className="form-label fw-bold">Số lần sử dụng</label>
              <input
                type="number"
                name="so_lan_su_dung"
                className="form-control"
                placeholder="Nhập số lần sử dụng..."
                value={formData.so_lan_su_dung}
                onChange={handleChange}
                min="0"
              />
            </div>

            {/* Số lần đã sử dụng */}
            <div className="mb-3">
              <label className="form-label fw-bold">Số lần đã sử dụng</label>
              <input
                type="number"
                name="so_lan_da_su_dung"
                className="form-control"
                value={formData.so_lan_da_su_dung}
                readOnly
              />
            </div>

            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <select
                name="trang_thai"
                className="form-select"
                value={formData.trang_thai}
                onChange={handleChange}
              >
                <option value="CHƯA KÍCH HOẠT">Chưa kích hoạt</option>
                <option value="KÍCH HOẠT">Kích hoạt</option>
                <option value="HẾT HẠN">Hết hạn</option>
              </select>
            </div>

            {/* Ảnh đại diện */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ảnh đại diện</label>
              <input
                type="file"
                name="image"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imageFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Đang lưu..." : "Lưu mã giảm giá"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
