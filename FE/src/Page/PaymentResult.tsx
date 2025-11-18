// src/pages/PaymentResult.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button } from "antd";
import axios from "axios";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // MoMo: resultCode=0 là thành công. Nếu bạn đã gắn ?status=success ở BE thì check thêm status.
  const status = params.get("status");
  const resultCode = params.get("resultCode");
  const isSuccess = status === "success" || resultCode === "0";

  const rollbackGhe = async (lichChieuId: any, gheIds: any) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/thanhtoan/momo/rollback-ghe",
        {
          lich_chieu_id: lichChieuId,
          ghe_ids: gheIds,
        }
      );
      console.log("Rollback success:", response.data);
      return response.data;
    } catch (error:any) {
      console.error("Rollback failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // Sau đó mới dùng
  if (!isSuccess) {
    const extraData = params.get('extraData');

    let customData = null;
    if (extraData) {
      const decoded = JSON.parse(atob(extraData));
      customData = decoded.customData;
      rollbackGhe(decoded.IdLichChieu, decoded.IdGhe);
    }
  }


  // useEffect(() => {
  //   const t = setTimeout(() => navigate("/", { replace: true }), 2500);
  //   return () => clearTimeout(t);
  // }, [navigate]);




  const amount = Number(params.get("amount") || 0).toLocaleString("vi-VN");
  const orderId = params.get("orderId") || "";

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
