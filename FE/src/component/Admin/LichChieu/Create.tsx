import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createLichChieu } from "../../../provider/LichChieuProviders";
import { getListPhim } from "../../../provider/PhimProvider";
import { getListPhongChieu } from "../../../provider/PhongChieuProvider";

type Phim = { id: number; ten_phim: string; thoi_luong: number };
type PhongChieu = { id: number; ten_phong: string };
type PhienBan = { id: number; the_loai: string };

export default function CreateLichChieu() {
   const navigate = useNavigate();
  const [phimList, setPhimList] = useState<Phim[]>([]);
  const [phongList, setPhongList] = useState<PhongChieu[]>([]);
  const [phienBanList, setPhienBanList] = useState<PhienBan[]>([]);
  const [thoiLuongPhim, setThoiLuongPhim] = useState<number | null>(null);
  const [lichChieuList, setLichChieuList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhienBan, setLoadingPhienBan] = useState(false);
  

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { phim_id: "" },
  });

  // 🔹 Load phim & phòng
  useEffect(() => {
    (async () => {
      try {
        const [phimRes, phongRes] = await Promise.all([
          getListPhim({}),
          getListPhongChieu(),
        ]);
        const phimData = phimRes.data ?? phimRes;
        const phongData = (phongRes.data ?? phongRes).filter((p: any) => p.trang_thai === 1);
        setPhimList(phimData);
        setPhongList(phongData);
      } catch {
        Swal.fire("Lỗi", "Không thể tải danh sách phim hoặc phòng chiếu", "error");
      }
    })();
  }, []);

  // 🔹 Khi chọn phim → load phiên bản & thời lượng
  const phimId = watch("phim_id");
  useEffect(() => {
    if (!phimId) {
      setPhienBanList([]);
      setThoiLuongPhim(null);
      setLichChieuList([]);
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

  // ➕ Thêm form phụ
  const addForm = () => {
    if (!phimId) {
      Swal.fire("Chưa chọn phim", "Vui lòng chọn phim trước khi thêm!", "warning");
      return;
    }
    setLichChieuList([
      ...lichChieuList,
      { id: Date.now(), phien_ban_id: "", phong_id: "", gio_chieu: "", gio_ket_thuc: "", gia_ve_thuong: "", gia_ve_vip: "" },
    ]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...lichChieuList];
    updated[index][field] = value;

    // Tự tính giờ kết thúc nếu có giờ chiếu
    if (field === "gio_chieu" && thoiLuongPhim) {
      const start = new Date(value);
      const end = new Date(start.getTime() + (thoiLuongPhim + 15) * 60000);
      const pad = (n: number) => n.toString().padStart(2, "0");
      updated[index]["gio_ket_thuc"] = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;
    }

    // Tự tính giá vé VIP
    if (field === "gia_ve_thuong") {
      const vip = (Number(value) * 1.3).toFixed(0);
      updated[index]["gia_ve_vip"] = vip;
    }

    setLichChieuList(updated);
  };

  const removeForm = (index: number) => {
    const updated = [...lichChieuList];
    updated.splice(index, 1);
    setLichChieuList(updated);
  };
  

  // 🟢 Gửi dữ liệu
  const onSubmit = async (data: any) => {
    if (!phimId || lichChieuList.length === 0) {
      Swal.fire("Thiếu dữ liệu", "Hãy chọn phim và thêm ít nhất 1 lịch chiếu.", "warning");
      return;
      
    }

    const allSchedules = lichChieuList.map((item) => ({
      phim_id: Number(phimId),
      phien_ban_id: item.phien_ban_id ? Number(item.phien_ban_id) : null,
      phong_id: Number(item.phong_id),
      gio_chieu: item.gio_chieu,
      gia_ve_thuong: Number(item.gia_ve_thuong),
      gia_ve_vip: Number(item.gia_ve_vip),
    }));

    // 🔍 Check trùng phòng & giờ
    for (let i = 0; i < allSchedules.length; i++) {
      for (let j = i + 1; j < allSchedules.length; j++) {
        if (
          allSchedules[i].phong_id === allSchedules[j].phong_id &&
          allSchedules[i].gio_chieu === allSchedules[j].gio_chieu
        ) {
          Swal.fire("❌ Trùng lịch", `Lịch ${i + 1} và ${j + 1} bị trùng phòng & giờ!`, "error");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = { lich_chieu: allSchedules };
      const res = await createLichChieu(payload);

      Swal.fire("🎉 Thành công", res.message || "Tạo nhiều lịch chiếu thành công!", "success").then(
        () => {
          navigate("/admin/lich-chieu"); // ✅ Chuyển về danh sách
        }
      );
    } catch (err: any) {
      Swal.fire("Lỗi", err.response?.data?.error || "Không thể tạo lịch chiếu", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // 🔹 Giao diện
  // ------------------------
  return (
    <div className="container mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          🎬 Thêm Lịch Chiếu (Nhiều lịch)
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Phim */}
            <div className="mb-3">
              <label className="form-label fw-bold">🎥 Chọn phim</label>
              <select {...register("phim_id", { required: true })} className="form-select">
                <option value="">-- Chọn phim --</option>
                {phimList.map((p) => (
                  <option key={p.id} value={p.id}>{p.ten_phim}</option>
                ))}
              </select>
              {errors.phim_id && <small className="text-danger">Bắt buộc chọn phim</small>}
              {thoiLuongPhim && (
                <small className="text-muted d-block mt-1">⏱ Thời lượng: {thoiLuongPhim} phút</small>
              )}
            </div>

            {/* Danh sách form phụ */}
            {lichChieuList.map((item, index) => (
              <div key={item.id} className="border rounded p-3 mb-3 bg-light">
                <h6 className="fw-semibold text-primary">🎬 Lịch chiếu #{index + 1}</h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label>Phiên bản</label>
                    <select
                      value={item.phien_ban_id || ""}
                      onChange={(e) => handleChange(index, "phien_ban_id", e.target.value)}
                      className="form-select"
                      disabled={loadingPhienBan || phienBanList.length === 0}
                    >
                      <option value="">
                        {loadingPhienBan ? "Đang tải..." : "-- Chọn phiên bản (nếu có) --"}
                      </option>
                      {phienBanList.map((pb) => (
                        <option key={pb.id} value={pb.id}>{pb.the_loai}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label>🏢 Phòng chiếu</label>
                    <select
                      value={item.phong_id || ""}
                      onChange={(e) => handleChange(index, "phong_id", e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Chọn phòng --</option>
                      {phongList.map((p) => (
                        <option key={p.id} value={p.id}>{p.ten_phong}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label>🕐 Giờ chiếu</label>
                    <input
                      type="datetime-local"
                      value={item.gio_chieu || ""}
                      onChange={(e) => handleChange(index, "gio_chieu", e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-3">
                    <label>⏰ Giờ kết thúc (tự động)</label>
                    <input type="datetime-local" className="form-control" value={item.gio_ket_thuc || ""} disabled />
                  </div>

                  <div className="col-md-3">
                    <label>💸 Giá vé thường</label>
                    <input
                      type="number"
                      value={item.gia_ve_thuong || ""}
                      onChange={(e) => handleChange(index, "gia_ve_thuong", e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-3">
                    <label>💰 Giá vé VIP</label>
                    <input type="number" className="form-control" value={item.gia_ve_vip || ""} disabled />
                    <small className="text-muted">= Vé thường × 1.3</small>
                  </div>

                  <div className="col-md-1 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeForm(index)}
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Nút thêm và lưu */}
            <div className="text-end">
              <button type="button" className="btn btn-outline-success me-2" onClick={addForm}>
                ➕ Thêm lịch chiếu
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "⏳ Đang lưu..." : "💾 Lưu tất cả"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
