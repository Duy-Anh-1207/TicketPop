import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useVoucherDetail,
  useUpdateVoucher,
  useDeleteVoucher,
} from "../../../hook/useVoucher";

export default function EditVoucher() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: voucher, isLoading: loadingDetail, error } = useVoucherDetail(id!);
  const { mutate: updateVoucher, isPending: loadingUpdate } = useUpdateVoucher();
  const { mutate: deleteVoucher, isPending: loadingDelete } = useDeleteVoucher();

  const [formData, setFormData] = useState({
    ma: "",
    phan_tram_giam: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    so_lan_su_dung: "",
    trang_thai: "1",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Load dữ liệu
  useEffect(() => {
    if (voucher) {
      setFormData({
        ma: voucher.ma || "",
        phan_tram_giam: voucher.phan_tram_giam?.toString() || "",
        ngay_bat_dau: voucher.ngay_bat_dau?.split("T")[0] || "",
        ngay_ket_thuc: voucher.ngay_ket_thuc?.split("T")[0] || "",
        so_lan_su_dung: voucher.so_lan_su_dung?.toString() || "",
        trang_thai: voucher.trang_thai?.toString() || "1",
      });

      setCurrentImage(
        voucher.image ? `http://localhost:8000/storage/${voucher.image}` : null
      );
    }
  }, [voucher]);

  // Xử lý input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setCurrentImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.phan_tram_giam) {
      Swal.fire("❗ Lỗi!", "Phần trăm giảm không được bỏ trống.", "warning");
      return;
    }
    if (
      Number(formData.phan_tram_giam) < 0 ||
      Number(formData.phan_tram_giam) > 100
    ) {
      Swal.fire("❗ Lỗi!", "Phần trăm giảm phải từ 0 đến 100.", "warning");
      return;
    }

    if (!formData.ngay_bat_dau || !formData.ngay_ket_thuc) {
      Swal.fire("❗ Lỗi!", "Ngày bắt đầu và kết thúc là bắt buộc.", "warning");
      return;
    }

    if (new Date(formData.ngay_ket_thuc) < new Date(formData.ngay_bat_dau)) {
      Swal.fire("❗ Lỗi!", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", "warning");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("ma", formData.ma);
    formDataToSend.append("phan_tram_giam", formData.phan_tram_giam);
    formDataToSend.append("ngay_bat_dau", formData.ngay_bat_dau);
    formDataToSend.append("ngay_ket_thuc", formData.ngay_ket_thuc);
    formDataToSend.append("so_lan_su_dung", formData.so_lan_su_dung);
    formDataToSend.append("trang_thai", formData.trang_thai);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    await updateVoucher(
      { id: id!, values: formDataToSend },
      {
        onSuccess: () => {
          Swal.fire("✅ Thành công!", "Cập nhật voucher thành công", "success");
          navigate("/admin/vouchers");
        },
        onError: (error: any) => {
          Swal.fire("❌ Lỗi!", error?.response?.data?.message || "Cập nhật thất bại", "error");
        },
      }
    );
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa voucher này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteVoucher(id!);
        navigate("/admin/vouchers");
      }
    });
  };

  if (loadingDetail) {
    return <div className="container mt-4">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Chỉnh sửa Voucher
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Phần trăm giảm */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phần trăm giảm (%)</label>
              <input
                type="number"
                name="phan_tram_giam"
                className="form-control"
                value={formData.phan_tram_giam}
                onChange={handleChange}
                min="0"
                max="100"
                required
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
                readOnly
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
                value={formData.so_lan_su_dung}
                onChange={handleChange}
                required
              />
            </div>

            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <select
                name="trang_thai"
                className="form-control"
                value={formData.trang_thai}
                onChange={handleChange}
              >
                <option value="1">Đang hoạt động</option>
                <option value="0">Ngừng hoạt động</option>
              </select>
            </div>

            {/* Ảnh đại diện */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ảnh đại diện</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {currentImage && (
                <img
                  src={currentImage}
                  alt="Preview"
                  className="mt-2"
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              )}
            </div>

            <div className="text-end mt-4">
              <button type="button" className="btn btn-secondary me-2" onClick={() => navigate("/admin/vouchers")}>
                Quay lại
              </button>
              <button type="button" className="btn btn-danger me-2" onClick={handleDelete}>
                Xóa
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
