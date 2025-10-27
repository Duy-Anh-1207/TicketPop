import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/dang-nhap", {
        email,
        password,
      });

      if (response.data.status) {
        const user = response.data.data;

        // ✅ Lưu user vào localStorage
        localStorage.setItem("user", JSON.stringify(user));

        alert(response.data.message);

        // ✅ Phân quyền điều hướng
        if (user.vai_tro === "Admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert(response.data.message || "Đăng nhập thất bại!");
      }
    } catch (error: any) {
      console.error(error);
      alert("Tài khoản hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
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

        <form onSubmit={handleLogin}>
          {/* Email */}
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

          {/* Password */}
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

          {/* Nút đăng nhập */}
          <div className="d-grid mt-4">
            <button
              type="submit"
              className="btn btn-primary fw-semibold py-2"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

          {/* Liên kết đăng ký */}
          <div className="text-center mt-3">
            <small className="text-muted">
              Chưa có tài khoản?{" "}
              <Link to="/dang-ky" className="text-primary fw-semibold">
                Đăng ký ngay
              </Link>
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
