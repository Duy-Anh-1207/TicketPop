import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createLichChieu } from "../../../provider/LichChieuProviders";
import { getListPhim } from "../../../provider/PhimProvider";
import { getListPhongChieu } from "../../../provider/PhongChieuProvider";
import { getListPhienBan } from "../../../provider/PhienBanProvider";
import type { Phim } from "../../../types/phim";
import type { PhongChieu } from "../../../types/phongchieu";
import type { PhienBan } from "../../../types/phienban";

export default function CreateLichChieu() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phim_id: "",
    phong_id: "",
    phien_ban_id: "",
    gio_chieu: "",
    gio_ket_thuc: "",
  });

  const [phimList, setPhimList] = useState<Phim[]>([]);
  const [phongList, setPhongList] = useState<PhongChieu[]>([]);
  const [phienBanList, setPhienBanList] = useState<PhienBan[]>([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách phim, phòng, và phiên bản khi load trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách phim
        const phimRes = await getListPhim({});
        const phimData = Array.isArray(phimRes.data) ? phimRes.data : phimRes;
        setPhimList(phimData);
        if (phimData.length > 0 && !formData.phim_id) {
          setFormData((prev) => ({ ...prev, phim_id: String(phimData[0].id) }));
        }

        // Lấy danh sách phòng
        const phongRes = await getListPhongChieu();
        const phongData = Array.isArray(phongRes.data) ? phongRes.data : phongRes;
        setPhongList(phongData);
        if (phongData.length > 0 && !formData.phong_id) {
          setFormData((prev) => ({ ...prev, phong_id: String(phongData[0].id) }));
        }

        // Lấy danh sách phiên bản
        const phienBanRes = await getListPhienBan();
        const phienBanData = Array.isArray(phienBanRes) ? phienBanRes : phienBanRes.data;
        setPhienBanList(phienBanData);
        if (phienBanData.length > 0 && !formData.phien_ban_id) {
          setFormData((prev) => ({ ...prev, phien_ban_id: String(phienBanData[0].id) }));
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách phim, phòng hoặc phiên bản", "error");
      }
    };
    fetchData();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Client-side guard: kiểm tra các trường bắt buộc
    if (!formData.phim_id || !formData.phong_id || !formData.gio_chieu || !formData.gio_ket_thuc) {
      setLoading(false);
      Swal.fire("❗ Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc.", "warning");
      return;
    }

    try {
      const payload: any = {
        phim_id: Number(formData.phim_id),
        phong_id: Number(formData.phong_id),
        phien_ban_id: formData.phien_ban_id ? Number(formData.phien_ban_id) : null,
        gio_chieu: formData.gio_chieu,
        gio_ket_thuc: formData.gio_ket_thuc,
      };

      const res = await createLichChieu(payload);

      Swal.fire({
        icon: "success",
        title: "🎉 Thành công!",
        text: res.message || "Thêm lịch chiếu thành công",
      });

      navigate("/admin/lich-chieu");
    } catch (err: any) {
      console.error("❌ Lỗi tạo lịch chiếu:", err);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: err.response?.data?.message || "Không thể tạo lịch chiếu",
      });
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
              <label className="form-label fw-bold">Phim</label>
              <select
                name="phim_id"
                className="form-select"
                value={formData.phim_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn phim --</option>
                {phimList.length > 0 ? (
                  phimList.map((phim) => (
                    <option key={phim.id} value={phim.id}>
                      {phim.ten_phim}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải...</option>
                )}
              </select>
            </div>

            {/* Phòng chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phòng chiếu</label>
              <select
                name="phong_id"
                className="form-select"
                value={formData.phong_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn phòng chiếu --</option>
                {phongList.length > 0 ? (
                  phongList.map((phong) => (
                    <option key={phong.id} value={phong.id}>
                      {phong.ten_phong}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải...</option>
                )}
              </select>
            </div>

            {/* Phiên bản */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phiên bản</label>
              <select
                name="phien_ban_id"
                className="form-select"
                value={formData.phien_ban_id}
                onChange={handleChange}
              >
                <option value="">-- Chọn phiên bản (nếu có) --</option>
                {phienBanList.length > 0 ? (
                  phienBanList.map((phienBan) => (
                    <option key={phienBan.id} value={phienBan.id}>
                      {phienBan.the_loai}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải...</option>
                )}
              </select>
            </div>

            {/* Giờ chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giờ chiếu</label>
              <input
                type="datetime-local"
                name="gio_chieu"
                className="form-control"
                value={formData.gio_chieu}
                onChange={handleChange}
                required
              />
            </div>

            {/* Giờ kết thúc */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giờ kết thúc</label>
              <input
                type="datetime-local"
                name="gio_ket_thuc"
                className="form-control"
                value={formData.gio_ket_thuc}
                onChange={handleChange}
                required
              />
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