// VeRap.tsx
import { QRCode } from "antd";

interface VeRapProps {
  maDonHang: string;
  khachHang: any;
  phim: any;
  phong: string;
  gioChieu: string;
  danhSachGhe: any[];
  tongTien: number;
}

const VeRap: React.FC<VeRapProps> = ({ maDonHang, khachHang, phim, phong, gioChieu, danhSachGhe, tongTien }) => (
  <div
    style={{
      width: 400,
      border: "1px solid #333",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      fontFamily: "Arial, sans-serif",
      background: "#fff",
    }}
  >
    <h3 style={{ textAlign: "center" }}>🎬 {phim.ten_phim}</h3>
    <p><b>Mã vé:</b> {maDonHang}</p>
    <p><b>Khách hàng:</b> {khachHang.ten}</p>
    <p><b>Phòng:</b> {phong}</p>
    <p><b>Suất chiếu:</b> {gioChieu}</p>
    <p><b>Ghế:</b> {danhSachGhe.map(g => g.so_ghe).join(", ")} ({danhSachGhe.map(g => g.loai_ghe).join(", ")})</p>
    <p><b>Tổng tiền:</b> {Number(tongTien).toLocaleString("vi-VN")} đ</p>
    <div style={{ textAlign: "center", marginTop: 8 }}>
      <QRCode value={maDonHang} size={100} />
    </div>
  </div>
);

export default VeRap;
