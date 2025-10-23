import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useCreatePhim,
  useUpdatePhim,
  useGetPhimById,
  useListPhienBan,
  useListTheLoai,
} from "../../../hook/PhimHook";
import Select from "react-select";

type FormState = {
  ten_phim: string;
  the_loai: number[];
  phien_ban: number[];
  thoi_luong: number;
  anh_poster?: File | string | null;
  loai_suat_chieu: string;
  ngay_cong_chieu: string;
  ngay_ket_thuc: string;
  do_tuoi_gioi_han: string;
  trailer: string;
  quoc_gia: string;
  ngon_ngu: string;
  mo_ta: string;
};

export default function CreatePhim() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const createPhim = useCreatePhim({ resource: "phim" });
  const updatePhim = useUpdatePhim({ resource: "phim" });
  const { data: phimData, isLoading } = useGetPhimById(id ? Number(id) : undefined);

  const { data: theLoaiList = [] } = useListTheLoai();
  const { data: phienBanList = [] } = useListPhienBan();

  const LOAI_SUAT_OPTIONS = ["Thường", "Đặc biệt", "Sớm"];

  const [formValues, setFormValues] = useState<FormState>({
    ten_phim: "",
    the_loai: [],
    phien_ban: [],
    thoi_luong: 90,
    anh_poster: null,
    do_tuoi_gioi_han: "",
    loai_suat_chieu: "",
    ngay_cong_chieu: "",
    ngay_ket_thuc: "",
    trailer: "",
    quoc_gia: "",
    ngon_ngu: "",
    mo_ta: "",
  });

  // ✅ Khi có id (edit mode), load dữ liệu để fill form
  useEffect(() => {
    if (phimData) {
      setFormValues({
        ten_phim: phimData.ten_phim || "",
        // đảm bảo chuyển về mảng id
        the_loai: Array.isArray(phimData.the_loai_ids)
          ? phimData.the_loai_ids
          : (phimData.the_loai?.map((tl: any) => tl.id) || []),
        phien_ban: Array.isArray(phimData.phien_ban_ids)
          ? phimData.phien_ban_ids
          : (phimData.phien_ban?.map((pb: any) => pb.id) || []),
        thoi_luong: phimData.thoi_luong || 90,
        anh_poster: phimData.anh_poster || null,
        do_tuoi_gioi_han: phimData.do_tuoi_gioi_han || "",
        loai_suat_chieu: phimData.loai_suat_chieu || "",
        ngay_cong_chieu: phimData.ngay_cong_chieu || "",
        ngay_ket_thuc: phimData.ngay_ket_thuc || "",
        trailer: phimData.trailer || "",
        quoc_gia: phimData.quoc_gia || "",
        ngon_ngu: phimData.ngon_ngu || "",
        mo_ta: phimData.mo_ta || "",
      });
    }
  }, [phimData]);


  const handleSimpleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormValues((prev) => ({ ...prev, anh_poster: file }));
  };

  // const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const name = e.target.name;
  //   const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
  //   setFormValues((prev) => ({ ...prev, [name]: selected } as any));
  // };

  const RuleHint = () => {
    const loai = formValues.loai_suat_chieu || "";
    if (!loai) return null;
    const todayStr = new Date().toLocaleDateString("vi-VN");
    const ruleText =
      loai === "Thường"
        ? `Ngày chiếu > Ngày tạo (${todayStr})`
        : loai === "Đặc biệt"
          ? `Ngày chiếu ≥ Ngày tạo (${todayStr})`
          : `Ngày chiếu < Ngày tạo (${todayStr})`;
    return <small className="form-text text-muted">{`Quy tắc: ${ruleText}`}</small>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.ten_phim.trim())
      return Swal.fire({ icon: "warning", title: "Vui lòng nhập tên phim" });
    if (!formValues.do_tuoi_gioi_han.trim())
      return Swal.fire({ icon: "warning", title: "Vui lòng nhập độ tuổi giới hạn" });
    if (!formValues.loai_suat_chieu)
      return Swal.fire({ icon: "warning", title: "Vui lòng chọn loại suất chiếu" });
    if (!formValues.ngay_cong_chieu)
      return Swal.fire({ icon: "warning", title: "Vui lòng chọn ngày công chiếu" });

    const today = new Date();
    const [y, m, d] = formValues.ngay_cong_chieu.split("-").map(Number);
    const ngayChieu = new Date(y, m - 1, d);
    const yDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (
      (formValues.loai_suat_chieu === "Thường" && !(ngayChieu > yDate)) ||
      (formValues.loai_suat_chieu === "Đặc biệt" && !(ngayChieu >= yDate)) ||
      (formValues.loai_suat_chieu === "Sớm" && !(ngayChieu < yDate))
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Ngày công chiếu không hợp lệ",
      });
    }

    // ✅ Gộp logic submit chung cho create & edit
    const mutateFn = isEditMode
      ? updatePhim.mutateAsync({ id: Number(id), values: formValues })
      : createPhim.mutateAsync(formValues);

    mutateFn
      .then(() => {
        Swal.fire({
          icon: "success",
          title: isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!",
          timer: 1200,
          showConfirmButton: false,
        });
        navigate("/admin/phim");
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Có lỗi xảy ra khi lưu dữ liệu!",
        });
      });
  };

  if (isEditMode && isLoading) {
    return <div className="text-center mt-4">Đang tải dữ liệu phim...</div>;
  }

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">
            {isEditMode ? "✏️ Chỉnh sửa phim" : "🎬 Thêm phim mới"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* ====== Tên phim ====== */}
              <div className="col-md-6">
                <label className="form-label">Tên phim</label>
                <input
                  type="text"
                  name="ten_phim"
                  value={formValues.ten_phim}
                  onChange={handleSimpleChange}
                  className="form-control"
                  placeholder="Nhập tên phim"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Độ tuổi giới hạn</label>
                <input
                  type="text"
                  name="do_tuoi_gioi_han"
                  value={formValues.do_tuoi_gioi_han}
                  onChange={handleSimpleChange}
                  className="form-control"
                  placeholder="VD: 13+, 16+, 18+"
                />
              </div>

              {/* ====== Mô tả ====== */}
              <div className="col-12">
                <label className="form-label">Mô tả phim</label>
                <textarea
                  name="mo_ta"
                  value={formValues.mo_ta}
                  onChange={handleSimpleChange}
                  className="form-control"
                  rows={3}
                  placeholder="Nhập mô tả ngắn..."
                ></textarea>
              </div>

              {/* ====== Thời lượng / loại suất / ngày ====== */}
              <div className="col-md-4">
                <label className="form-label">Thời lượng (phút)</label>
                <input
                  type="number"
                  name="thoi_luong"
                  value={formValues.thoi_luong || ""}
                  onChange={handleSimpleChange}
                  min={1}
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Loại suất chiếu</label>
                <select
                  name="loai_suat_chieu"
                  value={formValues.loai_suat_chieu}
                  onChange={handleSimpleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Chọn --</option>
                  {LOAI_SUAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <RuleHint />
              </div>

              <div className="col-md-4">
                <label className="form-label">Thời gian</label>
                <div className="d-flex gap-2">
                  <input
                    type="date"
                    name="ngay_cong_chieu"
                    value={formValues.ngay_cong_chieu}
                    onChange={handleSimpleChange}
                    className="form-control"
                    required
                  />
                  <input
                    type="date"
                    name="ngay_ket_thuc"
                    value={formValues.ngay_ket_thuc}
                    onChange={handleSimpleChange}
                    className="form-control"
                  />
                </div>
              </div>

              {/* ====== Thể loại ====== */}
              <div className="col-md-6">
                <label className="form-label">Thể loại</label>
                <Select
                  isMulti
                  name="the_loai"
                  options={theLoaiList.map((tl: any) => ({
                    value: tl.id,
                    label: tl.ten_the_loai,
                  }))}
                  value={theLoaiList
                    .filter((tl: any) => formValues.the_loai.includes(tl.id))
                    .map((tl: any) => ({ value: tl.id, label: tl.ten_the_loai }))}
                  onChange={(selected: any) =>
                    setFormValues((prev) => ({
                      ...prev,
                      the_loai: selected.map((s: any) => s.value),
                    }))
                  }
                  classNamePrefix="select"
                  placeholder="Chọn thể loại..."
                />
              </div>

              {/* ====== Phiên bản ====== */}
              <div className="col-md-6">
                <label className="form-label">Phiên bản</label>
                <Select
                  isMulti
                  name="phien_ban"
                  options={phienBanList.map((pb: any) => ({
                    value: pb.id,
                    label: pb.the_loai || "Không tên",
                  }))}
                  value={phienBanList
                    .filter((pb: any) => formValues.phien_ban.includes(pb.id))
                    .map((pb: any) => ({
                      value: pb.id,
                      label: pb.the_loai || "Không tên",
                    }))}
                  onChange={(selected: any) =>
                    setFormValues((prev) => ({
                      ...prev,
                      phien_ban: selected.map((s: any) => s.value),
                    }))
                  }
                  classNamePrefix="select"
                  placeholder="Chọn phiên bản..."
                />
              </div>


              {/* ====== Quốc gia, ngôn ngữ, trailer ====== */}
              <div className="col-md-6">
                <label className="form-label">Quốc gia</label>
                <input
                  type="text"
                  name="quoc_gia"
                  value={formValues.quoc_gia}
                  onChange={handleSimpleChange}
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Ngôn ngữ</label>
                <input
                  type="text"
                  name="ngon_ngu"
                  value={formValues.ngon_ngu}
                  onChange={handleSimpleChange}
                  className="form-control"
                />
              </div>

              <div className="col-12">
                <label className="form-label">Trailer (URL)</label>
                <input
                  type="text"
                  name="trailer"
                  value={formValues.trailer}
                  onChange={handleSimpleChange}
                  className="form-control"
                  placeholder="https://..."
                />
              </div>

              {/* ====== Ảnh Poster ====== */}
              <div className="col-12">
                <label className="form-label">Ảnh Poster</label>
                <input
                  type="file"
                  name="anh_poster"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />

                {formValues.anh_poster && (
                  <div className="mt-2">
                    {(() => {
                      let imageUrl = "";

                      // Nếu là File mới upload
                      if (formValues.anh_poster instanceof File) {
                        imageUrl = URL.createObjectURL(formValues.anh_poster);
                      }
                      // Nếu là string (đường dẫn trong DB)
                      else if (typeof formValues.anh_poster === "string") {
                        imageUrl = formValues.anh_poster.startsWith("http")
                          ? formValues.anh_poster
                          : `${import.meta.env.VITE_API_BASE_URL}/storage/${formValues.anh_poster.replace("posters/", "posters/")}`;
                      }

                      return (
                        <img
                          src={imageUrl}
                          alt="Poster"
                          className="rounded border shadow-sm"
                          style={{ width: 180, height: 260, objectFit: "cover" }}
                        />
                      );
                    })()}
                  </div>
                )}
              </div>


              {/* ====== Submit ====== */}
              <div className="col-12 text-end mt-3">
                <button
                  type="submit"
                  disabled={createPhim.isPending || updatePhim.isPending}
                  className="btn btn-primary"
                >
                  {isEditMode
                    ? updatePhim.isPending
                      ? "Đang cập nhật..."
                      : "Cập nhật"
                    : createPhim.isPending
                      ? "Đang thêm..."
                      : "Thêm phim"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
