import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./Dashboard.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "http://localhost:8000/api/";

interface RevenueItem {
  label: string;
  revenue: string | number;
}

const fetchDashboard = async () => {
  const [doanhThu, veBan, khachHang, doAn, topPhim] = await Promise.all([
    axios.get(`${API_URL}dashbroad/doanh-thu?type=month`),
    axios.get(`${API_URL}dashbroad/ve-ban`),
    axios.get(`${API_URL}dashbroad/khach-hang-moi`),
    axios.get(`${API_URL}dashbroad/do-an-ban-ra`),
    axios.get(`${API_URL}dashbroad/top-phim`),
  ]);

  return {
    doanhThu: (doanhThu.data.data || []) as RevenueItem[],
    tongVeBan: veBan.data.tong_ve_ban ?? 0,
    khachHangMoi: khachHang.data.khach_hang_moi ?? 0,
    doAnBanRa: doAn.data.tong_do_an_ban_ra ?? 0,
    topPhim: topPhim.data.data || [],
  };
};

const Dashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading)
    return <div className="text-center mt-4">Đang tải dữ liệu...</div>;

  const tongDoanhThu =
    data?.doanhThu?.reduce((sum: number, x: any) => sum + (Number(x.revenue) || 0), 0) ?? 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const stats = [
    {
      label: "DOANH THU",
      value: formatCurrency(tongDoanhThu),
      color: "green",
      icon: "💰",
    },
    {
      label: "ĐƠN VÉ",
      value: (data?.tongVeBan ?? 0).toLocaleString('vi-VN'),
      color: "blue",
      icon: "🎟️",
    },
    {
      label: "KHÁCH HÀNG MỚI",
      value: (data?.khachHangMoi ?? 0).toLocaleString('vi-VN'),
      color: "purple",
      icon: "👥",
    },
    {
      label: "ĐỒ ĂN BÁN RA",
      value: (data?.doAnBanRa ?? 0).toLocaleString('vi-VN'),
      color: "orange",
      icon: "🍿",
    },
  ];

  return (
    <div className="thongke-container">
      <h1 className="title">Tổng Quan</h1>

      <div className="thongke-grid">
        {stats.map((item, i) => (
          <div key={i} className={`card card-${item.color}`}>
            <div className="card-content">
              <div className="card-info">
                <p className="card-label">{item.label}</p>
                <h2 className="card-value">{item.value}</h2>
              </div>
              <div className="card-icon">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="compare-text">So với tháng trước</div>
      <div className="chart-card">
        <h2 className="chart-title">📊 Doanh thu theo thời gian</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.doanhThu || []}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top phim */}
      <div className="topphim-section">
        <h2 className="section-title">🎬 Top 5 Phim Có Doanh Thu Cao Nhất</h2>
        <div className="topphim-grid">
          {data?.topPhim?.slice(0, 5).map((phim: any, i: number) => (
            <div key={i} className="phim-card">
              <div className="phim-header">
                #{i + 1} {phim.ten_phim}
              </div>
              <img
                src={phim.anh_poster || "https://via.placeholder.com/150x200"}
                alt={phim.ten_phim}
                className="phim-img"
              />
              <div className="phim-body">
                <p>
                  Doanh thu:{" "}
                  <span className="highlight green">
                    {Number(phim.tong_doanh_thu ?? 0).toLocaleString('vi-VN')} đ
                  </span>
                </p>
                <p>
                  Số vé:{" "}
                  <span className="highlight">
                    {(phim.tong_ve ?? 0).toLocaleString('vi-VN')}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="footer">
        ©2025 TicketsPop. Hand crafted & made by TicketsPop.
      </p>
    </div>
  );
};

export default Dashboard;