import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin, message, Button } from "antd";
import axios from "axios";
import "./Payment.scss";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleThanhToanMoMo = async () => {
    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/thanhtoan/momo",
        {
          dat_ve_id: datVe.id,
          amount: Number(datVe.tong_tien),
          return_url: window.location.origin + "/ket-qua-thanh-toan",
        }
      );
      const url = data?.payment_url;
      if (url) window.location.assign(url);
      else message.error("Không nhận được liên kết thanh toán từ MoMo");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể thanh toán!");
    }
  };

  const handleThanhToanVNPAY = async () => {
    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/thanhtoan/vnpay",
        {
          dat_ve_id: datVe.id,
          amount: Number(datVe.tong_tien),
          return_url: window.location.origin + "/ket-qua-thanh-toan",
        }
      );
      const url = data?.payment_url;
      if (url) window.location.assign(url);
      else message.error("Không nhận được liên kết thanh toán từ VNPAY");
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Không thể thanh toán!");
    }
  };


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
        <Spin tip="Đang tải thông tin vé..." size="large" />
      </div>
    );

  if (!datVe)
    return (
      <div className="payment-center">
        <p>Không tìm thấy thông tin vé!</p>
      </div>
    );

  const hoTen = datVe.ho_ten || datVe.nguoi_dung?.ten || "Khách lẻ";
  const email = datVe.email || datVe.nguoi_dung?.email || "Chưa cung cấp";
  const soDienThoai =
    datVe.so_dien_thoai || datVe.nguoi_dung?.so_dien_thoai || "Chưa cung cấp";

  return (
    <div className="payment-container">
      <div className="payment-grid">
        <div className="left-column">
          <div className="movie-poster-wrapper">
            <img
              src={
                datVe.lich_chieu?.phim?.anh_poster || "/placeholder-movie.jpg"
              }
              alt={datVe.lich_chieu?.phim?.ten_phim}
              className="movie-poster"
            />
          </div>

          <div className="customer-info">
            <h3>Thông tin khách hàng</h3>
            <div className="info-item">
              <span className="label">Họ tên:</span>
              <span className="value">{hoTen}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{email}</span>
            </div>
            <div className="info-item">
              <span className="label">SĐT:</span>
              <span className="value">{soDienThoai}</span>
            </div>
            {datVe.nguoi_dung && (
              <div className="info-item">
                <span className="label">Tài khoản:</span>
                <span className="value highlight">Thành viên</span>
              </div>
            )}
          </div>
        </div>

        <div className="right-column">
          <div className="movie-details">
            <h2>{datVe.lich_chieu?.phim?.ten_phim}</h2>
            <p>Phòng: {datVe.lich_chieu?.phong?.ten_phong}</p>
            <p>
              Ngày chiếu:{" "}
              {new Date(datVe.lich_chieu?.gio_chieu).toLocaleDateString(
                "vi-VN"
              )}
            </p>
            <p>
              Giờ:{" "}
              {new Date(datVe.lich_chieu?.gio_chieu).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}{" "}
              -{" "}
              {new Date(datVe.lich_chieu?.gio_ket_thuc).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>

            {/* Ghế đã chọn */}
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

            {/* ĐỒ ĂN */}
            {datVe.do_an && datVe.do_an.length > 0 && (
              <div className="food-info">
                <h4>Combo đồ ăn</h4>
                {datVe.do_an.map((item: any) => (
                  <div key={item.id} className="food-item">
                    {item.anh_do_an ? (
                      <img
                        src="https://png.pngtree.com/png-clipart/20240608/original/pngtree-popcorn-corn-cinema-icon-vector-cinema-png-image_15274782.png"
                        alt={item.ten_do_an}
                        className="food-thumb"
                      />
                    ) : (
                      <div className="food-thumb placeholder">Food</div>
                    )}
                    <div className="food-details">
                      <span className="food-name">{item.ten_do_an}</span>
                      <span className="food-quantity">x{item.quantity}</span>
                      <span className="food-price">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.gia_ban * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
              <Button
                type="primary"
                size="large"
                block
                onClick={handleThanhToanMoMo}
                className="momo-btn"
                style={{
                  backgroundColor: "#a50064",
                  borderColor: "#a50064",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                  alt="MoMo"
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                />

                Thanh toán qua MoMo
              </Button>
            </div>
            <br />
            <div className="payment-methods">
              <Button
                type="primary"
                size="large"
                block
                onClick={handleThanhToanVNPAY}
                className="momo-btn"
                style={{
                  backgroundColor: "#a50064",
                  borderColor: "#a50064",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <img
                  src="https://images.seeklogo.com/logo-png/42/1/vnpay-logo-png_seeklogo-428006.png"
                  alt="VNPAY"
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                />
                Thanh toán qua VNPAY
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
