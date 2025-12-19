import React, { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../component/Auth/AuthContext";
import { useUpdateUser } from "../../hook/UserHook";
import type { User } from "../../types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Icon con mắt
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"}`}></i>
);

const MyAccountPage = () => {
  const { user, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [activeTab, setActiveTab] = useState<"account" | "bookings">("account");

  // Thông tin cá nhân
  const [ten, setTen] = useState(user?.ten || "");
  const [soDienThoai, setSoDienThoai] = useState(user?.so_dien_thoai || "");

  // Mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Chi tiết vé & modal
  const [bookingDetails, setBookingDetails] = useState<Map<string, any>>(new Map());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);

  // Đánh giá phim
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

  // Gửi đánh giá
  const submitReview = async (phimId: number) => {
    if (rating === 0) {
      Swal.fire("Thông báo", "Vui lòng chọn số sao trước khi gửi đánh giá.", "warning");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await axios.post(
        `${apiBase}/danh-gia`,
        {
          phim_id: phimId,
          so_sao: rating,
          noi_dung: reviewText.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      Swal.fire("Thành công!", "Cảm ơn bạn đã đánh giá phim!", "success");
      setRating(0);
      setHoverRating(0);
      setReviewText("");
    } catch (error: any) {
      Swal.fire("Lỗi", error.response?.data?.message || "Không thể gửi đánh giá.", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Lấy lịch sử đặt vé
  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ["userBookingHistory", user?.email],
    queryFn: async () => {
      const res = await axios.get(`${apiBase}/dat-ve`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.data || [];
    },
    enabled: activeTab === "bookings" && !!user?.email,
  });

  // Reset khi đổi tab hoặc user
  useEffect(() => {
    setBookingDetails(new Map());
    if (activeTab === "bookings") refetch();
  }, [user?.email, activeTab, refetch]);

  // Fetch chi tiết vé
  const fetchBookingDetails = useCallback(
    async (datVeId: string) => {
      if (bookingDetails.has(datVeId)) return bookingDetails.get(datVeId);

      try {
        const res = await axios.get(`${apiBase}/dat-ve/${datVeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const details = res.data.data;
        setBookingDetails((prev) => new Map(prev).set(datVeId, details));
        return details;
      } catch (error) {
        console.error("Lỗi lấy chi tiết vé:", error);
        return null;
      }
    },
    [bookingDetails, apiBase]
  );

  // Auto fetch chi tiết khi có danh sách vé
  useEffect(() => {
    if (bookings.length > 0 && activeTab === "bookings") {
      bookings.forEach((booking: any) => {
        const id = booking.dat_ve_id?.toString();
        if (id && !bookingDetails.has(id)) {
          fetchBookingDetails(id);
        }
      });
    }
  }, [bookings, activeTab, bookingDetails, fetchBookingDetails]);

  // Trạng thái chiếu phim
  const getShowStatus = (booking: any, details: any) => {
    const timeStr = booking?.lich_chieu?.gio_chieu || details?.lich_chieu?.gio_chieu;
    if (!timeStr) return { label: "Không rõ", color: "secondary" };

    const start = new Date(timeStr);
    const endStr = booking?.lich_chieu?.gio_ket_thuc || details?.lich_chieu?.gio_ket_thuc;
    const end = endStr ? new Date(endStr) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();

    if (now < start) return { label: "Chưa chiếu", color: "info" };
    if (now >= start && now <= end) return { label: "Đang chiếu", color: "success" };
    return { label: "Đã chiếu", color: "secondary" };
  };

  if (!user) {
    return (
      <div className="container p-5 text-center">
        <h2>Vui lòng đăng nhập để xem thông tin.</h2>
        <a href="/dang-nhap" className="btn btn-primary mt-3">Đi đến trang đăng nhập</a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      Swal.fire("Lỗi!", "Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.", "error");
      return;
    }

    const payload: any = {
      ten,
      so_dien_thoai: soDienThoai,
      current_password: currentPassword,
    };

    if (showPasswordFields) {
      if (!password || !passwordConfirm) {
        Swal.fire("Lỗi!", "Vui lòng nhập đầy đủ mật khẩu mới.", "error");
        return;
      }
      if (password !== passwordConfirm) {
        Swal.fire("Lỗi!", "Mật khẩu mới không khớp.", "error");
        return;
      }
      payload.password = password;
      payload.password_confirmation = passwordConfirm;
    }

    updateUserMutation.mutate(
      { id: user.id, values: payload },
      {
        onSuccess: (res: any) => {
          setUser({ ...user, ...(res.user as User) });
          Swal.fire("Thành công!", res.message || "Cập nhật thành công!", "success");
          setShowPasswordFields(false);
          setCurrentPassword("");
          setPassword("");
          setPasswordConfirm("");
        },
        onError: (err: any) => {
          Swal.fire("Lỗi!", err.response?.data?.message || "Cập nhật thất bại.", "error");
        },
      }
    );
  };

  return (
    <>
      <div className="container mt-4 mb-5" style={{ maxWidth: "900px" }}>
        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn ${activeTab === "account" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("account")}
          >
            Thông tin tài khoản
          </button>
          <button
            className={`btn ${activeTab === "bookings" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("bookings")}
          >
            Lịch sử đặt vé
          </button>
        </div>

        {/* TAB Tài khoản */}
        {activeTab === "account" && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3>Thông tin tài khoản</h3>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Họ và tên</label>
                  <input type="text" className="form-control" value={ten} onChange={(e) => setTen(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input type="email" className="form-control" value={user.email} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Số điện thoại</label>
                  <input type="text" className="form-control" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
                </div>

                <hr className="my-4" />

                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu hiện tại (bắt buộc để lưu)</label>
                  <div className="input-group">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập để xác nhận thay đổi"
                      required
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                      <EyeIcon visible={showCurrentPw} />
                    </button>
                  </div>
                </div>

                {!showPasswordFields ? (
                  <div className="text-center mb-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPasswordFields(true)}>
                      Thay đổi mật khẩu
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Mật khẩu mới</label>
                      <div className="input-group">
                        <input
                          type={showNewPw ? "text" : "password"}
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowNewPw(!showNewPw)}>
                          <EyeIcon visible={showNewPw} />
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
                      <input
                        type={showNewPw ? "text" : "password"}
                        className="form-control"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                    <button type="button" className="btn btn-link p-0" onClick={() => setShowPasswordFields(false)}>
                      Hủy thay đổi mật khẩu
                    </button>
                  </div>
                )}

                <div className="text-end">
                  <button type="submit" className="btn btn-primary" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB Lịch sử đặt vé */}
        {activeTab === "bookings" && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3>Lịch sử đặt vé</h3>
            </div>
            <div className="card-body p-4">
              {bookingsLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="alert alert-info text-center">
                  Bạn chưa có vé nào. <a href="/">Đặt vé ngay!</a>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn</th>
                        <th>Phim</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Tổng tiền</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking: any) => {
                        const id = booking.dat_ve_id?.toString();
                        const details = id ? bookingDetails.get(id) : null;

                        return (
                          <React.Fragment key={booking.dat_ve_id || booking.ma_don_hang}>
                            <tr>
                              <td><span className="badge bg-primary">{booking.ma_don_hang}</span></td>
                              <td><strong>{booking.phim}</strong></td>
                              <td>{booking.ngay_dat}</td>
                              <td>
                                <span className={`badge bg-${getShowStatus(booking, details).color}`}>
                                  {getShowStatus(booking, details).label}
                                </span>
                              </td>
                              <td><strong className="text-danger">{booking.tong_tien}</strong></td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={async () => {
                                    if (!id) return Swal.fire("Lỗi", "Không tìm thấy ID vé", "error");
                                    const det = await fetchBookingDetails(id);
                                    setSelectedBookingDetails(det || bookingDetails.get(id));
                                    setSelectedBookingId(id);
                                    setRating(0);
                                    setHoverRating(0);
                                    setReviewText("");
                                    setShowDetailModal(true);
                                  }}
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>

                            {/* Chi tiết nhanh dưới dòng (ghế + đồ ăn) */}
                            {details && (
                              <tr>
                                <td colSpan={6} className="p-0">
                                  <div className="p-3 bg-light border-top">
                                    <div className="row g-3">
                                      {details.chi_tiet?.length > 0 && (
                                        <div className="col-md-6">
                                          <h6 className="text-primary fw-bold mb-2">Ghế đã đặt</h6>
                                          <div className="d-flex flex-wrap gap-2">
                                            {details.chi_tiet.map((ct: any, i: number) => (
                                              <span key={i} className="badge bg-success">
                                                Ghế {ct.ghe?.so_ghe} <small>({ct.ghe?.loai_ghe?.ten_loai_ghe})</small>
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {details.do_an?.length > 0 && (
                                        <div className="col-md-6">
                                          <h6 className="text-primary fw-bold mb-2">Đồ ăn</h6>
                                          <ul className="list-unstyled small mb-0">
                                            {details.do_an.map((f: any, i: number) => (
                                              <li key={i} className="d-flex justify-content-between border-bottom pb-1 mb-1">
                                                <span>{f.ten_do_an} × {f.so_luong || 1}</span>
                                                <span>
                                                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                                    (f.gia_ban || 0) * (f.so_luong || 1)
                                                  )}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal chi tiết vé */}
        {showDetailModal && (
          <>
            <div className="modal d-block" tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header border-0 pb-0">
                    <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} />
                  </div>
                  <div className="modal-body pt-0">
                    {(() => {
                      const det = selectedBookingDetails || (selectedBookingId ? bookingDetails.get(selectedBookingId) : null);
                      if (!det) return <p className="text-center">Đang tải chi tiết...</p>;

                      const phimId = det.lich_chieu?.phim?.id || det.phim_id;
                      const posterUrl = det.lich_chieu?.phim?.anh_poster
                        ? det.lich_chieu.phim.anh_poster.startsWith("http")
                          ? det.lich_chieu.phim.anh_poster
                          : `http://127.0.0.1:8000/storage/${det.lich_chieu.phim.anh_poster}`
                        : "/placeholder-movie.png";

                      const movieName = det.lich_chieu?.phim?.ten_phim || det.phim || "Không rõ";
                      const roomName = det.lich_chieu?.phong?.ten_phong || "Không rõ";
                      const showTime = det.lich_chieu?.gio_chieu ? new Date(det.lich_chieu.gio_chieu) : null;

                      return (
                        <div>
                          <div className="row mb-4">
                            <div className="col-md-4 text-center">
                              <img src={posterUrl} alt={movieName} className="img-fluid rounded shadow-sm" style={{ maxHeight: "280px", objectFit: "cover" }} onError={(e) => (e.currentTarget.src = "/placeholder-movie.png")} />
                            </div>
                            <div className="col-md-8">
                              <h4 className="text-primary fw-bold mb-3">{movieName}</h4>
                              <div className="p-3 bg-light rounded mb-3">
                                <div className="row">
                                  <div className="col-6">
                                    <p className="text-muted mb-1">Phòng chiếu</p>
                                    <p className="fw-bold">{roomName}</p>
                                  </div>
                                  <div className="col-6">
                                    <p className="text-muted mb-1">Thời gian</p>
                                    <p className="fw-bold">
                                      {showTime?.toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }) || "Không rõ"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-muted mb-1">Phương thức thanh toán</p>
                              <p className="fw-bold text-success">{det.thanh_toan || "—"}</p>
                            </div>
                          </div>

                          {det.qr_code && (
                            <div className="text-center my-4">
                              <div className="d-inline-block p-3 bg-white rounded shadow-sm">
                                <h6 className="text-primary fw-bold mb-3">Mã QR vé</h6>
                                <img
                                  src={`http://localhost:8000/storage/${det.qr_code}`}
                                  alt="QR Code"
                                  style={{ width: "180px", height: "180px" }}
                                  onError={(e) => (e.currentTarget.style.display = "none")}
                                />
                              </div>
                            </div>
                          )}

                          <hr />

                          {det.chi_tiet?.length > 0 && (
                            <div className="mb-4">
                              <h6 className="text-primary fw-bold mb-3">Ghế đã đặt ({det.chi_tiet.length})</h6>
                              <div className="d-flex flex-wrap gap-2">
                                {det.chi_tiet.map((ct: any, i: number) => (
                                  <div key={i} className="badge bg-success text-white p-2" style={{ fontSize: "0.95rem" }}>
                                    <div className="fw-bold">{ct.ghe?.so_ghe}</div>
                                    <small>{ct.ghe?.loai_ghe?.ten_loai_ghe || "Ghế thường"}</small>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {det.do_an?.length > 0 && (
                            <div className="mb-4">
                              <h6 className="text-primary fw-bold mb-3">Đồ ăn kèm</h6>
                              <div className="row g-3">
                                {det.do_an.map((f: any, i: number) => (
                                  <div key={i} className="col-md-6">
                                    <div className="card border-0 bg-light h-100">
                                      <div className="card-body p-3">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div>
                                            <h6 className="mb-1 fw-bold">{f.ten_do_an}</h6>
                                            <small className="text-muted">× {f.so_luong || 1}</small>
                                          </div>
                                          <span className="badge bg-warning text-dark fw-bold">
                                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                              (f.gia_ban || 0) * (f.so_luong || 1)
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Đánh giá phim */}
                          {phimId && (
                            <>
                              <hr />
                              <div className="mb-4">
                                <h5 className="text-primary fw-bold mb-3">Đánh giá phim</h5>
                                <div className="d-flex align-items-center mb-3">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <i
                                      key={s}
                                      className={`fa-solid fa-star fa-2x mx-1 ${(hoverRating || rating) >= s ? "text-warning" : "text-muted"}`}
                                      style={{ cursor: "pointer" }}
                                      onClick={() => setRating(s)}
                                      onMouseEnter={() => setHoverRating(s)}
                                      onMouseLeave={() => setHoverRating(0)}
                                    />
                                  ))}
                                  <span className="ms-3 fw-bold">{rating || "Chưa chọn"} sao</span>
                                </div>
                                <textarea
                                  className="form-control mb-3"
                                  rows={3}
                                  placeholder="Viết cảm nhận của bạn (tùy chọn)..."
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                />
                                <div className="text-end">
                                  <button
                                    className="btn btn-primary"
                                    disabled={isSubmittingReview || rating === 0}
                                    onClick={() => submitReview(phimId)}
                                  >
                                    {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                          <hr />

                          <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded">
                            <h6 className="mb-0 fw-bold">Tổng tiền:</h6>
                            <h5 className="mb-0 text-danger fw-bold">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(det.tong_tien || 0)}
                            </h5>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="modal-footer border-0">
                    <button className="btn btn-primary" onClick={() => setShowDetailModal(false)}>
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
          </>
        )}
      </div>
    </>
  );
};

export default MyAccountPage;