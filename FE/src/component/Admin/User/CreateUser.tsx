import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../types/User";
import Swal from "sweetalert2";
import { createUser } from "../../provider/UserProviders";

export default function CreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<
    Omit<User, "id" | "created_at" | "updated_at"> & { password: string }
  >({
    name: "",
    email: "",
    role: "user",
    is_active: 1,
    email_verified_at: null,
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "is_active" ? Number(value) : value,
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        email_verified_at: formData.email_verified_at ?? undefined, 
      });

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: res.message ,
      });

      navigate("/admin/nguoi-dung");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "❌ Lỗi!",
        text:
          err.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Thêm Người Dùng Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div className="mb-3">
              <label className="form-label fw-bold">Họ và tên</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Nhập họ tên..."
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Nhập email..."
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Mật khẩu */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mật khẩu</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Nhập mật khẩu..."
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Vai trò */}
            <div className="mb-3">
              <label className="form-label fw-bold">Vai trò</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <select
                name="is_active"
                className="form-select"
                value={formData.is_active}
                onChange={handleChange}
              >
                <option value={1}>✅ Hoạt động</option>
                <option value={0}>⛔ Khóa</option>
              </select>
            </div>

            {/* Nút hành động */}
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Quay lại
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "⏳ Đang lưu..." : "Lưu người dùng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
