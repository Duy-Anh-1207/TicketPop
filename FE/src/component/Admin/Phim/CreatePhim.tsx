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
    anh_poster: null,
    anh_poster_preview: "",
    ngay_cong_chieu: "",
    ngay_ket_thuc: "",
    do_tuoi_gioi_han: "",
    loai_suat_chieu: "",
    phien_ban_id: [] as number[],
    the_loai_id: [] as number[],
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [danhSachTheLoai, setDanhSachTheLoai] = useState<
    Array<{ id: number; ten_the_loai: string }>
  >([]);
  const danhSachPhienBan = [
    { id: 1, ten_phien_ban: "Lồng tiếng" },
    { id: 2, ten_phien_ban: "Thuyết minh" },
    { id: 3, ten_phien_ban: "Vietsub" },
  ];
  const danhSachLoaiSuat = ["Thường", "Đặc biệt", "Sớm"] as const;
  type LoaiSuat = (typeof danhSachLoaiSuat)[number] | "";

  // 🧩 Helper parse array từ dữ liệu backend
  const safeParseArray = (v: any) => {
    if (!v && v !== 0) return [];
    if (Array.isArray(v)) return v.map((x) => Number(x));
    if (typeof v === "string") {
      try {
        const p = JSON.parse(v);
        if (Array.isArray(p)) return p.map((x) => Number(x));
      } catch (e) {
        return (
          v
            .split?.(",")
            .map((x: string) => Number(x.trim()))
            .filter(Boolean) || []
        );
      }
    }
    return [];
  };

  // 🧠 Lấy danh sách thể loại từ API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("hhttp://localhost:5173/admin/the-loai"); 
        if (!res.ok) throw new Error("Không lấy được danh sách thể loại");
        const json = await res.json();
        if (mounted && json.data && Array.isArray(json.data)) {
          setDanhSachTheLoai(json.data);
        }
      } catch (err) {
        console.warn("Fetch thể loại lỗi:", err);
        setDanhSachTheLoai([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🧩 Khi có phim (chế độ sửa)
  useEffect(() => {
    if (phim) {
      setFormData((prev: any) => ({
        ...prev,
        ...phim,
        anh_poster_preview: phim.anh_poster
          ? phim.anh_poster
          : prev.anh_poster_preview,
        the_loai_id: safeParseArray(phim.the_loai_id),
        phien_ban_id: safeParseArray(phim.phien_ban_id),
      }));
    }
  }, [phim]);

  // cleanup preview URL
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

  const toDateOnly = (val: string | Date | null | undefined) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const createdAtDate = React.useMemo(() => {
    const base = phim?.created_at ? new Date(phim.created_at) : new Date();
    base.setHours(0, 0, 0, 0);
    return base;
  }, [phim?.created_at]);

  const dateConstraints = React.useMemo(() => {
    const loai: LoaiSuat = formData.loai_suat_chieu || "";
    const d = new Date(createdAtDate);
    const toISO = (x: Date) => x.toISOString().slice(0, 10);

    if (loai === "Thường") {
      const min = new Date(d);
      min.setDate(min.getDate() + 1);
      return { minNgayChieu: toISO(min), maxNgayChieu: undefined as string | undefined };
    }
    if (loai === "Đặc biệt") {
      return { minNgayChieu: toISO(d), maxNgayChieu: undefined };
    }
    if (loai === "Sớm") {
      const max = new Date(d);
      max.setDate(max.getDate() - 1);
      return { minNgayChieu: undefined, maxNgayChieu: toISO(max) };
    }
    return { minNgayChieu: undefined, maxNgayChieu: undefined };
  }, [formData.loai_suat_chieu, createdAtDate]);

  // ✅ Validate ngày chiếu theo loại suất
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

  const toggleArrayValue = (key: "the_loai_id" | "phien_ban_id", id: number) => {
    setFormData((s: any) => {
      const arr = Array.isArray(s[key]) ? [...s[key]] : [];
      const idx = arr.indexOf(id);
      if (idx === -1) arr.push(id);
      else arr.splice(idx, 1);
      return { ...s, [key]: arr };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDates()) return;

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (key === "anh_poster_preview") return;
      if (value === undefined || value === null || value === "") return;

      if (value instanceof File) {
        data.append(key, value);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, String(v)));
        return;
      }

      data.append(key, String(value));
    });

    onSubmit(data);
  };

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

  // ===================== JSX =====================
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
                  Gợi ý: Nên đặt ≥{" "}
                  {new Date(formData.ngay_cong_chieu).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>

          {/* Loại suất & Phiên bản */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Loại suất chiếu</label>
              <select
                value={formData.loai_suat_chieu || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    loai_suat_chieu: e.target.value,
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
              <label className="text-sm font-medium text-gray-700">Phiên bản (chọn nhiều)</label>
              <div className="border px-3 py-2 rounded w-full max-h-36 overflow-y-auto">
                {danhSachPhienBan.map((pb) => (
                  <label key={pb.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(formData.phien_ban_id) &&
                        formData.phien_ban_id.includes(pb.id)
                      }
                      onChange={() => toggleArrayValue("phien_ban_id", pb.id)}
                    />
                    <span className="text-sm">{pb.ten_phien_ban}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Thể loại */}
          <div>
            <label className="text-sm font-medium text-gray-700">Thể loại (chọn nhiều)</label>
            <div className="border px-3 py-2 rounded w-full max-h-36 overflow-y-auto">
              {danhSachTheLoai.length === 0 ? (
                <p className="text-sm text-gray-500">Đang tải thể loại...</p>
              ) : (
                danhSachTheLoai.map((tl) => (
                  <label key={tl.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(formData.the_loai_id) &&
                        formData.the_loai_id.includes(tl.id)
                      }
                      onChange={() => toggleArrayValue("the_loai_id", tl.id)}
                    />
                    <span className="text-sm">{tl.ten_the_loai}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded"
            >
              {phim ? "Cập nhật" : "Thêm phim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePhim;
