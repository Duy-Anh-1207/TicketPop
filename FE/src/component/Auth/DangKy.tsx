import React, { useState } from "react";
import axios from "axios";

export default function DangKy() {
  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:8000/api/dang-ky", {
        ten,
        email,
        so_dien_thoai: soDienThoai,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.data.status) {
        setSuccess(response.data.message);

        // Xóa form
        setTen("");
        setEmail("");
        setSoDienThoai("");
        setPassword("");
        setPasswordConfirmation("");

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          window.location.href = "/dang-nhap";
        }, 2000);
      } else {
        setError(response.data.message || "Đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error.response?.data || error.message);
      setError("Có lỗi xảy ra khi đăng ký!");
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
        className="card shadow-lg p-4 border-0"
        style={{
          width: "420px",
          borderRadius: "1.25rem",
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <h3 className="text-center mb-4 text-primary fw-bold">
          🎟️ Đăng ký tài khoản
        </h3>

        {/* Thông báo lỗi / thành công */}
        {error && (
          <div className="alert alert-danger text-center py-2" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success text-center py-2" role="alert">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Họ và tên</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập họ và tên"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập số điện thoại"
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control"
              placeholder="Nhập lại mật khẩu"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold py-2 shadow-sm"
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            <small className="text-muted">
              Đã có tài khoản?{" "}
              <a href="/dang-nhap" className="text-primary fw-semibold">
                Đăng nhập
              </a>
              hoặc quay lại{" "}
              <a href="/" className="text-primary fw-semibold">
                Trang chủ
              </a>
              
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}
