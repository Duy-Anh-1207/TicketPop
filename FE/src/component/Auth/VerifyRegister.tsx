import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function VerifyRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ query string
  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus("idle");

    try {
      const res = await axios.post(`${API_BASE}/api/xac-thuc-email`, {
        email,
        code,
      });

      setMessage(res.data.message || "Xác thực email thành công!");
      setStatus("success");

      setTimeout(() => {
        navigate("/dang-nhap");
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Mã xác thực không đúng hoặc đã hết hạn!";
      setMessage(msg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage("Vui lòng nhập email để gửi lại mã.");
      setStatus("error");
      return;
    }

    setResendLoading(true);
    setMessage("");
    setStatus("idle");

    try {
      await axios.post(`${API_BASE}/api/gui-lai-ma`, { email });
      setMessage("Đã gửi lại mã xác thực. Vui lòng kiểm tra email!");
      setStatus("success");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Gửi lại mã thất bại. Thử lại sau!"
      );
      setStatus("error");
    } finally {
      setResendLoading(false);
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
                      <i className="fas fa-envelope-open-text fa-2x"></i>
                    </div>
                    <h2 className="text-white fw-bold fs-1">Xác thực Email</h2>
                    <p className="text-white-50">
                      Nhập mã 6 số chúng tôi đã gửi đến email của bạn
                    </p>
                  </div>

                  {message && (
                    <div
                      className={`alert border-0 text-center ${
                        status === "success" ? "alert-success" : "alert-danger"
                      }`}
                      role="alert"
                    >
                      <i
                        className={`fas me-2 ${
                          status === "success"
                            ? "fa-check-circle"
                            : "fa-exclamation-triangle"
                        }`}
                      ></i>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleVerify} noValidate>
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
                        Mã xác thực (6 số)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        className="form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-white placeholder-opacity-75 text-center fs-3 fw-bold tracking-widest"
                        placeholder="••••••"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        required
                        style={{
                          borderRadius: "16px",
                          letterSpacing: "0.5rem",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || code.length !== 6}
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
                          Đang xác thực...
                        </>
                      ) : (
                        "Xác thực ngay"
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="btn btn-link text-warning p-0 text-decoration-none"
                      onClick={handleResend}
                      disabled={resendLoading}
                    >
                      {resendLoading
                        ? "Đang gửi lại..."
                        : "Gửi lại mã xác thực"}
                    </button>
                  </div>

                  <div className="text-center mt-4 text-white">
                    <small>
                      <Link
                        to="/dang-nhap"
                        className="text-white-50 text-decoration-none"
                      >
                        ← Quay lại đăng nhập
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
