// src/pages/PaymentResult.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // MoMo: resultCode=0 là thành công. Nếu bạn đã gắn ?status=success ở BE thì check thêm status.
  const status = params.get("status");
  const resultCode = params.get("resultCode");
  const isSuccess = status === "success" || resultCode === "0";

  useEffect(() => {
    const t = setTimeout(() => navigate("/", { replace: true }), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  const amount = Number(params.get("amount") || 0).toLocaleString("vi-VN");
  const orderId = params.get("orderId") || "";

  return (
    <div style={{minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <Result
        status={isSuccess ? "success" : "error"}
        title={isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        subTitle={`Mã đơn: ${orderId} • Số tiền: ${amount} đ`}
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
}
