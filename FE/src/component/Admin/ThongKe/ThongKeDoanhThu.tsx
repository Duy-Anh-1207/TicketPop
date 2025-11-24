import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./ThongKe.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const API_URL = "http://localhost:8000/api";

// FETCH MOVIES 
const fetchMovies = async () => {
  const res = await axios.get(`${API_URL}/phim`);

  // auto nhận mọi loại format API
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;

  return [];
};

// FETCH THỐNG KÊ 
const fetchData = async ({ queryKey }: any) => {
  const [, filters] = queryKey;

  const params: any = {};

  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  if (filters.movie) params.phim_id = filters.movie;

  const [tyLePT, doanhThuPhim, doanhThuDoAn, theoThang] = await Promise.all([
    axios.get(`${API_URL}/thong-ke/ty-le-phuong-thuc-thanh-toan`, { params }),
    axios.get(`${API_URL}/thong-ke/doanh-thu-phim`, { params }),
    axios.get(`${API_URL}/thong-ke/doanh-thu-do-an`, { params }),
    axios.get(`${API_URL}/thong-ke/doanh-thu-theo-thang`, { params }),
  ]);

  return {
    tyLePhuongThuc: tyLePT.data.data || [],
    doanhThuPhim: doanhThuPhim.data.data || [],
    doanhThuDoAn: doanhThuDoAn.data.doanh_thu_do_an || 0,
    doanhThuTheoThang: theoThang.data.data || [],
  };
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"];

const ThongKeDoanhThu: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [movie, setMovie] = useState("");

  // fetch movies
  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchMovies,
  });

  // fetch thống kê
  const { data, isLoading } = useQuery({
    queryKey: ["ThongKeDoanhThu", { startDate, endDate, movie }],
    queryFn: fetchData,
  });

  const handleFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      alert("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
      return;
    }
  };

  if (isLoading)
    return <div className="text-center mt-4">Đang tải dữ liệu...</div>;

  return (
    <div className="thongke-container">
      <h2>Thống kê doanh thu</h2>


      <div className="filter-box">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <select value={movie} onChange={(e) => setMovie(e.target.value)}>
          <option value="">Tất cả phim</option>
          {movies?.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.ten_phim}
            </option>
          ))}
        </select>

        <button onClick={handleFilter}>Lọc</button>
      </div>

      <div className="thongke-grid">
        <div className="thongke-card">
          <p>Doanh thu đồ ăn</p>
          <h2>{data?.doanhThuDoAn.toLocaleString()} đ</h2>
        </div>
      </div>

      <div className="thongke-chart-row">
        <div className="thongke-chart">
          <h3>Doanh thu theo phim</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.doanhThuPhim || []}>
              <XAxis dataKey="ten_phim" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="doanh_thu" fill="#1E88E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="thongke-chart">
          <h3>Tỷ lệ phương thức thanh toán</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.tyLePhuongThuc || []}
                dataKey="so_luong"
                nameKey="ten"
                label
              >
                {data?.tyLePhuongThuc?.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="thongke-chart">
        <h3>Doanh thu theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.doanhThuTheoThang || []}>
            <XAxis dataKey="thang" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tong_doanh_thu" stroke="#FB8C00" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThongKeDoanhThu;
