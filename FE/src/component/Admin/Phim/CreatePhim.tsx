import React, { useState, useEffect } from "react";

interface ModalFormProps {
  phim?: any;
  onSubmit: (values: FormData) => void;
  onClose: () => void;
}

const CreatePhim: React.FC<ModalFormProps> = ({ phim, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<any>({
    ten_phim: "",
    mo_ta: "",
    thoi_luong: "",
    ngon_ngu: "",
    quoc_gia: "",
    anh_poster: "",
    anh_poster_preview: "",
    ngay_cong_chieu: "",
    ngay_ket_thuc: "",
    do_tuoi_gioi_han: "",
    loai_suat_chieu: "",
    phien_ban_id: "",
    the_loai_id: "",
  });

  // objectURL để revoke khi unmount/đổi file
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const danhSachTheLoai = [
    { id: 1, ten_the_loai: "Hành động" },
    { id: 2, ten_the_loai: "Hài" },
    { id: 3, ten_the_loai: "Tình cảm" },
    { id: 4, ten_the_loai: "Kinh dị" },
    { id: 5, ten_the_loai: "Hoạt hình" },
  ];

  const danhSachPhienBan = [
    { id: 1, ten_phien_ban: "2D" },
    { id: 2, ten_phien_ban: "3D" },
  ];

  const danhSachLoaiSuat = ["Thường", "Đặc biệt", "Sớm"] as const;
  type LoaiSuat = (typeof danhSachLoaiSuat)[number] | "";

  // Chuẩn hóa date -> bỏ giờ để so sánh theo ngày
  const toDateOnly = (val: string | Date | null | undefined) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // created_at: khi sửa lấy từ phim, khi thêm mới dùng ngày hôm nay
  const createdAtDate = React.useMemo(() => {
    const base = phim?.created_at ? new Date(phim.created_at) : new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, [phim?.created_at]);

  // gợi ý min/max cho input date tùy theo loại suất
  const dateConstraints = React.useMemo(() => {
    const loai: LoaiSuat = formData.loai_suat_chieu || "";
    const d = new Date(createdAtDate);
    const toISO = (x: Date) => x.toISOString().slice(0, 10);

    // Thường: Ngày chiếu > Ngày tạo  => min = created_at + 1
    if (loai === "Thường") {
      const min = new Date(d);
      min.setDate(min.getDate() + 1);
      return { minNgayChieu: toISO(min), maxNgayChieu: undefined as string | undefined };
    }

    // Đặc biệt: Ngày chiếu ≥ Ngày tạo => min = created_at
    if (loai === "Đặc biệt") {
      return { minNgayChieu: toISO(d), maxNgayChieu: undefined };
    }

    // Sớm: Ngày chiếu < Ngày tạo => max = created_at - 1
    if (loai === "Sớm") {
      const max = new Date(d);
      max.setDate(max.getDate() - 1);
      return { minNgayChieu: undefined, maxNgayChieu: toISO(max) };
    }

    return { minNgayChieu: undefined, maxNgayChieu: undefined };
  }, [formData.loai_suat_chieu, createdAtDate]);

  // Prefill khi sửa
  useEffect(() => {
    if (phim) {
      setFormData((prev: any) => ({
        ...prev,
        ...phim,
        anh_poster_preview: phim.anh_poster ? phim.anh_poster : "",
      }));
    }
  }, [phim]);

  // Revoke objectURL khi đổi file/ unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(url);
    setFormData((s: any) => ({
      ...s,
      anh_poster: file,
      anh_poster_preview: url,
    }));
  };

  const validateDates = () => {
    const loai: LoaiSuat = formData.loai_suat_chieu || "";
    const ngayChieu = toDateOnly(formData.ngay_cong_chieu);
    const ngayKetThuc = toDateOnly(formData.ngay_ket_thuc);
    const ngayTao = createdAtDate;

    if (!loai) {
      alert("❌ Vui lòng chọn loại suất chiếu.");
      return false;
    }
    if (!ngayChieu) {
      alert("❌ Vui lòng nhập Ngày công chiếu hợp lệ.");
      return false;
    }

    if (loai === "Thường" && !(ngayChieu > ngayTao)) {
      alert("❌ Suất chiếu Thường: Ngày chiếu phải LỚN HƠN Ngày tạo.");
      return false;
    }
    if (loai === "Đặc biệt" && !(ngayChieu >= ngayTao)) {
      alert("❌ Suất chiếu Đặc biệt: Ngày chiếu phải LỚN HƠN HOẶC BẰNG Ngày tạo.");
      return false;
    }
    if (loai === "Sớm" && !(ngayChieu < ngayTao)) {
      alert("❌ Suất chiếu Sớm: Ngày chiếu phải NHỎ HƠN Ngày tạo.");
      return false;
    }

    if (ngayKetThuc && !(ngayKetThuc >= ngayChieu)) {
      alert("❌ Ngày kết thúc phải LỚN HƠN HOẶC BẰNG Ngày công chiếu.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] && key !== "anh_poster_preview") {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  // Gợi ý nhanh rule hiển thị theo loại suất
  const RuleHint = () => {
    const loai: LoaiSuat = formData.loai_suat_chieu || "";
    if (!loai) return null;
    const d = createdAtDate.toLocaleDateString("vi-VN");
    if (loai === "Thường")
      return <p className="text-xs text-gray-500 mt-1">Quy tắc: Ngày chiếu &gt; Ngày tạo ({d}).</p>;
    if (loai === "Đặc biệt")
      return <p className="text-xs text-gray-500 mt-1">Quy tắc: Ngày chiếu ≥ Ngày tạo ({d}).</p>;
    if (loai === "Sớm")
      return <p className="text-xs text-gray-500 mt-1">Quy tắc: Ngày chiếu &lt; Ngày tạo ({d}).</p>;
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[500px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
          {phim ? "✏️ Sửa phim" : "🎬 Thêm phim mới"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Tên phim */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tên phim</label>
            <input
              type="text"
              value={formData.ten_phim || ""}
              onChange={(e) => setFormData({ ...formData, ten_phim: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-sm font-medium text-gray-700">Mô tả phim</label>
            <textarea
              value={formData.mo_ta || ""}
              onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Ngôn ngữ & Quốc gia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Ngôn ngữ</label>
              <input
                type="text"
                value={formData.ngon_ngu || ""}
                onChange={(e) => setFormData({ ...formData, ngon_ngu: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Quốc gia</label>
              <input
                type="text"
                value={formData.quoc_gia || ""}
                onChange={(e) => setFormData({ ...formData, quoc_gia: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          </div>

          {/* Ảnh Poster */}
          <div>
            <label className="text-sm font-medium text-gray-700">Ảnh poster</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="border px-3 py-2 rounded w-full"
            />
            {formData.anh_poster_preview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={formData.anh_poster_preview}
                  alt="Poster preview"
                  className="w-40 h-56 object-cover rounded-lg shadow"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/fallback-poster.png";
                  }}
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Thời lượng & Độ tuổi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Thời lượng (phút)</label>
              <input
                type="number"
                value={formData.thoi_luong || ""}
                onChange={(e) =>
                  setFormData({ ...formData, thoi_luong: e.target.value ? Number(e.target.value) : "" })
                }
                className="border px-3 py-2 rounded w-full"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Độ tuổi giới hạn</label>
              <input
                type="text"
                placeholder="VD: 13+"
                value={formData.do_tuoi_gioi_han || ""}
                onChange={(e) => setFormData({ ...formData, do_tuoi_gioi_han: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          </div>

          {/* Ngày công chiếu & kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Ngày công chiếu</label>
              <input
                type="date"
                value={formData.ngay_cong_chieu || ""}
                onChange={(e) => setFormData({ ...formData, ngay_cong_chieu: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                min={dateConstraints.minNgayChieu}
                max={dateConstraints.maxNgayChieu}
                required
              />
              <RuleHint />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.ngay_ket_thuc || ""}
                onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              {formData.ngay_cong_chieu && (
                <p className="text-xs text-gray-500 mt-1">
                  Gợi ý: Nên đặt ≥ {new Date(formData.ngay_cong_chieu).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>

          {/* Selects */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Loại suất chiếu</label>
              <select
                value={formData.loai_suat_chieu || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loai_suat_chieu: e.target.value,
                    // reset ngày chiếu khi đổi loại để tránh vi phạm min/max cũ
                    ngay_cong_chieu: "",
                  })
                }
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value="">-- Chọn loại suất chiếu --</option>
                {danhSachLoaiSuat.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phiên bản</label>
              <select
                value={formData.phien_ban_id || ""}
                onChange={(e) => setFormData({ ...formData, phien_ban_id: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              >
                <option value="">-- Chọn phiên bản --</option>
                {danhSachPhienBan.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.ten_phien_ban}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thể loại */}
          <div>
            <label className="text-sm font-medium text-gray-700">Thể loại</label>
            <select
              value={formData.the_loai_id || ""}
              onChange={(e) => setFormData({ ...formData, the_loai_id: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            >
              <option value="">-- Chọn thể loại --</option>
              {danhSachTheLoai.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.ten_the_loai}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {phim ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhim;
