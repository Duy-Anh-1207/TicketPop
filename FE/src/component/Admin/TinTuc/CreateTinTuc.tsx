import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useCreateTinTuc,
  useUpdateTinTuc,
  useTinTucDetail,
} from "../../../hook/TinTucHook";
import { createTinTucWithFile } from "../../../provider/TinTucProvide";
import type { TinTuc } from "../../../types/tin-tuc";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

interface TinTucForm {
  tieu_de: string;
  noi_dung: string;
  hinh_anh: string | File | null;
}

export default function CreateTinTuc() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: tinTucDetail, isLoading: isLoadingDetail } = useTinTucDetail(id || null);
  const createTinTuc = useCreateTinTuc();
  const updateTinTuc = useUpdateTinTuc();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TinTucForm>({
    tieu_de: "",
    noi_dung: "",
    hinh_anh: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (tinTucDetail && id) {
      setFormData({
        tieu_de: tinTucDetail.tieu_de,
        noi_dung: tinTucDetail.noi_dung,
        hinh_anh: tinTucDetail.hinh_anh || null,
      });
      setPreviewImage(tinTucDetail.hinh_anh || null);
    }
  }, [tinTucDetail, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Vui lòng chọn tệp hình ảnh (jpg, png, ...)",
        });
        return;
      }
      setFormData((prev) => ({
        ...prev,
        hinh_anh: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const payload: Partial<Omit<TinTuc, "id" | "created_at" | "updated_at" | "deleted_at">> = {
          tieu_de: formData.tieu_de,
          noi_dung: formData.noi_dung,
          hinh_anh: typeof formData.hinh_anh === "string" ? formData.hinh_anh : null,
        };

        const res = await updateTinTuc.mutateAsync({ id, values: payload });
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: res.message || "Cập nhật tin tức thành công!",
        });
      } else {
        const res = await createTinTucWithFile({
          tieu_de: formData.tieu_de,
          noi_dung: formData.noi_dung,
          hinh_anh: formData.hinh_anh instanceof File ? formData.hinh_anh : undefined,
        });
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: res.message || "Tạo tin tức thành công!",
        });
      }

      navigate("/admin/tin-tuc");
    } catch (err: any) {
      console.error("❌ Lỗi xử lý tin tức:", err);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: err.response?.data?.message || "Không thể xử lý tin tức",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingDetail && id) {
    return <p className="text-center">Đang tải dữ liệu tin tức...</p>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          {id ? "Chỉnh sửa Tin Tức" : "Thêm Tin Tức Mới"}
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Tiêu đề */}
            <div className="mb-3">
              <label className="form-label fw-bold">Tiêu đề</label>
              <input
                type="text"
                name="tieu_de"
                className="form-control"
                placeholder="Nhập tiêu đề..."
                value={formData.tieu_de}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Nội dung</label>
              <CKEditor
                editor={ClassicEditor}
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
                    writer.setStyle("min-height", "200px", editor.editing.view.document.getRoot());
                  });
                }}
              />
            </div>

            {/* Hình ảnh */}
            <div className="mb-3">
              <label className="form-label fw-bold">Hình ảnh</label>
              <input
                type="file"
                name="hinh_anh"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      objectFit: "contain",
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
                {loading
                  ? "Đang lưu..."
                  : id
                  ? "Cập nhật tin tức"
                  : "Lưu tin tức"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
