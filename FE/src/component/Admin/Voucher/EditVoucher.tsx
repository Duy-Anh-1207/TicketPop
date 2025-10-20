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
  const {
    data: voucher,
    isLoading: loadingDetail,
    error,
  } = useVoucherDetail(id!);
  const { mutate: updateVoucher, isPending: loadingUpdate } = useUpdateVoucher();
  const { mutate: deleteVoucher, isPending: loadingDelete } = useDeleteVoucher();

  const [formData, setFormData] = useState({
    ma: "",
    phan_tram_giam: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Load dữ liệu mã giảm giá khi component mount
  useEffect(() => {
    if (voucher) {
      setFormData({
        ma: voucher.ma?.trim() || "",
        phan_tram_giam: voucher.phan_tram_giam?.toString() || "",
        ngay_bat_dau: voucher.ngay_bat_dau ? voucher.ngay_bat_dau.split("T")[0] : "",
        ngay_ket_thuc: voucher.ngay_ket_thuc ? voucher.ngay_ket_thuc.split("T")[0] : "",
      });
      setCurrentImage(
        voucher.image ? `http://localhost:8000/storage/${voucher.image}` : null
      );
      console.log("Dữ liệu voucher từ backend:", voucher); // Log dữ liệu voucher
    }
  }, [voucher]);

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ma" ? value.trim() : value,
    }));
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setCurrentImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.ma) {
      Swal.fire("❗ Lỗi!", "Mã giảm giá không được bỏ trống.", "warning");
      return;
    }
    if (!formData.ngay_bat_dau) {
      Swal.fire("❗ Lỗi!", "Ngày bắt đầu là bắt buộc.", "warning");
      return;
    }
    if (!formData.ngay_ket_thuc) {
      Swal.fire("❗ Lỗi!", "Ngày kết thúc là bắt buộc.", "warning");
      return;
    }
    if (new Date(formData.ngay_ket_thuc) < new Date(formData.ngay_bat_dau)) {
      Swal.fire("❗ Lỗi!", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.", "warning");
      return;
    }
    if (
      formData.phan_tram_giam &&
      (Number(formData.phan_tram_giam) < 0 || Number(formData.phan_tram_giam) > 100)
    ) {
      Swal.fire("❗ Lỗi!", "Phần trăm giảm phải từ 0 đến 100.", "warning");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("ma", formData.ma);
      formDataToSend.append("ngay_bat_dau", formData.ngay_bat_dau);
      formDataToSend.append("ngay_ket_thuc", formData.ngay_ket_thuc);

      // Chỉ thêm phan_tram_giam nếu hợp lệ
      if (formData.phan_tram_giam && !isNaN(Number(formData.phan_tram_giam))) {
        formDataToSend.append("phan_tram_giam", Number(formData.phan_tram_giam).toString());
      }
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // Log FormData để kiểm tra
      const formDataEntries = Object.fromEntries(formDataToSend.entries());
      console.log("Dữ liệu gửi đi:", formDataEntries);

      // Gửi request
      await updateVoucher(
        { id: id!, values: formDataToSend },
        {
          onError: (error: any) => {
            const err = error as {
              response?: {
                data?: { message?: string; errors?: Record<string, string[]> };
              };
            };
            let errorMessage =
              err.response?.data?.message || "Không thể cập nhật mã giảm giá.";
            if (err.response?.data?.errors) {
              errorMessage = Object.entries(err.response.data.errors)
                .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
                .join("; ");
            }
            console.error("Backend errors:", err.response?.data);
            Swal.fire("❌ Lỗi!", errorMessage, "error");
          },
        }
      );

      // Điều hướng sau khi thành công
      navigate("/admin/vouchers");
    } catch (err: any) {
      console.error("❌ Lỗi cập nhật mã giảm giá:", err);
    }
  };

  // Xử lý xóa mã giảm giá
  const handleDelete = () => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa mã giảm giá này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteVoucher(id!, {
          onSuccess: () => {
            navigate("/admin/vouchers");
          },
          onError: (error: any) => {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire(
              "❌ Lỗi!",
              err.response?.data?.message || "Không thể xóa mã giảm giá.",
              "error"
            );
          },
        });
      }
    });
  };

  // Xử lý lỗi hoặc đang tải
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Lỗi khi tải mã giảm giá: {error.message}
        </div>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Sửa Mã Giảm Giá
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
              {currentImage && (
                <div className="mt-2">
                  <img
                    src={currentImage}
                    alt="Voucher Preview"
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
                onClick={() => navigate("/admin/vouchers")}
                disabled={loadingUpdate || loadingDelete}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="btn btn-danger me-2"
                onClick={handleDelete}
                disabled={loadingUpdate || loadingDelete}
              >
                {loadingDelete ? "Đang xóa..." : "Xóa"}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loadingUpdate || loadingDelete}
              >
                {loadingUpdate ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}