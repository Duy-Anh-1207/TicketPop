import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./ThongKe.css";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

const API_URL = "http://localhost:8000/api/thong-ke";

const fetchData = async () => {
  const [tyLePT, doanhThuPhim, doanhThuDoAn, theoThang] = await Promise.all([
    axios.get(`${API_URL}/ty-le-phuong-thuc-thanh-toan`),
    axios.get(`${API_URL}/doanh-thu-phim`),
    axios.get(`${API_URL}/doanh-thu-do-an`),
    axios.get(`${API_URL}/doanh-thu-theo-thang`),
  ]);

  return {
    tyLePhuongThuc: tyLePT.data.data || [],
    doanhThuPhim: doanhThuPhim.data.data || [],
    doanhThuDoAn: doanhThuDoAn.data.tong_doanh_thu_do_an || 0,
    doanhThuTheoThang: theoThang.data.data || [],
  };
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"];

const ThongKeDoanhThu: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["ThongKeDoanhThu"],
    queryFn: fetchData,
  });

  return (
    <div className="thongke-container">
      <h2>Thống kê doanh thu</h2>

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
                nameKey="ten_phuong_thuc"
                label
              >
                {data?.tyLePhuongThuc?.map((_, i) => (
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
