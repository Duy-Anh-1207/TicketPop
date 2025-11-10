import { useEffect, useState } from "react";
import { message, Spin, Button } from "antd";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useLichChieuDetail } from "../../hook/useLichChieu";
import "./Booking.scss";
import { useListFood } from "../../hook/FoodHook";
import type { Food } from "../../types/foods";
import type { GiaVe } from "../../types/giave";
import { datVe } from "../../provider/Client/datVeProvider";
import { useNavigate } from "react-router-dom";

interface SelectedSeat {
  id: number;
  so_ghe: string;
  loai_ghe_id: number;
  gia: number;
}

interface FoodQuantity {
  food: Food;
  quantity: number;
}

const Booking = () => {
  const location = useLocation();
  const lichChieuId = location.state?.lichChieuId;
  const navigate = useNavigate();

  // --- State dữ liệu ---
  const [giaVeList, setGiaVeList] = useState<GiaVe[]>([]);
  const [loadingGiaVe, setLoadingGiaVe] = useState(false);
  const { data: lichChieu, isLoading, error } = useLichChieuDetail(lichChieuId);
  const { data: foods, isLoading: loadingFood } = useListFood();

  const [gheList, setGheList] = useState<any[]>([]);
  const [loadingGhe, setLoadingGhe] = useState(false);

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [foodQuantities, setFoodQuantities] = useState<FoodQuantity[]>([]);

  // --- Lấy danh sách giá vé theo lịch chiếu ---
  useEffect(() => {
    if (!lichChieuId) return;

    const fetchGiaVe = async () => {
      setLoadingGiaVe(true);
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/gia-ve/${lichChieuId}`
        );
        const data = (res.data.data || []).map((item: any) => ({
          ...item,
          gia_ve: Number(item.gia_ve),
        }));
        setGiaVeList(data);
      } catch (error) {
        console.error("Lỗi khi lấy giá vé:", error);
        message.error("Không thể tải giá vé!");
      } finally {
        setLoadingGiaVe(false);
      }
    };

    fetchGiaVe();
  }, [lichChieuId]);

  // --- Lấy danh sách ghế ---
  useEffect(() => {
    if (!lichChieu?.phong?.id) return;

    const fetchGhe = async () => {
      setLoadingGhe(true);
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/ghe/${lichChieu.phong?.id}`
        );
        setGheList(res.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ghế:", error);
        message.error("Không thể tải danh sách ghế!");
      } finally {
        setLoadingGhe(false);
      }
    };

    fetchGhe();
  }, [lichChieu?.phong?.id]);

  // --- Xử lý chọn ghế ---
  const toggleSeat = (ghe: any) => {
    const isSelected = selectedSeats.some((s) => s.id === ghe.id);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== ghe.id));
    } else {
      // Tìm giá vé theo loại ghế của lịch chiếu
      const giaVe = giaVeList.find((gv) => gv.loai_ghe_id === ghe.loai_ghe_id);
      const gia = giaVe ? giaVe.gia_ve : 0;

      if (gia === 0) {
        message.warning("Không tìm thấy giá vé cho loại ghế này!");
      }

      setSelectedSeats([...selectedSeats, { ...ghe, gia }]);
    }
  };

  // --- Xử lý chọn đồ ăn ---
  const updateFoodQuantity = (food: Food, delta: number) => {
    setFoodQuantities((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((item) => item.food.id !== food.id);
        }
        return prev.map((item) =>
          item.food.id === food.id ? { ...item, quantity: newQty } : item
        );
      } else if (delta > 0) {
        return [...prev, { food, quantity: 1 }];
      }
      return prev;
    });
  };

  // --- Tính tổng tiền ---
  const totalSeatPrice = selectedSeats.reduce((sum, seat) => sum + seat.gia, 0);
  const totalFoodPrice = foodQuantities.reduce(
    (sum, item) => sum + item.food.gia_ban * item.quantity,
    0
  );
  const totalPrice = totalSeatPrice + totalFoodPrice;

  // --- Gom ghế theo hàng ---
  const hangList = gheList.reduce((acc, ghe) => {
    acc[ghe.hang] = acc[ghe.hang] || [];
    acc[ghe.hang].push(ghe);
    return acc;
  }, {} as Record<string, any[]>);

  // --- Loading states ---
  if (isLoading || loadingGiaVe)
    return (
      <div className="booking-center">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  if (error)
    return (
      <div className="booking-center">
        <p className="booking-error">Lỗi khi tải lịch chiếu!</p>
      </div>
    );

  if (!lichChieu)
    return (
      <div className="booking-center">
        <p className="booking-empty">Không tìm thấy thông tin lịch chiếu.</p>
      </div>
    );

  return (
    <div className="booking-container">
      {/* Phần thông tin phim */}
      <div className="booking-content">
        {lichChieu.phim?.anh_poster && (
          <img
            src={
              lichChieu.phim?.anh_poster?.startsWith("http")
                ? lichChieu.phim?.anh_poster
                : `${import.meta.env.VITE_API_BASE_URL}/storage/${lichChieu.phim?.anh_poster.replace("posters/", "posters/")}`
            }
            alt={lichChieu.phim?.ten_phim}
            className="booking-poster"
          />
        )}

        <div className="booking-info">
          <h2 className="movie-name">{lichChieu.phim?.ten_phim}</h2>
          <div className="info-list">
            <p>
              <span>Phòng chiếu:</span> {lichChieu.phong?.ten_phong}
            </p>
            <p>
              <span>Phiên bản:</span>{" "}
              {lichChieu.phien_ban?.the_loai || "Không xác định"}
            </p>
            <p>
              <span>Giờ chiếu:</span>{" "}
              {new Date(lichChieu.gio_chieu).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(lichChieu.gio_ket_thuc).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <span>Ngày chiếu:</span>{" "}
              {new Date(lichChieu.gio_chieu).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>

      {/* Sơ đồ ghế */}
      <div className="seat-container">
        <div className="screen"></div>
        {loadingGhe ? (
          <Spin tip="Đang tải danh sách ghế..." />
        ) : (
          <div className="seat-grid">
            {Object.keys(hangList)
              .sort()
              .map((hang) => (
                <div key={hang} className="seat-row" data-row={hang}>
                  <div className="seat-list">
                    {hangList[hang]
                      .sort((a: any, b: any) => a.cot - b.cot)
                      .map((ghe: any) => {
                        const isSelected = selectedSeats.some(
                          (s) => s.id === ghe.id
                        );
                        return (
                          <div
                            key={ghe.id}
                            className={`seat-item ${ghe.loai_ghe_id === 2 ? "vip" : "thuong"
                              } ${isSelected ? "selected" : ""}`}
                            onClick={() => toggleSeat(ghe)}
                          >
                            {ghe.so_ghe}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Chú thích ghế */}
        <div className="seat-legend">
          {" "}
          <div className="legend-item">
            {" "}
            <div className="legend-box thuong"></div> <span>Ghế thường</span>{" "}
          </div>{" "}
          <div className="legend-item">
            {" "}
            <div className="legend-box vip"></div> <span>Ghế VIP</span>{" "}
          </div>{" "}
          <div className="legend-item">
            {" "}
            <div className="legend-box selected"></div> <span>Đã chọn</span>{" "}
          </div>{" "}
        </div>
      </div>

      {/* Danh sách đồ ăn */}
      <div className="food-container">
        <h3 className="food-title">Chọn đồ ăn</h3>
        {loadingFood ? (
          <div className="food-loading">
            <Spin tip="Đang tải đồ ăn..." />
          </div>
        ) : (
          <div className="food-grid">
            {foods?.map((food: Food) => {
              const qty =
                foodQuantities.find((f) => f.food.id === food.id)?.quantity ||
                0;
              return (
                <div key={food.id} className="food-item">
                  <div className="food-image-placeholder">
                    <span role="img" aria-label="food">
                      🍿
                    </span>
                  </div>

                  <div className="food-info">
                    <p className="food-name">{food.ten_do_an}</p>
                    <p className="food-price">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(food.gia_ban)}
                    </p>

                    <div className="food-quantity">
                      <button
                        onClick={() => updateFoodQuantity(food, -1)}
                        disabled={qty === 0}
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="quantity-number">{qty}</span>
                      <button
                        onClick={() => updateFoodQuantity(food, 1)}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Khung tóm tắt & nút đặt vé */}
      <div className="booking-summary">
        <div className="summary-content">
          <h3>Thông tin đặt vé</h3>

          {/* Ghế đã chọn */}
          <div className="summary-section">
            <p className="section-title">Ghế:</p>
            {selectedSeats.length > 0 ? (
              <div className="selected-seats">
                {selectedSeats.map((seat) => (
                  <span key={seat.id} className="seat-tag">
                    {seat.so_ghe} ({seat.loai_ghe_id === 2 ? "VIP" : "Thường"})
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-text">Chưa chọn ghế</p>
            )}
          </div>

          {/* Đồ ăn */}
          <div className="summary-section">
            <p className="section-title">Đồ ăn:</p>
            {foodQuantities.length > 0 ? (
              <div className="food-list">
                {foodQuantities.map((item) => (
                  <div key={item.food.id} className="food-summary">
                    <span>
                      {item.food.ten_do_an} x{item.quantity}
                    </span>
                    <span>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.food.gia_ban * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text">Chưa chọn đồ ăn</p>
            )}
          </div>

          {/* Tổng tiền */}
          <div className="summary-total">
            <p>Tổng cộng:</p>
            <p className="total-price">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalPrice)}
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            block
            className="booking-btn"
            disabled={selectedSeats.length === 0}
            onClick={async () => {
              if (selectedSeats.length === 0) {
                message.warning("Vui lòng chọn ít nhất 1 ghế!");
                return;
              }

              try {
                const payload = {
                  lich_chieu_id: lichChieuId,
                  ghe: selectedSeats.map((seat) => seat.id),
                };

                const res = await datVe(payload);
                console.log("datVe response:", res);

                const createdVe = res?.dat_ve ?? res?.data ?? null;

                if (res?.message && createdVe?.id) {
                  message.success(res.message);

                  navigate("/booking/payment", {
                    state: { datVeId: createdVe.id },
                  });

                  // Reset dữ liệu
                  setSelectedSeats([]);
                  setFoodQuantities([]);
                  return;
                }

                console.warn("Không tìm thấy id vé trong response", res);
                message.warning("Không nhận được ID vé từ máy chủ!");
              } catch (error: any) {
                console.error("Lỗi đặt vé:", error);
                message.error(
                  error.response?.data?.message || "Đặt vé thất bại!"
                );
              }
            }}
          >
            Đặt vé ({selectedSeats.length} ghế)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
