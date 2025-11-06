import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { canAccess } from "../../utils/permissions";

interface ProtectedRouteAdminProps {
  children: React.ReactNode;
  menuId?: number;       // id menu trong DB (menu_id backend). optional: nếu không truyền, chỉ check quyền vào admin chung
  action?: number;      // 1=Thêm, 2=Sửa, 3=Xóa, 4=Xem (default = 4)
}

type UserPayload = {
  token: string;
  vai_tro?: string;
  vai_tro_id?: number;
  can_access_admin?: boolean;
  permissions?: {
    menu_id: number;
    chuc_nang: string[];
  }[];
};

function getUser(): UserPayload | null {
  const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ProtectedRouteAdmin({
  children,
  menuId,
  action = 4, // mặc định là quyền xem
}: ProtectedRouteAdminProps) {
  const location = useLocation();
  const user = getUser();

  // ✅ Chưa đăng nhập
  if (!user?.token) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  // ✅ Kiểm tra quyền vào admin (cấp cao nhất, chỉ check 1 lần)
  const canAccessAdmin = user.can_access_admin === true || Number(user.vai_tro_id) === 1;

  if (!canAccessAdmin) {
    return <Navigate to="/" replace />;
  }


  // Nếu là admin thì luôn cho phép truy cập mọi menu/action
  if (Number(user.vai_tro_id) === 1) {
    return <>{children}</>;
  }

  // Nếu không cung cấp menuId (ví dụ wrapper /admin), chỉ check quyền vào admin chung
  if (typeof menuId === 'undefined' || menuId === null) {
    return <>{children}</>;
  }

  // Nếu là nhân viên thì kiểm tra quyền chi tiết
  const hasPermission = canAccess(menuId, action);
  if (!hasPermission) {
    return <Navigate to="/admin/403" replace />;
  }

  return <>{children}</>;
}
