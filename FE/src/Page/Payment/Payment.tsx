import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin, message, Button, Input } from "antd";
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
    if (!datVe) {
      message.error("Không tìm thấy thông tin vé!");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/vnpay/create",
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
  const [voucherCode, setVoucherCode] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return message.warning("Vui lòng nhập mã");

    setApplying(true);
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/dat-ve/${datVe.id}/ap-dung-voucher`,
        { voucher_code: voucherCode.trim() }
      );

      setDatVe(res.data.dat_ve);
      setVoucherCode("");
      message.success("Áp dụng mã giảm giá thành công!");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Mã không hợp lệ");
    } finally {
      setApplying(false);
    }
  };

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
          {/* <div className="movie-poster-wrapper">
            <img
              src={
                datVe.lich_chieu?.phim?.anh_poster || "/placeholder-movie.jpg"
              }
              alt={datVe.lich_chieu?.phim?.ten_phim}
              className="movie-poster"
            />
          </div> */}

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
          </div>
          <div className="voucher-section">
            <div className="voucher-wrapper">
              <div className="voucher-label">
                {datVe.ma_giam_gia ? "Đã áp dụng mã giảm giá" : "Bạn có mã giảm giá?"}
              </div>

              <div className="voucher-input-group">
                {datVe.ma_giam_gia ? (
                  // Ô hiển thị mã giảm giá đã áp dụng
                  <div
                    className="voucher-input voucher-applied"
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #86efac",
                      color: "#166534",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontWeight: "500",
                      cursor: "not-allowed",
                      userSelect: "none",
                    }}
                  >
                    {datVe.ma_giam_gia}
                  </div>
                ) : (
                  // Ô nhập mã
                  <Input
                    className="voucher-input"
                    placeholder="Nhập mã giảm giá"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onPressEnter={handleApplyVoucher}
                    disabled={applying}
                  />
                )}

                <Button
                  type="primary"
                  className="voucher-btn"
                  loading={applying}
                  onClick={handleApplyVoucher}
                  disabled={!!datVe.ma_giam_gia || applying || !voucherCode.trim()}
                >
                  {datVe.ma_giam_gia ? "Đã áp dụng" : "Áp dụng"}
                </Button>
              </div>

              {datVe.ma_giam_gia && (
                <div className="voucher-applied-info">
                  <svg className="check-icon" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L7 10.586 5.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>

                  <span>
                    Đã áp dụng mã <strong>{datVe.ma_giam_gia}</strong> – Giảm{" "}
                    {datVe.giam_gia_percent
                      ? `${datVe.giam_gia_percent}%`
                      : `${new Intl.NumberFormat("vi-VN").format(
                        datVe.giam_gia_so_tien
                      )}₫`}
                  </span>
                </div>
              )}
            </div>
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
                    {ct.ghe.so_ghe}
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
                disabled={!datVe}
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
                disabled={!datVe}
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
