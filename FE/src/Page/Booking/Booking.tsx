import { useEffect, useState } from "react";
import { message, Spin, Button } from "antd";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useLichChieuDetail } from "../../hook/useLichChieu";
import { useListFood } from "../../hook/FoodHook";
import type { Food } from "../../types/foods";
import type { GiaVe } from "../../types/giave";
import { datVe } from "../../provider/Client/datVeProvider";
import "./Booking.scss";

interface SelectedSeat {
  id: number;
  so_ghe: string;
  loai_ghe_id: number;
  gia: number;
  hang?: string | number;
  cot?: number;
  trang_thai?: string;
}

interface FoodQuantity {
  food: Food;
  quantity: number;
}

const Booking = () => {
  const location = useLocation();
  const lichChieuId = location.state?.lichChieuId;
  const navigate = useNavigate();

  const { data: lichChieu, isLoading, error } = useLichChieuDetail(lichChieuId);
  const { data: foods, isLoading: loadingFood } = useListFood();

  const [giaVeList, setGiaVeList] = useState<GiaVe[]>([]);
  const [loadingGiaVe, setLoadingGiaVe] = useState(false);
  const [gheList, setGheList] = useState<any[]>([]);
  const [loadingGhe, setLoadingGhe] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [foodQuantities, setFoodQuantities] = useState<FoodQuantity[]>([]);

  // --- Lấy danh sách giá vé ---
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
    if (!lichChieuId) return;

    let mounted = true;

    const fetchGhe = async () => {
      setLoadingGhe(true);
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/check-ghe/lich-chieu/${lichChieuId}`
        );

        if (!mounted) return;
        const gheFormatted = res.data.data;
        setGheList(gheFormatted);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách ghế:", error);
        if (mounted) message.error("Không thể tải danh sách ghế!");
      } finally {
        if (mounted) setLoadingGhe(false);
      }
    };

    // load lần đầu và sau đó reload mỗi 15s
    fetchGhe();
    const intervalId = window.setInterval(fetchGhe, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [lichChieuId]);

  // Gom ghế theo hàng
  const hangList = gheList.reduce((acc, ghe) => {
    acc[ghe.hang] = acc[ghe.hang] || [];
    acc[ghe.hang].push(ghe);
    return acc;
  }, {} as Record<string, any[]>);

  // ===== Kiểm tra rule: không để 1 ghế trống giữa 2 ghế occupied (da_dat hoặc selected) =====
  const canSelectWithoutCreatingIsolated = (gheToToggle: any) => {
    const isAlreadySelected = selectedSeats.some(
      (s) => s.id === gheToToggle.id
    );
    // Nếu đang bỏ chọn thì luôn cho phép
    if (isAlreadySelected) return true;

    // Mô phỏng bộ selected sau khi chọn gheToToggle
    const newSelectedIds = new Set(selectedSeats.map((s) => s.id));
    newSelectedIds.add(gheToToggle.id);

    // Duyệt từng hàng, kiểm tra pattern Occupied - Empty - Occupied
    for (const hangKey of Object.keys(hangList)) {
      const row = [...hangList[hangKey]].sort(
        (a: any, b: any) => a.cot - b.cot
      );

      // Tạo set các ghế occupied (da_dat hoặc selected trong simulation)
      const occupied = new Set<number>();
      row.forEach((seat: any) => {
        if (seat.trang_thai === "da_dat") occupied.add(seat.id);
      });
      newSelectedIds.forEach((id) => occupied.add(id));

      // Kiểm tra mọi vị trí trung gian nếu thỏa điều kiện: left occupied && right occupied && middle NOT occupied
      for (let i = 1; i < row.length - 1; i++) {
        const left = row[i - 1];
        const mid = row[i];
        const right = row[i + 1];

        // mid must be an actual seat (not a gap). If mid is da_dat => it's occupied already and cannot be "empty"
        const midOccupied = occupied.has(mid.id);
        const leftOccupied = occupied.has(left.id);
        const rightOccupied = occupied.has(right.id);

        if (leftOccupied && rightOccupied && !midOccupied) {
          // BUT: nếu mid là ghế không tồn tại (không xảy ra vì row list là ghế liên tiếp),
          // hoặc mid đang là ghế bị block (ví dụ không bán) thì có thể khác,
          // ở đây ta coi mọi ghế trong row là khả dụng trừ khi trang_thai === 'da_dat'.
          return false; // tạo ra ghế trống đơn lẻ => không cho chọn
        }
      }
    }

    return true; // không tạo pattern banned => cho chọn
  };

  // --- Chọn ghế ---
  const toggleSeat = (ghe: any) => {
    if (ghe.trang_thai === "da_dat") {
      message.warning(`Ghế ${ghe.so_ghe} đã được đặt!`);
      return;
    }

    const isSelected = selectedSeats.some((s) => s.id === ghe.id);

    // Nếu chọn (không phải bỏ chọn) thì kiểm tra rule cấm để trống 1 ghế giữa 2 occupied
    if (!isSelected) {
      if (!canSelectWithoutCreatingIsolated(ghe)) {
        message.warning(
          "Không thể chọn: sẽ tạo 1 ghế trống nằm giữa 2 ghế đã/đang đặt!"
        );
        return;
      }
    }

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== ghe.id));
    } else {
      const giaVe = giaVeList.find((gv) => gv.loai_ghe_id === ghe.loai_ghe_id);
      const gia = giaVe?.gia_ve ?? 0;
      if (gia === 0) message.warning("Không tìm thấy giá vé cho loại ghế này!");
      setSelectedSeats([...selectedSeats, { ...ghe, gia }]);
    }
  };

  // --- Chọn đồ ăn ---
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

  // Loading
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

  // --- Đặt vé ---
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }

    try {
      const payload = {
        lich_chieu_id: lichChieuId,
        ghe: selectedSeats.map((seat) => seat.id),
        do_an: foodQuantities.map((item) => ({
          do_an_id: item.food.id,
          so_luong: item.quantity,
        })),
      };

      const res = await datVe(payload);
      const createdVe = res?.dat_ve ?? res?.data ?? null;

      if (res?.message && createdVe?.id) {
        navigate("/booking/payment", {
          state: { datVeId: createdVe.id, tongTien: totalPrice },
        });

        setSelectedSeats([]);
        setFoodQuantities([]);
        return;
      }

      message.warning("Không nhận được ID vé từ máy chủ!");
    } catch (error: any) {
      console.error("Lỗi đặt vé:", error);
      message.error(error.response?.data?.message || "Đặt vé thất bại!");
    }
  };

  return (
    <div className="booking-page"><div className="booking-container">
      {/* Thông tin phim */}
      <div className="booking-content">
        {lichChieu.phim?.anh_poster && (
          <img
            src={
              lichChieu.phim?.anh_poster?.startsWith("http")
                ? lichChieu.phim?.anh_poster
                : `${import.meta.env.VITE_API_BASE_URL}/storage/${lichChieu.phim?.anh_poster
                }`
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

      {/* Ghế */}
      <div className="seat-container">
        <div className="screen"></div>
        {loadingGhe ? (
          <Spin tip="Đang tải danh sách ghế..." />
        ) : (
          <div className="seat-grid">
            {Object.keys(hangList)
              .sort()
              .map((hang) => (
                <div key={hang} className="seat-row">
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
                            className={`seat-item ${ghe.trang_thai === "da_dat"
                                ? "booked"
                                : ghe.trang_thai_ghe === 0
                                  ? "broken"
                                  : isSelected
                                    ? "selected"
                                    : ghe.loai_ghe_id === 2
                                      ? "vip"
                                      : "thuong"
                              }`}
                            onClick={() =>
                              ghe.trang_thai !== "da_dat" && toggleSeat(ghe)
                            }
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
      </div>

      {/* Đồ ăn */}
      <div className="food-container">
        <h3 className="food-title">Chọn đồ ăn</h3>
        {loadingFood ? (
          <Spin tip="Đang tải đồ ăn..." />
        ) : (
          <div className="food-grid">
            {foods?.map((food: Food) => {
              const qty =
                foodQuantities.find((f) => f.food.id === food.id)?.quantity ||
                0;
              return (
                <div key={food.id} className="food-item">
                  <div className="food-image">
                    {food.image ? (
                      <img
                        src={
                          food.image.startsWith("http")
                            ? food.image
                            : `${import.meta.env.VITE_API_BASE_URL}${food.image
                            }`
                        }
                        alt={food.ten_do_an}
                        className="food-img"
                      />
                    ) : (
                      <span className="food-icon">🍿</span>
                    )}
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
                      >
                        −
                      </button>
                      <span className="quantity-number">{qty}</span>
                      <button onClick={() => updateFoodQuantity(food, 1)}>
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

      {/* Tóm tắt */}
      <div className="booking-summary">
        <div className="summary-content">
          <h3>Thông tin đặt vé</h3>

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
            onClick={handleBooking}
          >
            Đặt vé ({selectedSeats.length} ghế)
          </Button>
        </div>
      </div>
    </div></div>

  );
};

export default Booking;
