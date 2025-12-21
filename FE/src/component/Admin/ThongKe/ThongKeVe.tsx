import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, Line, PieChart, Pie, Cell
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
  const [gio, top, loai, homNay, suatChieu] = await Promise.all([
    axios.get(`${API_URL}/thong-ke/gio-mua-nhieu-nhat`, { params }),
    axios.get(`${API_URL}/thong-ke/top-phim-ban-chay`, { params }),
    axios.get(`${API_URL}/thong-ke/phan-bo-loai-ve`, { params }),
    axios.get(`${API_URL}/thong-ke/ve-theo-gio-hom-nay`, { params }),
    axios.get(`${API_URL}/thong-ke/suat-chieu`, { params }), 
  ]);

  return {
    gioMuaNhieuNhat: gio.data.data,
    topPhimBanChay: top.data.data,
    phanBoLoaiVe: loai.data.data,
    veTheoGioHomNay: homNay.data.data,
    suatChieu: suatChieu.data.data,
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
      {/* FILTER BOX */}
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
            {/* GIỜ MUA NHIỀU NHẤT */}
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
            {/* PHÂN BỐ LOẠI VÉ */}
            <div className="thongke-chart">
              <h3>Phân bố loại vé</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Legend />
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
          {/* TOP PHIM BÁN CHẠY */}             
          <div className="thongke-chart">
            <h3>Top phim bán chạy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topPhimBanChay}>
                <XAxis dataKey="ten_phim" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="ve_da_ban"
                  name="Vé đã bán"
                  fill="#FB8C00"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="ve_trong"
                  name="Vé trống"
                  fill="#43A047"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* VÉ BÁN THEO GIỜ HÔM NAY */}            
          <div className="thongke-chart">
            <h3>Vé bán theo giờ hôm nay</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.veTheoGioHomNay || []}>
                <XAxis
                  dataKey="gio"
                  tickFormatter={(v) => `${v}:00`}
                />
                <YAxis
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} vé`, "Số vé bán"]}
                  labelFormatter={(label) => `Giờ: ${label}:00`}
                />
                <Line
                  type="monotone"
                  dataKey="so_luong"
                  stroke="#43A047"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* SUẤT CHIẾU THEO PHIM */}            
          <div className="thongke-chart">
            <h3>Suất chiếu theo phim</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.suatChieu.theo_phim}>
                <XAxis dataKey="ten_phim" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="so_suat_chieu" name="Số suất chiếu" fill="#5E35B1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* SUẤT CHIẾU THEO PHÒNG */}                 
          <div className="thongke-chart">
            <h3>Suất chiếu theo phòng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.suatChieu.theo_phong}>
                <XAxis dataKey="ten_phong" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="so_suat_chieu" name="Số suất chiếu" fill="#00897B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* SUẤT CHIẾU THEO GIỜ */}            
          <div className="thongke-chart">
            <h3>Suất chiếu theo giờ</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data?.suatChieu?.theo_gio || []}>
                <XAxis
                  dataKey="gio"
                  tickFormatter={(v) => `${v}:00`}
                />
                <YAxis
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} suất`, "Số suất chiếu"]}
                  labelFormatter={(label) => `Giờ: ${label}:00`}
                />
                <Line
                  type="monotone"
                  dataKey="so_suat_chieu"
                  stroke="#FB8C00"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
                   
        </>
      )}
    </div>
  );
};

export default ThongKeVe;
