// CreateLichChieu.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { createLichChieu } from "../../../provider/LichChieuProviders";
import { getListPhim } from "../../../provider/PhimProvider";
import { getListPhongChieu } from "../../../provider/PhongChieuProvider";
import { getListPhienBan } from "../../../provider/PhienBanProvider";

export default function CreateLichChieu() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phim_id: "",
    phong_id: "",
    phien_ban_id: [],
    gio_chieu: "",
    gio_ket_thuc: "",
  });

  type Phim = { id: number; ten_phim: string; phien_ban_id: string; thoi_luong: number };
  type Phong = { id: number; ten_phong: string };
  type PhienBan = { id: number; ten_phien_ban: string };

  const [phimList, setPhimList] = useState<Phim[]>([]);
  const [phongList, setPhongList] = useState<Phong[]>([]);
  const [phienBanList, setPhienBanList] = useState<PhienBan[]>([]);
  const [tatCaPhienBan, setTatCaPhienBan] = useState<PhienBan[]>([]);
  const [selectedPhim, setSelectedPhim] = useState<Phim | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Load phim, phòng, phiên bản
  useEffect(() => {
    const fetchData = async () => {
      try {
        const phimRes = await getListPhim({});
        const phimData = Array.isArray(phimRes.data) ? phimRes.data : phimRes;
        setPhimList(phimData);

        const phongRes = await getListPhongChieu();
        const phongData = Array.isArray(phongRes.data) ? phongRes.data : phongRes;
        setPhongList(phongData);

        const phienBanRes = await getListPhienBan({});
        const phienBanData = Array.isArray(phienBanRes.data) ? phienBanRes.data : phienBanRes;
        setTatCaPhienBan(phienBanData);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách phim, phòng hoặc phiên bản", "error");
      }
    };
    fetchData();
  }, []);

  const handlePhimChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const phimId = e.target.value;
  const phim = phimList.find((p) => String(p.id) === phimId) || null;

  setSelectedPhim(phim);
  setFormData((prev) => ({ ...prev, phim_id: phimId, phien_ban_id: null }));

  if (phim && phim.phien_ban_id) {
    try {
      console.log("🔹 Raw phien_ban_id trong phim:", phim.phien_ban_id);

      let cleaned = phim.phien_ban_id;
      if (typeof cleaned === "string") {
        cleaned = cleaned.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
      }

      const ids = JSON.parse(cleaned).map(String);
      console.log("✅ Mảng ID sau khi xử lý:", ids);

      const filtered = tatCaPhienBan.filter((pb) => ids.includes(String(pb.id)));
      console.log("🎞 Phiên bản tìm được:", filtered);

      setPhienBanList(filtered);
    } catch (err) {
      console.warn("⚠️ Không thể parse phien_ban_id:", err);
      setPhienBanList([]);
    }
  } else {
    setPhienBanList([]);
  }
};


  // 🔹 Khi chọn giờ chiếu → tự tính giờ kết thúc = giờ chiếu + thời lượng phim + 15 phút
  const handleGioChieuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let gioKetThuc = "";

    if (selectedPhim?.thoi_luong) {
      gioKetThuc = dayjs(value)
        .add(selectedPhim.thoi_luong + 15, "minute")
        .format("YYYY-MM-DDTHH:mm");
    }

    setFormData((prev) => ({
      ...prev,
      gio_chieu: value,
      gio_ket_thuc: gioKetThuc,
    }));
  };

  // 🔹 Thay đổi các trường khác
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Gửi form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.phim_id || !formData.phong_id || !formData.gio_chieu || !formData.gio_ket_thuc) {
      setLoading(false);
      Swal.fire("⚠️ Thiếu thông tin", "Vui lòng nhập đủ thông tin bắt buộc!", "warning");
      return;
    }

    try {
      const payload = {
        phim_id: Number(formData.phim_id),
        phong_id: Number(formData.phong_id),
        phien_ban_id: formData.phien_ban_id ? Number(formData.phien_ban_id) : null,
        gio_chieu: formData.gio_chieu,
        gio_ket_thuc: formData.gio_ket_thuc,
      };

      const res = await createLichChieu(payload);
      Swal.fire("🎉 Thành công", res.message || "Tạo lịch chiếu thành công!", "success");
      navigate("/admin/lich-chieu");
    } catch (err: any) {
      console.error("❌ Lỗi tạo lịch chiếu:", err);
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể tạo lịch chiếu", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          ➕ Thêm Lịch Chiếu Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Phim */}
            <div className="mb-3">
              <label className="form-label fw-bold">🎬 Phim</label>
              <select
                name="phim_id"
                className="form-select"
                value={formData.phim_id}
                onChange={handlePhimChange}
                required
              >
                <option value="">-- Chọn phim --</option>
                {phimList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ten_phim}
                  </option>
                ))}
              </select>
            </div>

            {/* Phiên bản */}
            <div className="mb-3">
              <label className="form-label fw-bold">🎞 Phiên bản</label>
              <select
                name="phien_ban_id"
                className="form-select"
                value={formData.phien_ban_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn phiên bản --</option>
                {phienBanList.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.ten_phien_ban}
                  </option>
                ))}
              </select>
            </div>

            {/* Phòng chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">🏢 Phòng chiếu</label>
              <select
                name="phong_id"
                className="form-select"
                value={formData.phong_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn phòng chiếu --</option>
                {phongList.map((phong) => (
                  <option key={phong.id} value={phong.id}>
                    {phong.ten_phong}
                  </option>
                ))}
              </select>
            </div>

            {/* Giờ chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">🕐 Giờ chiếu</label>
              <input
                type="datetime-local"
                name="gio_chieu"
                className="form-control"
                value={formData.gio_chieu}
                onChange={handleGioChieuChange}
                required
              />
            </div>

            {/* Giờ kết thúc */}
            <div className="mb-3">
              <label className="form-label fw-bold">⏰ Giờ kết thúc (tự động)</label>
              <input
                type="datetime-local"
                name="gio_ket_thuc"
                className="form-control"
                value={formData.gio_ket_thuc}
                disabled
                readOnly
              />
              {selectedPhim?.thoi_luong && (
                <p className="text-muted mt-1">
                  * Thời lượng phim: {selectedPhim.thoi_luong} phút + 15 phút dọn phòng
                </p>
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

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "⏳ Đang lưu..." : "Lưu lịch chiếu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
