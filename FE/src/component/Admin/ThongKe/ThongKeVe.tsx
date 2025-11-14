import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import "./ThongKe.css";

const API_URL = "http://localhost:8000/api";

const fetchThongKeVe = async () => {
  const [gio, topPhim, loaiVe, homNay] = await Promise.all([
    axios.get(`${API_URL}/thong-ke/gio-mua-nhieu-nhat`),
    axios.get(`${API_URL}/thong-ke/top-phim-ban-chay`),
    axios.get(`${API_URL}/thong-ke/phan-bo-loai-ve`),
    axios.get(`${API_URL}/thong-ke/ve-theo-gio-hom-nay`),
  ]);

  return {
    gioMuaNhieuNhat: gio.data.data || [],
    topPhimBanChay: topPhim.data.data || [],
    phanBoLoaiVe: loaiVe.data.data || [],
    veTheoGioHomNay: homNay.data.data || [],
  };
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935"];

const ThongKeVe: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["thongKeVe"],
    queryFn: fetchThongKeVe,
  });
   if (isLoading)
    return <div className="text-center mt-4">Đang tải dữ liệu...</div>;

  return (
    <div className="thongke-container">
      <h2>Thống kê vé</h2>

      <div className="thongke-chart-row">
        <div className="thongke-chart">
          <h3>Giờ mua nhiều nhất</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.gioMuaNhieuNhat || []}>
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
                data={data?.phanBoLoaiVe || []}
                dataKey="so_luong"
                nameKey="ten_loai"
                label
              >
                {data?.phanBoLoaiVe?.map((_, i) => (
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
          <BarChart data={data?.topPhimBanChay || []}>
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
          <BarChart data={data?.veTheoGioHomNay || []}>
            <XAxis dataKey="gio" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="so_luong" fill="#43A047" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ThongKeVe;
