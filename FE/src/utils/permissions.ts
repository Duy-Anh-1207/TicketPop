// src/utils/permissions.ts
import type { PermissionItem } from "../types/Auth";

/**
 * Lấy permissions từ localStorage
 */
export function getUserPermissions(): PermissionItem[] {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed?.permissions ?? [];
  } catch (err) {
    return [];
  }
}

/**
 * Kiểm tra user có quyền theo menu_id và action (số)
 * action: 1=Thêm,2=Sửa,3=Xóa,4=Xem
 */
export function canAccess(menuId: number, action: number): boolean {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return false;
    const user = JSON.parse(raw);
    // Nếu là admin thì luôn có quyền
    if (user?.vai_tro_id === 1) return true;
    const perms = user?.permissions ?? [];
    // Debug: log ra permissions để kiểm tra
    console.log('DEBUG canAccess:', { menuId, action, perms });
    const p = perms.find((x: any) => Number(x.menu_id) === Number(menuId));
    if (!p) {
      console.warn('Không tìm thấy quyền cho menuId:', menuId);
      return false;
    }
    const has = p.chuc_nang.map(String).includes(String(action));
    if (!has) {
      console.warn('Không có quyền action:', action, 'cho menuId:', menuId, 'chuc_nang:', p.chuc_nang);
    }
    return has;
  } catch (err) {
    console.error('Lỗi canAccess:', err);
    return false;
  }
}

/**
 * Kiểm tra user có ít nhất 1 trong mảng action cho menu
 */
export function canAccessAny(menuId: number, actions: number[]): boolean {
  return actions.some((a) => canAccess(menuId, a));
}
