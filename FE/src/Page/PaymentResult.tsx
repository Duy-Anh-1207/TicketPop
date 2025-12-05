import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Card } from "antd";
import axios from "axios";

export default function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

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
      return response.data;
    } catch (error: any) {
      console.error("Rollback failed:", error.response?.data || error.message);
    }
  };

  if (!isSuccess) {
    const extraData = params.get("extraData");
    if (extraData) {
      const decoded = JSON.parse(atob(extraData));
      rollbackGhe(decoded.IdLichChieu, decoded.IdGhe);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Lớp mờ để đọc chữ rõ hơn */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      />

      <Card
        style={{
          maxWidth: 520,
          width: "90%",
          borderRadius: 16,
          paddingTop: 20,
          paddingBottom: 20,
          textAlign: "center",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.9)",
          zIndex: 10,
        }}
      >
        <Result
          status={isSuccess ? "success" : "error"}
          title={
            <span style={{ fontSize: 26, fontWeight: 700 }}>
              {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
            </span>
          }
          subTitle={
            isSuccess ? (
              <div style={{ fontSize: 16, marginTop: 10 }}>
                🎉 Cảm ơn bạn đã đặt vé tại <b>TicketPop</b>  
                <br />  
                Chúc bạn có một buổi xem phim thật vui vẻ!
              </div>
            ) : (
              <div style={{ fontSize: 16, marginTop: 10 }}>
                Đã có lỗi xảy ra trong quá trình thanh toán.
                <br /> Ghế của bạn đã được trả lại, vui lòng thử lại.
              </div>
            )
          }
          extra={[
            <Button
              type="primary"
              size="large"
              style={{
                borderRadius: 8,
                paddingLeft: 30,
                paddingRight: 30,
              }}
              key="home"
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>,
          ]}
        />
      </Card>
    </div>
  );
}
