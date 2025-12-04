import { QRCode } from "antd";

interface VeDoAnProps {
  maDonHang: string;
  items: {
    ten_do_an: string;
    gia_ban: number;
    quantity: number;
  }[];
}

const VeDoAn: React.FC<VeDoAnProps> = ({ maDonHang, items }) => {
  const tongTien = items.reduce((sum, item) => sum + item.gia_ban * item.quantity, 0);

  return (
    <div
      style={{
        width: 360,
        marginBottom: 20,
        fontFamily: "Arial, sans-serif",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
        overflow: "hidden",
        border: "1px solid #ddd",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #d81b60, #8e24aa)",
          color: "#fff",
          padding: "12px 16px",
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        🎬 COMBO ĐỒ ĂN
      </div>

      {/* Nội dung */}
      <div style={{ padding: "16px 18px", position: "relative" }}>
        {/* Răng cưa */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 0,
            right: 0,
            height: 20,
            background:
              "repeating-linear-gradient(90deg, #fff 0 12px, transparent 12px 24px)",
          }}
        />

        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 16, marginBottom: 2 }}>
              <b>{item.ten_do_an}</b>
            </p>
            <p style={{ fontSize: 14, marginBottom: 2 }}>
              Giá: {item.gia_ban.toLocaleString("vi-VN")} đ × {item.quantity}
            </p>
          </div>
        ))}

        <p
          style={{
            fontSize: 18,
            marginTop: 10,
            fontWeight: "bold",
            color: "#d81b60",
          }}
        >
          Tổng: {tongTien.toLocaleString("vi-VN")} đ
        </p>

        {/* QR */}
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <QRCode value={maDonHang} size={120} />
          <p style={{ fontSize: 12, marginTop: 6, color: "#666" }}>
            Mã xác nhận: {maDonHang}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VeDoAn;
