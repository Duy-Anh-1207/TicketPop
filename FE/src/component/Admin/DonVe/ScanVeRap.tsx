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

    // 1) Trường hợp QR FE: "MA12345-A05"
    const firstLine = raw.split("\n")[0];
    if (firstLine.includes("-")) {
      return firstLine.split("-")[0].trim();
    }

    // 2) Trường hợp QR BE: có dòng "Mã giao dịch: XYZ"
    const match = raw.match(/Mã giao dịch:\s*([^\s]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }

    // 3) QR chỉ chứa mã giao dịch trần, ví dụ "MA123456"
    if (/^[-A-Za-z0-9]+$/.test(raw.trim())) {
      return raw.trim();
    }

    return null;
  };

  const { ref } = useZxing({
    onDecodeResult(result) {
      if (isProcessing) return;

      const text = result.getText();
      setScanResult(text);
      setIsProcessing(true);

      const maGD = extractMaGiaoDich(text);
      if (!maGD) {
        message.error("Không đọc được mã giao dịch từ QR");
        setIsProcessing(false);
        return;
      }

      setMaGiaoDich(maGD);
      message.success(`Đã đọc mã giao dịch: ${maGD}`);

      // Điều hướng tới màn chi tiết vé rạp của bạn
      setTimeout(() => {
        navigate(`/admin/ve/${maGD}`);
      }, 600);
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
