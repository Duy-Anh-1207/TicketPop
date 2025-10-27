import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTinTucDetail } from "../../../hook/TinTucHook";
import axiosClient from "../../../provider/TinTucProvide";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function DetailTinTuc() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tinTuc, isLoading, isError } = useTinTucDetail(id ?? "");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    tieu_de: "",
    noi_dung: "",
    hinh_anh: "",
  });
  const [fileHinhAnh, setFileHinhAnh] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Đồng bộ formData khi tinTuc thay đổi
  useEffect(() => {
    if (tinTuc) {
      setFormData({
        tieu_de: tinTuc.tieu_de ?? "",
        noi_dung: tinTuc.noi_dung ?? "",
        hinh_anh: tinTuc.hinh_anh
          ? `http://localhost:8000${tinTuc.hinh_anh}`
          : "",
      });
      setFileHinhAnh(null);
    }
  }, [tinTuc]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Vui lòng chọn tệp hình ảnh (jpg, png, ...)",
        });
        return;
      }
      setFileHinhAnh(file);
      setFormData((prev) => ({ ...prev, hinh_anh: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("tieu_de", formData.tieu_de);
      fd.append("noi_dung", formData.noi_dung);

      // Chỉ gửi file nếu có
      if (fileHinhAnh) {
        fd.append("hinh_anh", fileHinhAnh);
      }

      // Laravel nhận PUT qua POST + _method=PUT
      fd.append("_method", "PUT");

      const { data: res } = await axiosClient.post(`/tin-tucs/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: res.message || "Cập nhật tin tức thành công!",
      });

      setIsEditing(false);
      navigate("/admin/tin-tuc");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: err.response?.data?.message || "Không thể cập nhật tin tức",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (!tinTuc) return;
    setFormData({
      tieu_de: tinTuc.tieu_de ?? "",
      noi_dung: tinTuc.noi_dung ?? "",
      hinh_anh: tinTuc.hinh_anh
        ? `http://localhost:8000${tinTuc.hinh_anh}`
        : "",
    });
    setFileHinhAnh(null);
    setIsEditing(false);
  };

  if (isLoading) return <p className="text-center">Đang tải...</p>;
  if (isError || !tinTuc)
    return <p className="text-center text-danger">Không tìm thấy tin tức.</p>;

  return (
    <div className="container p-4">
      <div className="container-fluid">
        <div className="card-body pb-0 pt-3 d-flex justify-content-between align-items-center mb-3">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary d-flex align-items-center gap-1"
            >
              <i className="fa-solid fa-pen-to-square"></i>
              Chỉnh sửa
            </button>
          )}
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary d-flex align-items-center gap-1"
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Tiêu đề</label>
              <input
                type="text"
                name="tieu_de"
                className="form-control"
                value={formData.tieu_de}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Nội dung</label>
              <CKEditor
                editor={ClassicEditor as any}
                data={formData.noi_dung}
                onChange={(_, editor) => {
                  const data = editor.getData();
                  setFormData((prev) => ({
                    ...prev,
                    noi_dung: data,
                  }));
                }}
                onReady={(editor) => {
                  editor.editing.view.change((writer) => {
                    const root = editor.editing.view.document.getRoot();
                    if (root) {
                      writer.setStyle("min-height", "200px", root);
                    }
                  });
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Hình ảnh</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
              />
              {formData.hinh_anh && (
                <div className="mt-3">
                  <img
                    src={formData.hinh_anh}
                    alt="Hình tin tức"
                    style={{ maxWidth: 300, borderRadius: 8 }}
                  />
                </div>
              )}
            </div>

            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-3">
            <InfoRow title="Tiêu đề" value={tinTuc.tieu_de} icon="fa-heading" />
            <InfoRow
              icon="fa-file-alt"
              title="Nội dung"
              value={<div dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung ?? "" }} />}
            />
            <InfoRow
              title="Hình ảnh"
              value={
                tinTuc.hinh_anh ? (
                  <a
                    href={`http://localhost:8000${tinTuc.hinh_anh}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem hình ảnh
                  </a>
                ) : (
                  "Không có"
                )
              }
              icon="fa-image"
            />
            <InfoRow
              title="Ngày tạo"
              value={
                tinTuc.created_at &&
                new Date(tinTuc.created_at).toLocaleDateString("vi-VN")
              }
              icon="fa-calendar"
            />
            <InfoRow
              title="Ngày cập nhật"
              value={
                tinTuc.updated_at &&
                new Date(tinTuc.updated_at).toLocaleDateString("vi-VN")
              }
              icon="fa-calendar"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const InfoRow = ({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: any;
}) => (
  <div className="d-flex align-items-start mb-3">
    <div
      className="bg-primary-subtle text-primary fs-14 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: 40, height: 40 }}
    >
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div className="ms-3">
      <h6 className="mb-1">{title}</h6>
      <div className="mb-0">{value}</div>
    </div>
  </div>
);