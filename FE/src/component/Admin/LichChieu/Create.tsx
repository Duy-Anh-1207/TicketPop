import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createLichChieu } from "../../../provider/LichChieuProviders";
import { getListPhim } from "../../../provider/PhimProvider";
import { getListPhongChieu } from "../../../provider/PhongChieuProvider";

type Phim = { id: number; ten_phim: string; thoi_luong: number };
type Phong = { id: number; ten_phong: string };
type PhienBan = { id: number; the_loai: string };

export default function CreateLichChieu() {
  const navigate = useNavigate();
  const [phimList, setPhimList] = useState<Phim[]>([]);
  const [phongList, setPhongList] = useState<Phong[]>([]);
  const [phienBanList, setPhienBanList] = useState<PhienBan[]>([]);
  const [thoiLuongPhim, setThoiLuongPhim] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhienBan, setLoadingPhienBan] = useState(false);

  // 🔹 Khởi tạo form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phim_id: "",
      phong_id: "",
      phien_ban_id: "",
      gio_chieu: "",
      gio_ket_thuc: "",
      gia_ve_thuong: "",
      gia_ve_vip: "",
    },
  });

  // 🔹 Lấy danh sách phim và phòng chiếu khi load
  useEffect(() => {
    (async () => {
      try {
        const [phimRes, phongRes] = await Promise.all([
          getListPhim({}),
          getListPhongChieu(),
        ]);
        const phimData = Array.isArray(phimRes.data) ? phimRes.data : phimRes;
        const phongData = Array.isArray(phongRes.data) ? phongRes.data : phongRes;
        setPhimList(phimData);
        setPhongList(phongData);
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải danh sách phim hoặc phòng chiếu", "error");
      }
    })();
  }, []);

  // 🔹 Khi chọn phim → lấy phiên bản & thời lượng
  const phimId = watch("phim_id");
  useEffect(() => {
    if (!phimId) {
      setPhienBanList([]);
      setThoiLuongPhim(null);
      return;
    }

    const phim = phimList.find((p) => p.id === Number(phimId));
    setThoiLuongPhim(phim?.thoi_luong || null);

    (async () => {
      setLoadingPhienBan(true);
      try {
        const res = await fetch(`http://localhost:8000/api/phim/${phimId}/phien-ban`);
        const data = await res.json();
        setPhienBanList(data.phien_ban || []);
      } catch {
        Swal.fire("Lỗi", "Không thể tải danh sách phiên bản", "error");
      } finally {
        setLoadingPhienBan(false);
      }
    })();
  }, [phimId]);

  // 🔹 Tự động tính giờ kết thúc
  const gioChieu = watch("gio_chieu");
  useEffect(() => {
    if (gioChieu && thoiLuongPhim) {
      const start = new Date(gioChieu);
      const end = new Date(start.getTime() + thoiLuongPhim * 60000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const formatted = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
        end.getDate()
      )}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
      setValue("gio_ket_thuc", formatted);
    }
  }, [gioChieu, thoiLuongPhim]);

  // 🔹 Tự động tính giá vé VIP
  const giaVeThuong = watch("gia_ve_thuong");
  useEffect(() => {
    if (giaVeThuong) {
      const vip = (Number(giaVeThuong) * 1.3).toFixed(0);
      setValue("gia_ve_vip", vip);
    } else {
      setValue("gia_ve_vip", "");
    }
  }, [giaVeThuong]);

  // 🔹 Gửi form
  const onSubmit = async (data: any) => {
    if (!data.phim_id || !data.phong_id || !data.gio_chieu || !data.gia_ve_thuong) {
      Swal.fire("Thiếu thông tin", "Vui lòng điền đủ thông tin bắt buộc.", "warning");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...data,
        phim_id: Number(data.phim_id),
        phong_id: Number(data.phong_id),
        phien_ban_id: data.phien_ban_id ? Number(data.phien_ban_id) : null,
        gia_ve_thuong: Number(data.gia_ve_thuong),
        gia_ve_vip: Number(data.gia_ve_vip),
      };

      const res = await createLichChieu(payload);
      Swal.fire("🎉 Thành công!", res.message || "Tạo lịch chiếu thành công!", "success");
      reset();
      navigate("/admin/lich-chieu");
    } catch (err: any) {
      Swal.fire("Lỗi", err.response?.data?.message || "Không thể tạo lịch chiếu", "error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔹 Giao diện form
  // ==============================
  return (
    <div className="container mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          🎬 Thêm Lịch Chiếu Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Phim */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phim</label>
              <select
                {...register("phim_id", { required: true })}
                className="form-select"
              >
                <option value="">-- Chọn phim --</option>
                {phimList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ten_phim}
                  </option>
                ))}
              </select>
              {errors.phim_id && <small className="text-danger">Bắt buộc chọn phim</small>}
              {thoiLuongPhim && (
                <small className="text-muted d-block mt-1">
                  ⏱ Thời lượng: {thoiLuongPhim} phút
                </small>
              )}
            </div>

            {/* Phòng chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phòng chiếu</label>
              <select
                {...register("phong_id", { required: true })}
                className="form-select"
              >
                <option value="">-- Chọn phòng chiếu --</option>
                {phongList.map((phong) => (
                  <option key={phong.id} value={phong.id}>
                    {phong.ten_phong}
                  </option>
                ))}
              </select>
              {errors.phong_id && <small className="text-danger">Bắt buộc chọn phòng</small>}
            </div>

            {/* Phiên bản */}
            <div className="mb-3">
              <label className="form-label fw-bold">Phiên bản</label>
              <select
                {...register("phien_ban_id")}
                className="form-select"
                disabled={loadingPhienBan || phienBanList.length === 0}
              >
                <option value="">
                  {loadingPhienBan ? "Đang tải..." : "-- Chọn phiên bản (nếu có) --"}
                </option>
                {phienBanList.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.the_loai}
                  </option>
                ))}
              </select>
            </div>

            {/* Giờ chiếu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giờ chiếu</label>
              <input
                type="datetime-local"
                {...register("gio_chieu", { required: true })}
                className="form-control"
              />
              {errors.gio_chieu && <small className="text-danger">Bắt buộc nhập giờ chiếu</small>}
            </div>

            {/* Giờ kết thúc */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giờ kết thúc</label>
              <input
                type="datetime-local"
                {...register("gio_ket_thuc")}
                className="form-control"
                disabled
              />
            </div>

            {/* Giá vé thường */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giá vé thường (VNĐ)</label>
              <input
                type="number"
                {...register("gia_ve_thuong", { required: true })}
                className="form-control"
              />
              {errors.gia_ve_thuong && (
                <small className="text-danger">Bắt buộc nhập giá vé</small>
              )}
            </div>

            {/* Giá vé VIP */}
            <div className="mb-3">
              <label className="form-label fw-bold">Giá vé VIP (VNĐ)</label>
              <input
                type="number"
                {...register("gia_ve_vip")}
                className="form-control"
                disabled
              />
              <small className="text-muted">Tự động = giá vé thường × 1.3</small>
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
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...
                  </>
                ) : (
                  "💾 Lưu lịch chiếu"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
