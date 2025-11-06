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

  // Nếu đã có token thì tự vào trang phù hợp
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

    const can = payload.can_access_admin ?? [1, 2].includes(payload.vai_tro_id ?? -1);
    const fallback = can ? "/admin" : "/";
    navigate(payload.redirect_url || fallback, { replace: true });
  };

  const handleLogin: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setNeedVerify(false);

    try {
      const res = await axios.post<ApiLoginOK | ApiFail>(LOGIN_URL, { email, password });
      if ((res.data as ApiLoginOK).status) {
        const ok = res.data as ApiLoginOK;
        setSuccess(ok.message || "Đăng nhập thành công");
        afterLogin(ok.data);
      } else {
        const fail = res.data as ApiFail;
        setError(fail.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ||
        err?.message ||
        "Không kết nối được máy chủ";
      setError(msg);

      if (msg.toLowerCase().includes("chưa được xác thực")) {
        setNeedVerify(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await axios.post<{ message?: string }>(RESEND_URL, { email });
      setSuccess(res.data?.message || "Đã gửi lại mã xác thực. Kiểm tra email!");
      setNeedVerify(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể gửi lại mã. Thử lại sau.");
    }
  };

  const from = (location.state as any)?.from ?? "/";

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ background: "linear-gradient(135deg,#ffffff 0%,#6366F1 50%,#3B82F6 100%)" }}
    >
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ width: 420 }}>
        <h3 className="text-center text-primary fw-bold mb-3">🎟️ Đăng nhập</h3>
        <p className="text-center text-muted mb-4">
          Truy cập tài khoản để đặt vé và quản trị hệ thống.
        </p>

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

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Vui lòng nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <div className="input-group">
              <input
                type={showPw ? "text" : "password"}
                className="form-control"
                placeholder="Vui lòng nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPw((s) => !s)}
                aria-label="Toggle password"
              >
                {showPw ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input
                id="remember"
                className="form-check-input"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="remember">
                Nhớ đăng nhập
              </label>
            </div>
            <small className="text-muted">Quên mật khẩu?</small>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary fw-semibold py-2"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>

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
              <Link to="/dang-ky" className="text-primary fw-semibold">Đăng ký</Link>{" "}
              • quay lại{" "}
              <Link to={from} className="text-primary fw-semibold">Trang trước</Link>
            </small>
          </div>
        </form>
      </div>

      {/* CSS dành riêng cho placeholder trong LoginPage */}
      <style>
        {`
          ::placeholder {
            color: #9ca3af !important;
            font-weight: 400 !important;
          }
        `}
      </style>
    </div>
  );
}
