import React, { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../component/Auth/AuthContext";
import { useUpdateUser } from "../../hook/UserHook";
import type { User } from "../../types/user"; // Import kiểu dữ liệu User

const MyAccountPage = () => {
  const { user, setUser } = useAuth(); // Lấy user và hàm cập nhật context
  const updateUserMutation = useUpdateUser(); // Lấy hook cập nhật

  // State cho form, lấy giá trị mặc định từ context
  const [ten, setTen] = useState(user?.ten || "");
  const [soDienThoai, setSoDienThoai] = useState(user?.so_dien_thoai || "");
  const [password, setPassword] = useState(""); // Luôn để trống khi load
  const [passwordConfirm, setPasswordConfirm] = useState("");

  if (!user) {
    return (
      <div className="container p-5 text-center">
        <h2>Vui lòng đăng nhập để xem thông tin.</h2>
        <a href="/dang-nhap">Đi đến trang đăng nhập</a>
      </div>
    );
  }

  // Hàm xử lý khi nhấn nút "Cập nhật"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra mật khẩu nếu có nhập
    if (password && password !== passwordConfirm) {
      Swal.fire("Lỗi!", "Mật khẩu xác nhận không khớp.", "error");
      return;
    }

    // 2. Chuẩn bị dữ liệu gửi đi
    const updatedValues: {
        ten: string;
        so_dien_thoai: string;
        password?: string;
      } = {
        ten: ten,
        so_dien_thoai: soDienThoai,
      };

    // 3. Chỉ thêm 'password' vào payload nếu người dùng đã nhập
    if (password) {
      updatedValues.password = password;
    }

    // 4. Gọi hook mutation
    updateUserMutation.mutate(
      { id: user.id, values: updatedValues },
      {
        onSuccess: (response) => {
          // 5. Lấy user mới nhất từ BE trả về
          const updatedUser = response.user as User;

          // 6. Cập nhật lại AuthContext (và localStorage)
          // Chúng ta cần kết hợp dữ liệu cũ (như token, permissions) với dữ liệu mới
          setUser({ ...user, ...updatedUser }); 

          Swal.fire("Thành công!", "Cập nhật thông tin thành công!", "success");
          setPassword(""); // Xóa trường mật khẩu
          setPasswordConfirm("");
        },
        onError: (error: any) => {
          Swal.fire(
            "Lỗi!",
            error.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại.",
            "error"
          );
        },
      }
    );
  };

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h3>Thông tin tài khoản</h3>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Họ và tên</label>
              <input
                type="text"
                className="form-control"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                disabled // Không cho sửa email
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
              />
            </div>
            
            <hr className="my-4" />

            <div className="mb-3">
              <label className="form-label fw-bold">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                placeholder="Bỏ trống nếu không muốn thay đổi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                disabled={!password} // Chỉ bật khi đã nhập mật khẩu
              />
            </div>
            <div className="text-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;