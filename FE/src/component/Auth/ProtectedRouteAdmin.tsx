import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteAdminProps {
  children: React.ReactNode;
}

export default function ProtectedRouteAdmin({ children }: ProtectedRouteAdminProps) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ❌ Nếu chưa đăng nhập
  if (!user) {
    alert("Vui lòng đăng nhập để truy cập!");
    return <Navigate to="/dang-nhap" replace />;
  }

  // ❌ Nếu không phải Admin
  if (user.vai_tro !== "Admin") {
    alert("Bạn không có quyền truy cập vào khu vực quản trị!");
    return <Navigate to="/" replace />;
  }

  // ✅ Nếu là Admin
  return <>{children}</>;
}
