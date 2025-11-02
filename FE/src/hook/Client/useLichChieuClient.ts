import { useState } from "react";
import {
  getAllLichChieu,
  getLichChieuTheoPhim,
  getChiTietLichChieu,
  getPhienBanTheoPhim,
  getNextAvailableTime,
} from "../../provider/Client/lichChieuClientProvider.ts";

export const useLichChieuClient = () => {
  const [lichChieu, setLichChieu] = useState<any[]>([]);
  const [chiTiet, setChiTiet] = useState<any | null>(null);
  const [phienBan, setPhienBan] = useState<any[]>([]);
  const [gioKeTiep, setGioKeTiep] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Lấy toàn bộ lịch chiếu
  const fetchAllLichChieu = async () => {
    setLoading(true);
    try {
      const res = await getAllLichChieu();
      setLichChieu(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải lịch chiếu");
    } finally {
      setLoading(false);
    }
  };

  // Lấy lịch chiếu theo phim
  const fetchLichChieuTheoPhim = async (phimId: number | string) => {
    setLoading(true);
    try {
      const res = await getLichChieuTheoPhim(phimId);
      setLichChieu(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải lịch chiếu phim");
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết 1 lịch chiếu
  const fetchChiTietLichChieu = async (id: number | string) => {
    setLoading(true);
    try {
      const res = await getChiTietLichChieu(id);
      setChiTiet(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải chi tiết lịch chiếu");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách phiên bản chiếu theo phim
  const fetchPhienBanTheoPhim = async (phimId: number | string) => {
    setLoading(true);
    try {
      const res = await getPhienBanTheoPhim(phimId);
      setPhienBan(res.phien_ban || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải phiên bản phim");
    } finally {
      setLoading(false);
    }
  };

  // Lấy giờ chiếu kế tiếp của phòng
  const fetchNextAvailableTime = async (params: { phong_id: number; thoi_luong?: number }) => {
    setLoading(true);
    try {
      const res = await getNextAvailableTime(params);
      setGioKeTiep(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy giờ chiếu kế tiếp");
    } finally {
      setLoading(false);
    }
  };

  return {
    // dữ liệu
    lichChieu,
    chiTiet,
    phienBan,
    gioKeTiep,

    // trạng thái
    loading,
    error,

    // hàm hành động
    fetchAllLichChieu,
    fetchLichChieuTheoPhim,
    fetchChiTietLichChieu,
    fetchPhienBanTheoPhim,
    fetchNextAvailableTime,
  };
};
