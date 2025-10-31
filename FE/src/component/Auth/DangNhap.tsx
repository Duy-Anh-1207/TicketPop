import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needVerify, setNeedVerify] = useState(false); // để hiện nút gửi lại mã

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNeedVerify(false);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/dang-nhap", {
        email,
        password,
      });

      if (response.data.status) {
        const user = response.data.data;

        // Lưu token và user vào localStorage
        localStorage.setItem("token", user.token);
        localStorage.setItem("user", JSON.stringify(user));

        setSuccess("Đăng nhập thành công!");

        // Điều hướng theo vai trò
        if (user.vai_tro === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(response.data.message || "Đăng nhập thất bại!");
      }
    } catch (err: any) {
      console.error(err);
      const res = err.response;

      if (res) {
        // backend Laravel của bạn trả message như này
        if (res.status === 403) {
          // có thể là: tài khoản bị khóa HOẶC chưa xác thực
          const msg =
            res.data?.message ||
            "Không thể đăng nhập. Tài khoản bị khóa hoặc chưa xác thực.";
          setError(msg);

          // nếu đúng message chưa xác thực thì bật nút gửi lại
          if (
            msg.toLowerCase().includes("chưa được xác thực") ||
            msg.toLowerCase().includes("xac thuc")
          ) {
            setNeedVerify(true);
          }
        } else if (res.status === 401) {
          setError(res.data?.message || "Email hoặc mật khẩu không đúng!");
        } else if (res.status === 422) {
          // lỗi validate
          const firstError =
            res.data?.errors?.email?.[0] ||
            res.data?.errors?.password?.[0] ||
            "Dữ liệu không hợp lệ!";
          setError(firstError);
        } else {
          setError("Có lỗi xảy ra, vui lòng thử lại!");
        }
      } else {
        setError("Không kết nối được tới server!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại mã xác thực
  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/gui-lai-ma", {
        email,
      });
      setSuccess(res.data?.message || "Đã gửi lại mã xác thực. Kiểm tra email!");
      setNeedVerify(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Không gửi lại được mã xác thực. Thử lại sau!";
      setError(msg);
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
        style={{ width: "400px", backgroundColor: "#fff" }}
      >
        <h3 className="text-center text-primary fw-bold mb-4">
          🎟️ Đăng nhập tài khoản
        </h3>

        {/* Thông báo */}
        {error && (
          <div className="alert alert-danger py-2 text-center" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success py-2 text-center" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn btn-primary fw-semibold py-2"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          {/* Nút gửi lại mã */}
          {needVerify && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-danger p-0"
                onClick={handleResend}
              >
                Email chưa xác thực? Gửi lại mã
              </button>
            </div>
          )}

          <div className="text-center mt-3">
            <small className="text-muted">
              Chưa có tài khoản?{" "}
              <Link to="/dang-ky" className="text-primary fw-semibold">
                Đăng ký ngay
              </Link>{" "}
              hoặc quay lại{" "}
              <Link to="/" className="text-primary fw-semibold">
                Trang chủ
              </Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
