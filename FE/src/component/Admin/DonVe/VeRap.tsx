import { QRCode } from "antd";

interface VeRapProps {
  maDonHang: string;
  khachHang: any;
  phim: any;
  phong: string;
  gioChieu: string;
  ghe: any;
}

const VeRap: React.FC<VeRapProps> = ({
  maDonHang,
  khachHang,
  phim,
  phong,
  gioChieu,
  ghe,
}) => (
  <div
    style={{
      width: 360,
      marginBottom: 18,
      fontFamily: "Arial, sans-serif",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    }}
  >
    {/* HEADER */}
    <div
      style={{
        background: "#000",
        color: "#fff",
        padding: "10px 16px",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      🎬 VÉ XEM PHIM
    </div>

    {/* NỘI DUNG CHÍNH */}
    <div style={{ display: "flex" }}>
      {/* BÊN TRÁI */}
      <div style={{ flex: 1, padding: "14px 16px" }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>{phim.ten_phim}</div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>KH:</b> {khachHang.ten}
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>Phòng:</b> {phong}
        </div>

        <div style={{ marginBottom: 6 }}>
          <b>Suất chiếu:</b> {gioChieu}
        </div>

        {/* GHẾ - phong cách vé rạp */}
        <div
          style={{
            marginTop: 12,
            background: "#f5f5f5",
            padding: "10px 12px",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14 }}>Ghế</div>
          <div
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#d32f2f",
              marginTop: 4,
            }}
          >
            {ghe.so_ghe}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>{ghe.loai_ghe}</div>
        </div>

        {/* GIÁ */}
        <div style={{ marginTop: 12, fontWeight: "bold" }}>
          Giá vé: {Number(ghe.gia_ve).toLocaleString("vi-VN")} đ
        </div>
      </div>

      {/* ĐƯỜNG KẺ RĂNG CƯA */}
      <div
        style={{
          width: 2,
          borderLeft: "2px dashed #bbb",
          margin: "12px 0",
        }}
      />

      {/* BÊN PHẢI (QR CODE) */}
      <div
        style={{
          width: 120,
          padding: 12,
          textAlign: "center",
        }}
      >
        <QRCode value={`${maDonHang}-${ghe.so_ghe}`} size={96} />

        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "#444",
            fontWeight: "bold",
            wordBreak: "break-all",
          }}
        >
          {maDonHang}-{ghe.so_ghe}
        </div>
      </div>
    </div>
  </div>
);

export default VeRap;
