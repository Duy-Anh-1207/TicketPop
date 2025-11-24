import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import "./ThongKe.css";

const API_URL = "http://localhost:8000/api";

// FETCH PHIM
const fetchMovies = async () => {
  const res = await axios.get(`${API_URL}/phim`);

  if (Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// FETCH THỐNG KÊ
const fetchThongKe = async (params: any) => {
  const [gio, top, loai, homNay] = await Promise.all([
    axios.get(`${API_URL}/thong-ke/gio-mua-nhieu-nhat`, { params }),
    axios.get(`${API_URL}/thong-ke/top-phim-ban-chay`, { params }),
    axios.get(`${API_URL}/thong-ke/phan-bo-loai-ve`, { params }),
    axios.get(`${API_URL}/thong-ke/ve-theo-gio-hom-nay`, { params }),
  ]);

  return {
    gioMuaNhieuNhat: gio.data.data,
    topPhimBanChay: top.data.data,
    phanBoLoaiVe: loai.data.data,
    veTheoGioHomNay: homNay.data.data,
  };
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"];

const ThongKeVe: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [params, setParams] = useState<any>({});
  const [error, setError] = useState("");

  // Fetch phim
  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchMovies,
  });

  // Fetch thống kê
  const { data, isLoading } = useQuery({
    queryKey: ["thongKeVe", params],
    queryFn: () => fetchThongKe(params),
  });

  // HANDLE FILTER
  const handleFilter = () => {
    setError("");

    // Nếu chọn cả 2 thì phải check
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("⚠ Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
      return;
    }

    const newParams: any = {};

    // Chỉ gửi ngày nếu người dùng chọn
    if (fromDate) newParams.from_date = fromDate;
    if (toDate) newParams.to_date = toDate;

    // Chọn phim
    if (selectedMovie) newParams.phim_id = selectedMovie;

    setParams(newParams);
  };

  return (
    <div className="thongke-container">
      <h2>Thống kê vé</h2>

      <div className="filter-box">
        <div className="filter-item">
          <label>Từ ngày:</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="filter-item">
          <label>Đến ngày:</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <div className="filter-item">
          <label>Chọn phim:</label>
          <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)}>
            <option value="">Tất cả phim</option>
            {movies?.map((m: any) => (
              <option key={m.id} value={m.id}>{m.ten_phim}</option>
            ))}
          </select>
        </div>

        <button className="btn-filter" onClick={handleFilter}>Lọc</button>
      </div>

      {error && <p className="filter-error">{error}</p>}

      {isLoading && <div className="text-center">Đang tải dữ liệu...</div>}

      {data && (
        <>
          <div className="thongke-chart-row">
            <div className="thongke-chart">
              <h3>Giờ mua nhiều nhất</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.gioMuaNhieuNhat}>
                  <XAxis dataKey="gio" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="so_luong" fill="#1E88E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="thongke-chart">
              <h3>Phân bố loại vé</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.phanBoLoaiVe}
                    dataKey="so_luong"
                    nameKey="ten_loai"
                    label
                  >
                    {data.phanBoLoaiVe.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="thongke-chart">
            <h3>Top phim bán chạy</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.topPhimBanChay}>
                <XAxis dataKey="ten_phim" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tong_ve" fill="#FB8C00" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="thongke-chart">
            <h3>Vé bán theo giờ hôm nay</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.veTheoGioHomNay}>
                <XAxis dataKey="gio" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="so_luong" fill="#43A047" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ThongKeVe;
