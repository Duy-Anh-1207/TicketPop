import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createUser } from "../../../provider/UserProviders";
import { getListVaiTro } from "../../../provider/VaiTroProvider";

export default function CreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ten: "",
    email: "",
    so_dien_thoai: "",
    password: "",
    anh_dai_dien: "",
    trang_thai: 1, // ✅ 1 = Đã kích hoạt mặc định
    vai_tro_id: "",
  });

  type Role = { id: number; ten_vai_tro: string };
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Lấy danh sách vai trò khi load trang
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getListVaiTro();
        const roleList = Array.isArray(res.data) ? res.data : res;
        setRoles(roleList);
        // Nếu chưa chọn vai trò, chọn mặc định là vai trò đầu tiên
        if (roleList && roleList.length > 0 && !formData.vai_tro_id) {
          setFormData((prev) => ({ ...prev, vai_tro_id: String(roleList[0].id) }));
        }
      } catch (error) {
        console.error("❌ Lỗi khi tải vai trò:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách vai trò", "error");
      }
    };
    fetchRoles();
  }, []);

  // 🔹 Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "trang_thai" ? Number(value) : value, // ✅ ép kiểu sang number
    }));
  };

  // 🔹 Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Client-side guard: vai_tro_id is required
    if (!formData.vai_tro_id) {
      setLoading(false);
      Swal.fire("❗ Thiếu vai trò", "Vui lòng chọn vai trò cho người dùng.", "warning");
      return;
    }

    try {
      const { ten, ...rest } = formData;

      const payload: any = {
        ...rest,
        ten,
        name: ten, 
        trang_thai: Number(formData.trang_thai), // ✅ đảm bảo gửi 0 hoặc 1
        vai_tro_id: Number(formData.vai_tro_id),
      };

      const res = await createUser(payload);

      Swal.fire({
        icon: "success",
        title: "🎉 Thành công!",
        text: res.message || "Tạo người dùng thành công!",
      });

      navigate("/admin/nguoi-dung");
    } catch (err: any) {
      console.error("❌ Lỗi tạo người dùng:", err);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: err.response?.data?.message || "Không thể tạo người dùng",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          ➕ Thêm Người Dùng Mới
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Họ tên */}
            <div className="mb-3">
              <label className="form-label fw-bold">Họ và tên</label>
              <input
                type="text"
                name="ten"
                className="form-control"
                placeholder="Nhập họ tên..."
                value={formData.ten}
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

            {/* Số điện thoại */}
            <div className="mb-3">
              <label className="form-label fw-bold">Số điện thoại</label>
              <input
                type="text"
                name="so_dien_thoai"
                className="form-control"
                placeholder="Nhập số điện thoại..."
                value={formData.so_dien_thoai}
                onChange={handleChange}
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

            {/* Ảnh đại diện */}
            <div className="mb-3">
              <label className="form-label fw-bold">Ảnh đại diện (URL)</label>
              <input
                type="text"
                name="anh_dai_dien"
                className="form-control"
                placeholder="Nhập đường dẫn ảnh..."
                value={formData.anh_dai_dien}
                onChange={handleChange}
              />
            </div>

            {/* Vai trò */}
            <div className="mb-3">
              <label className="form-label fw-bold">Vai trò</label>
              <select
                name="vai_tro_id"
                className="form-select"
                value={formData.vai_tro_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.ten_vai_tro}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải...</option>
                )}
              </select>
            </div>

            {/* Trạng thái */}
            <div className="mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <select
                name="trang_thai"
                className="form-select"
                value={formData.trang_thai}
                onChange={handleChange}
              >
                <option value={1}>Đã kích hoạt</option>
                <option value={0}>Ngừng kích hoạt</option>
              </select>
            </div>

            {/* Nút hành động */}
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Quay lại
              </button>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "⏳ Đang lưu..." : "Lưu người dùng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
