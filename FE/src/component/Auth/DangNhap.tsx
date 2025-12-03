import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

type ApiLoginOK = {
  status: true;
  message: string;
  data: {
    id: number;
    ten: string;
    email: string;
    vai_tro: string;
    vai_tro_id?: number;
    can_access_admin?: boolean;
    token: string;
    redirect_url?: string;
    permissions: Array<{ menu_id: number; chuc_nang: string[] }>;
  };
};

type ApiFail = { status: false; message: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const LOGIN_URL = `${API_BASE}/api/dang-nhap`;
const RESEND_URL = `${API_BASE}/api/gui-lai-ma`;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [needVerify, setNeedVerify] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotStage, setForgotStage] = useState<"enter" | "verify">("enter");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Auto redirect nếu đã login
  useEffect(() => {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    if (u?.token) {
      const can = !!u?.can_access_admin || [1, 2].includes(u?.vai_tro_id);
      navigate(can ? "/admin" : "/", { replace: true });
    }
  }, [navigate]);

  const afterLogin = (payload: ApiLoginOK["data"]) => {
    axios.defaults.headers.common.Authorization = `Bearer ${payload.token}`;
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload));
    if (!remember) {
      sessionStorage.setItem("token", payload.token);
      sessionStorage.setItem("user", JSON.stringify(payload));
    }
    const can =
      payload.can_access_admin ?? [1, 2].includes(payload.vai_tro_id ?? -1);
    navigate(payload.redirect_url || (can ? "/admin" : "/"), { replace: true });
  };

  const handleLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNeedVerify(false);

    try {
      const res = await axios.post<ApiLoginOK | ApiFail>(LOGIN_URL, {
        email,
        password,
      });
      if ((res.data as ApiLoginOK).status) {
        const ok = res.data as ApiLoginOK;
        setSuccess(ok.message || "Đăng nhập thành công!");
        afterLogin(ok.data);
      } else {
        setError((res.data as ApiFail).message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không kết nối được máy chủ";
      setError(msg);
      if (msg.toLowerCase().includes("chưa được xác thực")) setNeedVerify(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(RESEND_URL, { email });
      setSuccess("Đã gửi lại mã xác thực. Vui lòng kiểm tra email!");
    } catch {
      setError("Gửi lại mã thất bại. Thử lại sau ít phút.");
    }
  };

  const from = (location.state as any)?.from ?? "/";

  return (
    <>
      <div
        className="min-vh-100 position-relative d-flex align-items-center justify-content-center p-3"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(59,130,246,0.6) 50%, rgba(147,51,234,0.7) 100%)",
          }}
        />

        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7 col-12">
              <div
                className="card border-0 shadow-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  borderRadius: "24px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <div className="card-body p-5 p-lg-6">
                  <div className="text-center mb-5">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-gradient text-white mb-4"
                      style={{
                        width: "80px",
                        height: "80px",
                        background: "linear-gradient(135deg, #f093fb, #f5576c)",
                      }}
                    >
                      <i className="fas fa-ticket-alt fa-2x"></i>
                    </div>
                    <h2 className="text-white fw-bold fs-1">TICKETPOP</h2>
                    <p className="text-white-50">
                      Đặt vé nhanh – Xem phim chất
                    </p>
                  </div>

                  {error && (
                    <div
                      className="alert alert-danger border-0 text-center"
                      role="alert"
                    >
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      className="alert alert-success border-0 text-center"
                      role="alert"
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleLogin} noValidate>
                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                        placeholder="nhap@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        style={{ borderRadius: "16px" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Mật khẩu
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type={showPw ? "text" : "password"}
                          className="form-control bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{ borderRadius: "16px 0 0 16px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-light border-white border-opacity-30"
                          onClick={() => setShowPw(!showPw)}
                          style={{ borderRadius: "0 16px 16px 0" }}
                        >
                          <i
                            className={`fas ${
                              showPw ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4 text-white">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="remember">
                          Nhớ đăng nhập
                        </label>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-white p-0 text-decoration-none"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(email);
                          setForgotMessage(null);
                        }}
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-danger btn-lg w-100 fw-bold text-uppercase shadow-lg"
                      style={{
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                        border: "none",
                      }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Đang đăng nhập...
                        </>
                      ) : (
                        "Đăng nhập ngay"
                      )}
                    </button>

                    {needVerify && (
                      <div className="text-center mt-4">
                        <button
                          type="button"
                          className="btn btn-link text-warning p-0"
                          onClick={handleResend}
                        >
                          Gửi lại mã xác thực email
                        </button>
                      </div>
                    )}

                    <div className="text-center mt-4 text-white">
                      <small>
                        Chưa có tài khoản?{" "}
                        <Link
                          to="/dang-ky"
                          className="text-warning fw-bold text-decoration-none"
                        >
                          Đăng ký ngay
                        </Link>
                        {" • "}
                        <Link
                          to={from}
                          className="text-white-50 text-decoration-none"
                        >
                          Trang chủ
                        </Link>
                      </small>
                    </div>
                  </form>
                </div>
              </div>

              <div className="text-center mt-4 text-white-50">
                <small>
                  © 2025 TICKETPOP - Đặt vé phim nhanh nhất Việt Nam
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`modal fade ${showForgotModal ? "show d-block" : ""}`}
        tabIndex={-1}
        style={{
          display: showForgotModal ? "block" : "none",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border-white border-opacity-25">
            <div className="modal-header border-0">
              <h5 className="modal-title">Quên mật khẩu</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowForgotModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {forgotMessage && (
                <div className="alert alert-info border-0">{forgotMessage}</div>
              )}

              {forgotStage === "enter" ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-white">Email đăng ký</label>
                    <input
                      type="email"
                      className="form-control bg-secondary bg-opacity-25 border-white border-opacity-25 text-white"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-25 border-white border-opacity-25 text-white"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      placeholder="0901234567"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label">Mã xác thực (6 số)</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-25 border-white border-opacity-25 text-white"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-control bg-secondary bg-opacity-25 border-white border-opacity-25 text-white"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      className="form-control bg-secondary bg-opacity-25 border-white border-opacity-25 text-white"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    />
                  </div>
                  {resetMessage && (
                    <div className="alert alert-info">{resetMessage}</div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForgotModal(false)}
              >
                Hủy
              </button>

              {forgotStage === "enter" ? (
                <button
                  type="button"
                  className="btn btn-warning"
                  disabled={forgotLoading}
                  onClick={async () => {
                    setForgotLoading(true);
                    setForgotMessage(null);
                    try {
                      const res = await axios.post(
                        `${API_BASE}/api/quen-mat-khau`,
                        {
                          email: forgotEmail,
                          so_dien_thoai: forgotPhone,
                        }
                      );
                      setForgotMessage(
                        res.data?.message || "Đã gửi mã xác thực vào email!"
                      );
                      setForgotStage("verify");
                    } catch (err: any) {
                      setForgotMessage(
                        err?.response?.data?.message || "Gửi thất bại"
                      );
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                >
                  {forgotLoading ? "Đang gửi..." : "Gửi mã"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={resetLoading}
                  onClick={async () => {
                    setResetLoading(true);
                    setResetMessage(null);
                    try {
                      const res = await axios.post(
                        `${API_BASE}/api/dat-lai-mat-khau`,
                        {
                          email: forgotEmail,
                          code: resetCode,
                          password: newPassword,
                          password_confirmation: newPasswordConfirm,
                        }
                      );
                      setResetMessage(
                        res.data?.message || "Đặt lại mật khẩu thành công!"
                      );
                      setTimeout(() => setShowForgotModal(false), 1500);
                    } catch (err: any) {
                      setResetMessage(
                        err?.response?.data?.message || "Đặt lại thất bại"
                      );
                    } finally {
                      setResetLoading(false);
                    }
                  }}
                >
                  {resetLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
