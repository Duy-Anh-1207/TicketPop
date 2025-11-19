import React, { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../component/Auth/AuthContext";
import { useUpdateUser } from "../../hook/UserHook";
import type { User } from "../../types/user";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Icon con mắt (sử dụng Font Awesome đã import trong main.tsx)
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
);

const MyAccountPage = () => {
  const { user, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();
  const [activeTab, setActiveTab] = useState<"account" | "bookings">("account");

  // State cho thông tin chính
  const [ten, setTen] = useState(user?.ten || "");
  const [soDienThoai, setSoDienThoai] = useState(user?.so_dien_thoai || "");

  // State cho phần mật khẩu
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  // State cho ẩn/hiện mật khẩu
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // State cho chi tiết vé
  const [bookingDetails, setBookingDetails] = useState<Map<string, any>>(new Map());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);

  // Fetch booking history
  const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ["userBookingHistory", user?.email],
    queryFn: async () => {
      const response = await axios.get(`${apiBase}/dat-ve`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data.data || [];
    },
    enabled: activeTab === "bookings" && !!user?.email,
  });

  // Clear booking details when user changes
  React.useEffect(() => {
    setBookingDetails(new Map());
    if (activeTab === "bookings") {
      refetch();
    }
  }, [user?.email, activeTab, refetch]);

  // Fetch chi tiết vé (ghế và đồ ăn)
  const fetchBookingDetails = React.useCallback(async (datVeId: string) => {
    if (bookingDetails.has(datVeId)) {
      return bookingDetails.get(datVeId);
    }

    try {
      const response = await axios.get(`${apiBase}/dat-ve/${datVeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const details = response.data.data;
      setBookingDetails(prev => new Map(prev).set(datVeId, details));
      return details;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết vé:", error);
      return null;
    }
  }, [bookingDetails, apiBase]);

  // Auto fetch details khi bookings thay đổi (dùng dat_ve_id trả về từ API)
  React.useEffect(() => {
    if (bookings.length > 0 && activeTab === "bookings") {
      bookings.forEach((booking: any) => {
        const id = booking.dat_ve_id ?? null;
        if (id && !bookingDetails.has(String(id))) {
          fetchBookingDetails(String(id));
        }
      });
    }
  }, [bookings, activeTab, bookingDetails, fetchBookingDetails]);

  // Hàm tính trạng thái vé dựa vào thời gian bắt đầu/kết thúc của lịch chiếu
  const getShowStatus = (booking: any, details: any) => {
    const showtimeStr = booking?.lich_chieu?.gio_chieu || details?.lich_chieu?.gio_chieu;
    if (!showtimeStr) return { label: "Không rõ", color: "secondary" };

    const start = new Date(showtimeStr);
    const endStr = booking?.lich_chieu?.gio_ket_thuc || details?.lich_chieu?.gio_ket_thuc;
    const end = endStr ? new Date(endStr) : new Date(start.getTime() + 1000 * 60 * 60 * 2); // fallback 2 giờ

    const now = new Date();
    if (now < start) return { label: "Chưa chiếu", color: "info" };
    if (now >= start && now <= end) return { label: "Đang chiếu", color: "success" };
    return { label: "Đã chiếu", color: "secondary" };
  };

  if (!user) {
    return (
      <div className="container p-5 text-center">
        <h2>Vui lòng đăng nhập để xem thông tin.</h2>
        <a href="/dang-nhap">Đi đến trang đăng nhập</a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mật khẩu hiện tại LÀ BẮT BUỘC cho BẤT KỲ thay đổi nào
    if (!currentPassword) {
      Swal.fire("Lỗi!", "Vui lòng nhập Mật khẩu hiện tại để xác nhận thay đổi.", "error");
      return;
    }

    // 2. Chuẩn bị payload (luôn có current_password)
    const updatedValues: {
      ten: string;
      so_dien_thoai: string;
      current_password: string;
      password?: string;
      password_confirmation?: string;
    } = {
      ten: ten,
      so_dien_thoai: soDienThoai,
      current_password: currentPassword,
    };

    // 3. Nếu người dùng đang MỞ form đổi mật khẩu, validate và thêm vào
    if (showPasswordFields) {
      if (!password || !passwordConfirm) {
        Swal.fire("Lỗi!", "Vui lòng nhập Mật khẩu mới và Xác nhận mật khẩu.", "error");
        return;
      }
      if (password !== passwordConfirm) {
        Swal.fire("Lỗi!", "Mật khẩu mới và xác nhận không khớp.", "error");
        return;
      }
      // Thêm vào payload
      updatedValues.password = password;
      updatedValues.password_confirmation = passwordConfirm;
    }

    // 4. Gọi hook mutation
    updateUserMutation.mutate(
      { id: user.id, values: updatedValues },
      {
        onSuccess: (response) => {
          const updatedUser = response.user as User;
          setUser({ ...user, ...updatedUser });

          Swal.fire("Thành công!", response.message || "Cập nhật thông tin thành công!", "success");
          
          // Reset form mật khẩu
          setShowPasswordFields(false);
          setCurrentPassword(""); // Quan trọng: Xóa mật khẩu hiện tại sau khi thành công
          setPassword("");
          setPasswordConfirm("");
        },
        onError: (error: any) => {
          Swal.fire(
            "Lỗi!",
            error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.",
            "error"
          );
        },
      }
    );
  };

  return (
    <>
      <div className="container mt-4 mb-5" style={{ maxWidth: "900px" }}>
      {/* Tabs */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn ${activeTab === "account" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("account")}
        >
          👤 Thông tin tài khoản
        </button>
        <button
          className={`btn ${activeTab === "bookings" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("bookings")}
        >
          🎟️ Lịch sử đặt vé
        </button>
      </div>

      {/* TAB 1: THÔNG TIN TÀI KHOẢN */}
      {activeTab === "account" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h3>Thông tin tài khoản</h3>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
            {/* THÔNG TIN CƠ BẢN */}
            <div className="mb-3">
              <label className="form-label fw-bold">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
              />
            </div>
            
            <hr className="my-4" />

            {/* MẬT KHẨU HIỆN TẠI (Luôn yêu cầu) */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mật khẩu hiện tại (Bắt buộc để lưu)</label>
              <div className="input-group">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại để xác nhận"
                  required // Thêm required
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  <EyeIcon visible={showCurrentPw} />
                </button>
              </div>
            </div>

            {/* VÙNG THAY ĐỔI MẬT KHẨU MỚI */}
            {!showPasswordFields ? (
              // Nút "Thay đổi mật khẩu"
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPasswordFields(true)}
                >
                  Thay đổi mật khẩu
                </button>
              </div>
            ) : (
              // Form đổi mật khẩu
              <div id="password-section">
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
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
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
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setShowPasswordFields(false)}
                >
                  Hủy đổi mật khẩu
                </button>
              </div>
            )}
            
            {/* NÚT LƯU CHUNG */}
            <div className="text-end mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* TAB 2: LỊCH SỬ ĐẶT VÉ */}
      {activeTab === "bookings" && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white">
            <h3>🎫 Lịch sử đặt vé</h3>
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
                Bạn chưa có vé nào. <a href="/">Hãy đặt vé ngay!</a>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Phim</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking: any, idx: number) => {
                      const datVeId = booking.dat_ve_id ?? null;
                      const details = datVeId ? bookingDetails.get(String(datVeId)) : null;
                      return (
                        <React.Fragment key={idx}>
                          <tr>
                            <td>
                              <span className="badge bg-primary">{booking.ma_don_hang}</span>
                            </td>
                            <td>
                              <strong>{booking.phim}</strong>
                            </td>
                            <td>{booking.ngay_dat}</td>
                            <td>
                              {(() => {
                                const st = getShowStatus(booking, details);
                                return <span className={`badge bg-${st.color}`}>{st.label}</span>;
                              })()}
                            </td>
                            <td>
                              <strong className="text-danger">{booking.tong_tien}</strong>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={async () => {
                                  if (!datVeId) {
                                    Swal.fire("Lỗi","Không có ID vé để lấy chi tiết","error");
                                    return;
                                  }
                                  const det = await fetchBookingDetails(String(datVeId));
                                  setSelectedBookingDetails(det || bookingDetails.get(String(datVeId)));
                                  setSelectedBookingId(String(datVeId));
                                  setShowDetailModal(true);
                                }}
                              >
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                          {details && (
                            <tr>
                              <td colSpan={6}>
                                <div className="p-3 bg-light border-top">
                                  <div className="row g-3">
                                    {details.chi_tiet && details.chi_tiet.length > 0 && (
                                      <div className="col-md-6">
                                        <h6 className="text-primary fw-bold mb-2">
                                          <i className="fa-solid fa-chair"></i> Ghế đã đặt
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                          {details.chi_tiet.map((chiTiet: any, i: number) => (
                                            <span
                                              key={i}
                                              className="badge bg-success"
                                              title={chiTiet.ghe?.loai_ghe?.ten_loai_ghe}
                                            >
                                              Ghế {chiTiet.ghe?.so_ghe}
                                              <br />
                                              <small>({chiTiet.ghe?.loai_ghe?.ten_loai_ghe})</small>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {details.do_an && details.do_an.length > 0 && (
                                      <div className="col-md-6">
                                        <h6 className="text-primary fw-bold mb-2">
                                          <i className="fa-solid fa-utensils"></i> Đồ ăn đã chọn
                                        </h6>
                                        <ul className="list-unstyled small">
                                          {details.do_an.map((food: any, i: number) => (
                                            <li key={i} className="mb-2 pb-2 border-bottom">
                                              <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                  <strong>{food.ten_do_an}</strong>
                                                  <br />
                                                  <span className="text-muted">Số lượng: {food.so_luong}</span>
                                                </div>
                                                <span className="badge bg-warning text-dark">
                                                  {food.gia_ban} đ
                                                </span>
                                              </div>
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

      {/* Modal chi tiết đơn hàng */}
      {showDetailModal && (
        <>
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết đơn {selectedBookingId}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {(() => {
                    const det = selectedBookingDetails || (selectedBookingId ? bookingDetails.get(selectedBookingId as string) : null);
                    if (!det) return <p>Đang tải chi tiết...</p>;

                    return (
                      <div>
                        <h5>{det.lich_chieu?.phim?.ten_phim || det.phim || 'Không rõ phim'}</h5>
                        <p>Phòng: {det.lich_chieu?.phong?.ten_phong || det.phong || 'Không rõ'}</p>
                        <p>Thời gian: {det.lich_chieu?.gio_chieu ? new Date(det.lich_chieu.gio_chieu).toLocaleString() : 'Không rõ'}</p>

                        {det.chi_tiet && det.chi_tiet.length > 0 && (
                          <div className="mb-3">
                            <h6>Ghế</h6>
                            <div className="d-flex flex-wrap gap-2">
                              {det.chi_tiet.map((ct: any, i: number) => (
                                <div key={i} className="p-2 border rounded">
                                  <div>Ghế: <strong>{ct.ghe?.so_ghe}</strong></div>
                                  <div>Loại: {ct.ghe?.loai_ghe?.ten_loai_ghe || '—'}</div>
                                  <div>Giá vé: {ct.gia ? ct.gia + ' đ' : '—'}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {det.do_an && det.do_an.length > 0 && (
                          <div>
                            <h6>Đồ ăn</h6>
                            <ul className="list-unstyled">
                              {det.do_an.map((f: any, i: number) => (
                                <li key={i} className="d-flex justify-content-between border-bottom py-2">
                                  <div>
                                    <strong>{f.ten_do_an}</strong>
                                    <div className="text-muted">Số lượng: {f.so_luong}</div>
                                  </div>
                                  <div>{f.gia_ban} đ</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <hr />
                        <div className="d-flex justify-content-between">
                          <div>Tổng tiền:</div>
                          <div><strong className="text-danger">{det.tong_tien || det.tong || '—'}</strong></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
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