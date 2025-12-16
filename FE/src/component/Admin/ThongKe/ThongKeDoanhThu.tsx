import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
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

//FETCH THỐNG KÊ
const fetchThongKe = async (params: any) => {
  const [doanhThuPhim, doanhThuDoAn, theoThang, gheTheoNgay] = await Promise.all([
    axios.get(`${API_URL}/thong-ke/doanh-thu-phim`, { params }),
    axios.get(`${API_URL}/thong-ke/doanh-thu-do-an`, { params }),
    axios.get(`${API_URL}/thong-ke/doanh-thu-theo-thang`, { params }),
    axios.get(`${API_URL}/thong-ke/ghe-theo-ngay`, { params }),
  ]);

  return {
    // tyLePhuongThuc: tyLePT.data.data || [],
    doanhThuPhim: doanhThuPhim.data.data || [],
    doanhThuDoAn: doanhThuDoAn.data.doanh_thu_do_an || 0,
    doanhThuTheoThang: theoThang.data.data || [],
    gheTheoNgay: gheTheoNgay.data.data || [],
    tongGhe: gheTheoNgay.data.tong_ghe || 0,
  };
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"];

const ThongKeDoanhThu: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [params, setParams] = useState<any>({});
  const [error, setError] = useState("");

  const formatVND = (value: number | string) => {
    const num = Number(value); // ép về số
    return num.toLocaleString("vi-VN") + " đ";
  };


  // Fetch phim
  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchMovies,
  });

  // Fetch thống kê
  const { data, isLoading } = useQuery({
    queryKey: ["thongKeDoanhThu", params],
    queryFn: () => fetchThongKe(params),
  });

  // HANDLE FILTER
  const handleFilter = () => {
    setError("");

    // Validate ngày
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("⚠ Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!");
      return;
    }

    const newParams: any = {};

    // Gửi ngày nếu có
    if (fromDate) newParams.from_date = fromDate;
    if (toDate) newParams.to_date = toDate;

    // Gửi phim nếu có
    if (selectedMovie) newParams.phim_id = selectedMovie;

    setParams(newParams);
  };

  return (
    <div className="thongke-container">
      <h2>Thống kê doanh thu</h2>

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
          {/* DOANH THU ĐỒ ĂN */}
          <div className="thongke-grid">
            <div className="thongke-card">
              <p>Doanh thu đồ ăn</p>
              <h2>{data?.doanhThuDoAn.toLocaleString()} đ</h2>
            </div>
          </div>

          {/* BIỂU ĐỒ */}
          <div className="thongke-chart">
            <h3>Doanh thu theo phim</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.doanhThuPhim || []}>
                <XAxis dataKey="ten_phim" />
                <YAxis width={90}
                  tickFormatter={formatVND}
                />
                <Tooltip
                  formatter={(value: any) => formatVND(value)}
                />
                <Bar
                  dataKey="doanh_thu"
                  fill="#1E88E5"
                  name="Doanh thu"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* DOANH THU THEO THÁNG */}
          <div className="thongke-chart">
            <h3>Doanh thu theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.doanhThuTheoThang || []}>
                <XAxis dataKey="thang" />
                <YAxis width={90}
                  tickFormatter={formatVND}
                />
                <Tooltip
                  formatter={(value: any) => formatVND(value)}
                />
                <Line type="monotone" dataKey="tong_doanh_thu" stroke="#FB8C00" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* ================= THỐNG KÊ GHẾ (BIỂU ĐỒ TRÒN) ================= */}
          <div className="thongke-chart ghe-pie">
            <h3>🪑 Thống kê ghế</h3>

            {(() => {
              const list = data?.gheTheoNgay || [];
              if (list.length === 0) return <p>Không có dữ liệu</p>;

              // Ghế đã bán
              const gheDaBan = list.reduce(
                (sum: number, item: any) => sum + item.ghe_da_ban,
                0
              );

              // Tổng ghế (BE)
              const tongGhe = data?.tongGhe || 0;

              // Ghế trống
              const gheTrong = Math.max(0, tongGhe - gheDaBan);

              const pieData = [
                { name: "Ghế đã bán", value: gheDaBan },
                { name: "Ghế trống", value: gheTrong },
              ];

              return (
                <>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      >
                        <Cell fill="#E53935" /> {/* Ghế đã bán */}
                        <Cell fill="#43A047" /> {/* Ghế trống */}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <p className="tong-ghe">
                    🟦 Tổng số ghế: <b>{tongGhe}</b>
                  </p>
                </>
              );
            })()}
          </div>

        </>
      )}
    </div>
  );
};

export default ThongKeDoanhThu;
