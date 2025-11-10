import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin, message, Button } from "antd";
import axios from "axios";
import "./Payment.scss";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const datVeId = location.state?.datVeId;

  const [loading, setLoading] = useState(false);
  const [datVe, setDatVe] = useState<any>(null);

  useEffect(() => {
    if (!datVeId) {
      message.error("Không tìm thấy vé!");
      navigate("/");
      return;
    }

    const fetchChiTietVe = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/dat-ve/${datVeId}`
        );
        setDatVe(res.data.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết vé:", error);
        message.error("Không thể tải thông tin vé!");
      } finally {
        setLoading(false);
      }
    };

    fetchChiTietVe();
  }, [datVeId]);

  if (loading)
    return (
      <div className="payment-center">
        <Spin tip="Đang tải thông tin vé..." />
      </div>
    );

  if (!datVe)
    return (
      <div className="payment-center">
        <p>Không tìm thấy thông tin vé!</p>
      </div>
    );

  const handleThanhToanOnline = async () => {
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/thanhtoan/zalopay`, {
        dat_ve_id: datVe.id,
        tong_tien: datVe.tong_tien,
      });

      if (res.data?.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        message.warning("Không nhận được liên kết thanh toán!");
      }
    } catch (error: any) {
      console.error("❌ Lỗi thanh toán:", error);
      message.error(error.response?.data?.message || "Không thể thanh toán!");
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-grid">
        {/* Cột trái: Thông tin phim */}
        <div className="left-column">
          {datVe.lich_chieu?.phim?.anh_poster && (
            <img
              src={datVe.lich_chieu.phim.anh_poster}
              alt={datVe.lich_chieu.phim.ten_phim}
              className="movie-poster"
            />
          )}
          <div className="movie-details">
            <h2>{datVe.lich_chieu?.phim?.ten_phim}</h2>
            <p>Phòng: {datVe.lich_chieu?.phong?.ten_phong}</p>
            <p>
              Ngày chiếu:{" "}
              {new Date(datVe.lich_chieu?.gio_chieu).toLocaleDateString("vi-VN")}
            </p>
            <p>
              Giờ chiếu:{" "}
              {new Date(datVe.lich_chieu?.gio_chieu).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(datVe.lich_chieu?.gio_ket_thuc).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            <div className="seat-info">
              <h4>Ghế đã chọn</h4>
              <div className="seat-list">
                {datVe.chi_tiet.map((ct: any) => (
                  <span key={ct.id} className="seat-tag">
                    {ct.ghe.so_ghe} ({ct.ghe.loai_ghe?.ten_loai_ghe})
                  </span>
                ))}
              </div>
            </div>

            {datVe.do_an && datVe.do_an.length > 0 && (
              <div className="food-info">
                <h4>Đồ ăn đã chọn</h4>
                {datVe.do_an.map((item: any) => (
                  <div key={item.id} className="food-item">
                    <span>{item.ten_do_an}</span>
                    <span>x{item.quantity}</span>
                    <span>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.gia_ban * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Thanh toán */}
        <div className="right-column">
          <div className="total-price">
            <h3>
              Tổng tiền:{" "}
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(datVe.tong_tien))}
              </span>
            </h3>
          </div>

          <div className="payment-methods">
            <h4>Phương thức thanh toán</h4>
            <Button type="primary" size="large" block onClick={handleThanhToanOnline}>
              Thanh toán online qua ZaloPay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
