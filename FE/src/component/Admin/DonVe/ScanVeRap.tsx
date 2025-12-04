// src/pages/admin/DonVe/ScanVeRap.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useZxing } from "react-zxing";
import { Alert, Button, message } from "antd";

const ScanVeRap = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [maGiaoDich, setMaGiaoDich] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tách mã giao dịch từ chuỗi QR (hỗ trợ cả QR BE & FE)
  const extractMaGiaoDich = (raw: string): string | null => {
    if (!raw) return null;

  raw = raw.trim();

  // 1) QR dạng FE: "12345678-A05"
  if (raw.includes("-")) {
    const parts = raw.split("-");
    if (parts[0] && /^[0-9]+$/.test(parts[0])) {
      return parts[0].trim();
    }
  }

  // 2) QR dạng MoMo Backend
  const match = raw.match(/mã giao dịch:\s*([0-9]+)/i);
  if (match && match[1]) return match[1].trim();

  // 3) QR chỉ là số thuần (mã giao dịch)
  if (/^[0-9]+$/.test(raw)) return raw;

  return null;

  };

  const { ref } = useZxing({
    onDecodeResult(result) {
    const text = result.getText();

    // Nếu đang xử lý rồi thì bỏ qua (tránh spam)
    if (isProcessing) return;

    setIsProcessing(true);

    // Lưu lại raw text để debug
    setScanResult(text);

    // Tách mã giao dịch
    const maGD = extractMaGiaoDich(text);

    // ❌ Không tách được -> QR không hợp lệ
    if (!maGD) {
      message.error("QR không hợp lệ! Vui lòng thử lại.");
      setIsProcessing(false);
      return;
    }

    // ✔️ OK
    setMaGiaoDich(maGD);
    message.success(`Đã nhận mã giao dịch: ${maGD}`);

    setTimeout(() => {
      navigate(`/admin/ve/${maGD}`);
    }, 400);
  },
  });

  const handleReset = () => {
    setScanResult(null);
    setMaGiaoDich(null);
    setIsProcessing(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>📷 Quét mã QR vé xem phim</h2>

      <div style={{ maxWidth: 480, margin: "16px auto" }}>
        <video
          ref={ref}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "2px solid #1890ff",
          }}
        />
      </div>

      {maGiaoDich && (
        <Alert
          type="success"
          showIcon
          message="Đã đọc mã giao dịch"
          description={
            <>
              <div>
                Mã giao dịch: <b>{maGiaoDich}</b>
              </div>
              <div>Nếu không tự chuyển trang, bấm nút bên dưới.</div>
            </>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {scanResult && (
        <pre
          style={{
            background: "#f8f8f8",
            padding: 12,
            borderRadius: 4,
            maxHeight: 150,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {scanResult}
        </pre>
      )}

      <div style={{ marginTop: 16 }}>
        <Button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>
          Quay lại
        </Button>
        <Button onClick={handleReset}>Quét lại</Button>
      </div>
    </div>
  );
};

export default ScanVeRap;
