import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function DangKyPage() {
  const navigate = useNavigate();

  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_BASE}/api/dang-ky`, {
        ten,
        email,
        so_dien_thoai: soDienThoai,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data.status) {
        setSuccess(
          res.data.message || "Đăng ký thành công! Đang chuyển hướng..."
        );
        setTimeout(() => {
          navigate(`/verify-code?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setError(res.data.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const msg =
          errors?.ten?.[0] ||
          errors?.email?.[0] ||
          errors?.so_dien_thoai?.[0] ||
          errors?.password?.[0] ||
          "Vui lòng kiểm tra lại thông tin";
        setError(msg);
      } else {
        setError(err.response?.data?.message || "Không kết nối được server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-vh-100 position-relative d-flex align-items-center justify-content-center p-3"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
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
                      Đăng ký để đặt vé nhanh hơn!
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

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                        placeholder="Nguyễn Văn A"
                        value={ten}
                        onChange={(e) => setTen(e.target.value)}
                        required
                        style={{ borderRadius: "16px" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderRadius: "16px" }}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                        placeholder="0901234567"
                        value={soDienThoai}
                        onChange={(e) => setSoDienThoai(e.target.value)}
                        required
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

                    <div className="mb-4">
                      <label className="form-label text-white fw-semibold">
                        Xác nhận mật khẩu
                      </label>
                      <div className="input-group input-group-lg">
                        <input
                          type={showPwConfirm ? "text" : "password"}
                          className="form-control bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75"
                          placeholder="••••••••"
                          value={passwordConfirmation}
                          onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                          }
                          required
                          style={{ borderRadius: "16px 0 0 16px" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-light border-white border-opacity-30"
                          onClick={() => setShowPwConfirm(!showPwConfirm)}
                          style={{ borderRadius: "0 16px 16px 0" }}
                        >
                          <i
                            className={`fas ${
                              showPwConfirm ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
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
                          Đang đăng ký...
                        </>
                      ) : (
                        "Đăng ký ngay"
                      )}
                    </button>

                    <div className="text-center mt-4 text-white">
                      <small>
                        Đã có tài khoản?{" "}
                        <Link
                          to="/dang-nhap"
                          className="text-warning fw-bold text-decoration-none"
                        >
                          Đăng nhập
                        </Link>
                        {" • "}
                        <Link
                          to="/"
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
    </>
  );
}
