import { useState } from "react";
import { useCreateBanner } from "../../../hook/BannerHook";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function CreateBanner() {
  const createBanner = useCreateBanner();
  const navigate = useNavigate();

  // state form
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // xử lý chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  // submit form
  const handleSubmit = async () => {
    if (!title.trim()) {
      Swal.fire("⚠️ Lỗi!", "Tiêu đề banner không được để trống.", "warning");
      return;
    }
    if (!imageFile) {
      Swal.fire("⚠️ Lỗi!", "Ảnh banner không được để trống.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("link_url", linkUrl);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);
    formData.append("image_url", imageFile);

    createBanner.mutate(formData, {
      onSuccess: () => {
        Swal.fire("✅ Thành công!", "Đã thêm banner mới.", "success");
        navigate("/admin/banners");
      },
      onError: () => {
        Swal.fire("❌ Lỗi!", "Không thể thêm banner, vui lòng thử lại.", "error");
      },
    });
  };

  return (
    <div className="container p-4">
      <h4 className="mb-4 text-center">🎏 Thêm Banner Mới</h4>

      <div className="card shadow-sm p-3">
        {/* ===== Tiêu đề ===== */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Tiêu đề</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề banner..."
          />
        </div>

        {/* ===== Ảnh Poster ===== */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Ảnh Poster</label>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Hiển thị preview ảnh nếu có */}
          {imageFile && (
            <div className="text-center mt-3">
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="rounded-3 border shadow-sm"
                style={{
                  width: "250px",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </div>
          )}
        </div>

        {/* ===== Link URL ===== */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Liên kết (URL)</label>
          <input
            type="text"
            className="form-control"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        {/* ===== Ngày bắt đầu / kết thúc ===== */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Ngày bắt đầu</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Ngày kết thúc</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* ===== Nút hành động ===== */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={createBanner.isPending}
          >
            {createBanner.isPending ? "Đang thêm..." : "Thêm mới"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/banners")}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
