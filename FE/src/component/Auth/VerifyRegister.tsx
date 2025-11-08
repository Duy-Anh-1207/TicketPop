import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";

export default function VerifyRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  // lấy email từ query ?email=...
  const params = new URLSearchParams(location.search);
  const emailFromQuery = params.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // nếu truy cập thẳng mà không có email thì để trống cho người dùng nhập
  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus("idle");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/xac-thuc-email", {
        email,
        code,
      });

      setMessage(res.data.message || "Xác thực email thành công!");
      setStatus("success");

      // chuyển về đăng nhập sau 1.2s
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Mã xác thực không đúng hoặc đã hết hạn!";
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
      const res = await axios.post("http://127.0.0.1:8000/api/gui-lai-ma", {
        email,
      });
      setMessage(res.data.message || "Đã gửi lại mã xác thực. Kiểm tra email!");
      setStatus("success");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Không gửi lại được mã xác thực. Thử lại!";
      setMessage(msg);
      setStatus("error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #6366F1 50%, #3B82F6 100%)",
      }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ width: "420px", backgroundColor: "#fff" }}
      >
        <h3 className="text-center text-primary fw-bold mb-3">
          ✅ Xác thực tài khoản
        </h3>
        <p className="text-center text-muted mb-4">
          Chúng tôi đã gửi mã xác thực tới email của bạn.
          <br />
          Vui lòng nhập lại để hoàn tất đăng ký.
        </p>

        {/* Thông báo */}
        {message && (
          <div
            className={`alert ${
              status === "success" ? "alert-success" : "alert-danger"
            } py-2`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email bạn đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mã xác thực</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập mã 6 số trong email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold py-2"
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "Xác thực ngay"}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? "Đang gửi lại..." : "Chưa nhận được mã? Gửi lại"}
          </button>
        </div>

        <div className="text-center mt-1">
          <small className="text-muted">
            <Link to="/dang-nhap" className="text-primary fw-semibold">
              Quay lại đăng nhập
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
