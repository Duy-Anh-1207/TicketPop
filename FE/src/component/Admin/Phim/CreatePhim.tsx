import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useCreatePhim, useListPhienBan, useListTheLoai } from "../../../hook/PhimHook";

type FormState = {
  ten_phim: string;
  the_loai: number[];
  phien_ban: number[];
  thoi_luong: number;
  anh_poster?: File | null;
  loai_suat_chieu: string;
  ngay_cong_chieu: string;
  ngay_ket_thuc: string;
  do_tuoi_gioi_han: string;
  trailer: string;
  quoc_gia: string;
  ngon_ngu: string;
};

export default function CreatePhim() {
  const navigate = useNavigate();
  const createPhim = useCreatePhim({ resource: "phim" });

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
  });

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormValues((prev) => ({ ...prev, anh_poster: file }));
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
    setFormValues((prev) => ({ ...prev, [name]: selected } as any));
  };

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

    createPhim.mutate({ ...formValues }, { onSuccess: () => navigate("/admin/phim") });
  };

  return (
    <div className="container my-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">🎬 Thêm phim mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
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

              <div className="col-md-6">
                <label className="form-label">Thể loại</label>
                <select
                  name="the_loai"
                  multiple
                  value={formValues.the_loai.map(String)}
                  onChange={handleMultiSelect}
                  className="form-select"
                  size={5}
                >
                  {theLoaiList.map((tl: any) => (
                    <option key={tl.id} value={tl.id}>
                      {tl.ten_the_loai}
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">Giữ Ctrl/Cmd để chọn nhiều</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Phiên bản</label>
                <select
                  name="phien_ban"
                  multiple
                  value={formValues.phien_ban.map(String)}
                  onChange={handleMultiSelect}
                  className="form-select"
                  size={5}
                >
                  {phienBanList.map((pb: any) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.the_loai}
                    </option>
                  ))}
                </select>
                <small className="form-text text-muted">Chọn phiên bản (nếu có)</small>
              </div>

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

              <div className="col-12">
                <label className="form-label">Ảnh Poster</label>
                <input
                  type="file"
                  name="anh_poster"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {formValues.anh_poster instanceof Blob && (
                  <img
                    src={URL.createObjectURL(formValues.anh_poster)}
                    alt="Poster Preview"
                    className="img-thumbnail mt-2"
                    style={{ width: 150, height: 220, objectFit: "cover" }}
                  />
                )}
              </div>

              <div className="col-12 text-end mt-3">
                <button
                  type="submit"
                  disabled={createPhim.isPending}
                  className="btn btn-primary"
                >
                  {createPhim.isPending ? "Đang thêm..." : "Thêm phim"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
