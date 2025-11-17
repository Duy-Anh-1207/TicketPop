import React, { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../component/Auth/AuthContext";
import { useUpdateUser } from "../../hook/UserHook";
import type { User } from "../../types/user";

// Icon con mắt (sử dụng Font Awesome đã import trong main.tsx)
const EyeIcon = ({ visible }: { visible: boolean }) => (
  <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
);

const MyAccountPage = () => {
  const { user, setUser } = useAuth();
  const updateUserMutation = useUpdateUser();

  // State cho thông tin chính
  const [ten, setTen] = useState(user?.ten || "");
  const [soDienThoai, setSoDienThoai] = useState(user?.so_dien_thoai || "");

  // State cho phần mật khẩu
  const [currentPassword, setCurrentPassword] = useState(""); // <-- Luôn hiển thị
  const [showPasswordFields, setShowPasswordFields] = useState(false); // <-- Chỉ toggle 2 trường mới
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  
  // State cho ẩn/hiện mật khẩu
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  if (!user) {
    return (
      <div className="container p-5 text-center">
        <h2>Vui lòng đăng nhập để xem thông tin.</h2>
        <a href="/dang-nhap">Đi đến trang đăng nhập</a>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mật khẩu hiện tại LÀ BẮT BUỘC cho BẤT KỲ thay đổi nào
    if (!currentPassword) {
      Swal.fire("Lỗi!", "Vui lòng nhập Mật khẩu hiện tại để xác nhận thay đổi.", "error");
      return;
    }

    // 2. Chuẩn bị payload (luôn có current_password)
    const updatedValues: {
      ten: string;
      so_dien_thoai: string;
      current_password: string;
      password?: string;
      password_confirmation?: string;
    } = {
      ten: ten,
      so_dien_thoai: soDienThoai,
      current_password: currentPassword,
    };

    // 3. Nếu người dùng đang MỞ form đổi mật khẩu, validate và thêm vào
    if (showPasswordFields) {
      if (!password || !passwordConfirm) {
        Swal.fire("Lỗi!", "Vui lòng nhập Mật khẩu mới và Xác nhận mật khẩu.", "error");
        return;
      }
      if (password !== passwordConfirm) {
        Swal.fire("Lỗi!", "Mật khẩu mới và xác nhận không khớp.", "error");
        return;
      }
      // Thêm vào payload
      updatedValues.password = password;
      updatedValues.password_confirmation = passwordConfirm;
    }

    // 4. Gọi hook mutation
    updateUserMutation.mutate(
      { id: user.id, values: updatedValues },
      {
        onSuccess: (response) => {
          const updatedUser = response.user as User;
          setUser({ ...user, ...updatedUser });

          Swal.fire("Thành công!", response.message || "Cập nhật thông tin thành công!", "success");
          
          // Reset form mật khẩu
          setShowPasswordFields(false);
          setCurrentPassword(""); // Quan trọng: Xóa mật khẩu hiện tại sau khi thành công
          setPassword("");
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
            {/* THÔNG TIN CƠ BẢN */}
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
                disabled
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

            {/* MẬT KHẨU HIỆN TẠI (Luôn yêu cầu) */}
            <div className="mb-3">
              <label className="form-label fw-bold">Mật khẩu hiện tại (Bắt buộc để lưu)</label>
              <div className="input-group">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại để xác nhận"
                  required // Thêm required
                />
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                >
                  <EyeIcon visible={showCurrentPw} />
                </button>
              </div>
            </div>

            {/* VÙNG THAY ĐỔI MẬT KHẨU MỚI */}
            {!showPasswordFields ? (
              // Nút "Thay đổi mật khẩu"
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPasswordFields(true)}
                >
                  Thay đổi mật khẩu
                </button>
              </div>
            ) : (
              // Form đổi mật khẩu
              <div id="password-section">
                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu mới</label>
                  <div className="input-group">
                    <input
                      type={showNewPw ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      <EyeIcon visible={showNewPw} />
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
                  <input
                    type={showNewPw ? "text" : "password"}
                    className="form-control"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => setShowPasswordFields(false)}
                >
                  Hủy đổi mật khẩu
                </button>
              </div>
            )}
            
            {/* NÚT LƯU CHUNG */}
            <div className="text-end mt-4">
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