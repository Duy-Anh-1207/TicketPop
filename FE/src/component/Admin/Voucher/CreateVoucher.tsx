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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ✅ Validate toàn bộ form
  const validateAll = () => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      let message = "";

      switch (key) {
        case "ma":
          if (!value.trim()) message = "Mã giảm giá là bắt buộc.";
          break;

        case "phan_tram_giam":
          if (!value.trim()) message = "Phần trăm giảm là bắt buộc.";
          else if (Number(value) < 0 || Number(value) > 100)
            message = "Phần trăm giảm phải từ 0 đến 100.";
          break;

        case "giam_toi_da":
          if (!value.trim()) message = "Giảm tối đa là bắt buộc.";
          else if (Number(value) < 0)
            message = "Số tiền giảm tối đa không được âm.";
          break;

        case "gia_tri_don_hang_toi_thieu":
          if (!value.trim())
            message = "Giá trị đơn hàng tối thiểu là bắt buộc.";
          else if (Number(value) < 0)
            message = "Giá trị đơn hàng tối thiểu không được âm.";
          break;

        case "so_lan_su_dung":
          if (!value.trim()) message = "Số lần sử dụng là bắt buộc.";
          else if (Number(value) < 0)
            message = "Số lần sử dụng không được âm.";
          break;

        case "ngay_bat_dau":
          if (!value.trim()) message = "Ngày bắt đầu là bắt buộc.";
          break;

        case "ngay_ket_thuc":
          if (!value.trim()) message = "Ngày kết thúc là bắt buộc.";
          else if (
            formData.ngay_bat_dau &&
            new Date(value) < new Date(formData.ngay_bat_dau)
          )
            message = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
          break;

        default:
          break;
      }

      newErrors[key] = message;
    });

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === "");
  };

  // ✅ Validate từng trường khi thay đổi
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // validate riêng từng trường khi nhập
    let message = "";
    switch (name) {
      case "ma":
        if (!value.trim()) message = "Mã giảm giá là bắt buộc.";
        break;
      case "phan_tram_giam":
        if (!value.trim()) message = "Phần trăm giảm là bắt buộc.";
        else if (Number(value) < 0 || Number(value) > 100)
          message = "Phần trăm giảm phải từ 0 đến 100.";
        break;
      case "giam_toi_da":
        if (!value.trim()) message = "Giảm tối đa là bắt buộc.";
        else if (Number(value) < 0)
          message = "Số tiền giảm tối đa không được âm.";
        break;
      case "gia_tri_don_hang_toi_thieu":
        if (!value.trim()) message = "Giá trị đơn hàng tối thiểu là bắt buộc.";
        else if (Number(value) < 0)
          message = "Giá trị đơn hàng tối thiểu không được âm.";
        break;
      case "so_lan_su_dung":
        if (!value.trim()) message = "Số lần sử dụng là bắt buộc.";
        else if (Number(value) < 0)
          message = "Số lần sử dụng không được âm.";
        break;
      case "ngay_bat_dau":
        if (!value.trim()) message = "Ngày bắt đầu là bắt buộc.";
        break;
      case "ngay_ket_thuc":
        if (!value.trim()) message = "Ngày kết thúc là bắt buộc.";
        else if (
          formData.ngay_bat_dau &&
          new Date(value) < new Date(formData.ngay_bat_dau)
        )
          message = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  // ✅ Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll()) {
      Swal.fire("❗ Lỗi!", "Vui lòng kiểm tra lại các trường nhập.", "warning");
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        formDataToSend.append(key, value)
      );
      if (imageFile) formDataToSend.append("image", imageFile);

      await createVoucher(formDataToSend);
      Swal.fire("✅ Thành công!", "Đã tạo mã giảm giá mới.", "success");
      navigate("/admin/vouchers");
    } catch (err) {
      console.error("❌ Lỗi tạo mã giảm giá:", err);
      Swal.fire("❌ Lỗi!", "Không thể tạo mã giảm giá.", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Thêm Mã Giảm Giá Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* Mã giảm giá */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mã giảm giá</label>
              <input
                type="text"
                name="ma"
                className={`form-control ${errors.ma ? "is-invalid" : ""}`}
                placeholder="Nhập mã giảm giá..."
                value={formData.ma}
                onChange={handleChange}
              />
              {errors.ma && <div className="invalid-feedback">{errors.ma}</div>}
            </div>

            {/* Phần trăm giảm */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="phan_tram_giam"
                className={`form-control ${
                  errors.phan_tram_giam ? "is-invalid" : ""
                }`}
                placeholder="Nhập phần trăm giảm (0-100)..."
                value={formData.phan_tram_giam}
                onChange={handleChange}
              />
              {errors.phan_tram_giam && (
                <div className="invalid-feedback">{errors.phan_tram_giam}</div>
              )}
            </div>

            {/* Giảm tối đa */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                name="giam_toi_da"
                className={`form-control ${
                  errors.giam_toi_da ? "is-invalid" : ""
                }`}
                placeholder="Nhập số tiền giảm tối đa..."
                value={formData.giam_toi_da}
                onChange={handleChange}
              />
              {errors.giam_toi_da && (
                <div className="invalid-feedback">{errors.giam_toi_da}</div>
              )}
            </div>

            {/* Giá trị đơn hàng tối thiểu */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="gia_tri_don_hang_toi_thieu"
                className={`form-control ${
                  errors.gia_tri_don_hang_toi_thieu ? "is-invalid" : ""
                }`}
                placeholder="Nhập giá trị đơn hàng tối thiểu..."
                value={formData.gia_tri_don_hang_toi_thieu}
                onChange={handleChange}
              />
              {errors.gia_tri_don_hang_toi_thieu && (
                <div className="invalid-feedback">
                  {errors.gia_tri_don_hang_toi_thieu}
                </div>
              )}
            </div>

            {/* Ngày bắt đầu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ngày bắt đầu</label>
              <input
                type="date"
                name="ngay_bat_dau"
                className={`form-control ${
                  errors.ngay_bat_dau ? "is-invalid" : ""
                }`}
                value={formData.ngay_bat_dau}
                onChange={handleChange}
              />
              {errors.ngay_bat_dau && (
                <div className="invalid-feedback">{errors.ngay_bat_dau}</div>
              )}
            </div>

            {/* Ngày kết thúc */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ngày kết thúc</label>
              <input
                type="date"
                name="ngay_ket_thuc"
                className={`form-control ${
                  errors.ngay_ket_thuc ? "is-invalid" : ""
                }`}
                value={formData.ngay_ket_thuc}
                onChange={handleChange}
              />
              {errors.ngay_ket_thuc && (
                <div className="invalid-feedback">{errors.ngay_ket_thuc}</div>
              )}
            </div>

            {/* Số lần sử dụng */}
            <div className="mb-3">
              <label className="form-label fw-bold">Số lần sử dụng</label>
              <input
                type="number"
                name="so_lan_su_dung"
                className={`form-control ${
                  errors.so_lan_su_dung ? "is-invalid" : ""
                }`}
                placeholder="Nhập số lần sử dụng..."
                value={formData.so_lan_su_dung}
                onChange={handleChange}
              />
              {errors.so_lan_su_dung && (
                <div className="invalid-feedback">{errors.so_lan_su_dung}</div>
              )}
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
