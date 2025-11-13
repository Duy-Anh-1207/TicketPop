import { useEffect, useState } from 'react';
import axios from 'axios';

export interface Permission {
  menuId: number;
  permissions: number[];
}

export function useUserPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      setLoading(false);
      return;
    }

    // Nếu là admin, có tất cả quyền
    if (user.vai_tro_id === 1) {
      axios.get('http://127.0.0.1:8000/api/menu')
        .then(res => {
          const adminPerms = res.data.map((menu: any) => ({
            menuId: menu.id,
            permissions: [1, 2, 3, 4] // Tất cả quyền
          }));
          setPermissions(adminPerms);
          setLoading(false);
        })
        .catch(err => {
          console.error('Lỗi khi load menu:', err);
          setLoading(false);
        });
      return;
    }

    // Nếu là nhân viên, lấy quyền từ API
    axios.get('http://127.0.0.1:8000/api/quyen-truy-cap')
      .then(res => {
        const allPerms = res.data.data;
        const userPerms = allPerms.filter(
          (item: any) => item.vai_tro_id === user.vai_tro_id
        );
        setPermissions(
          userPerms.map((item: any) => ({
            menuId: item.menu_id,
            permissions: item.function.map(Number)
          }))
        );
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi load quyền:', err);
        setLoading(false);
      });
  }, []);

  // Hàm kiểm tra quyền
  const canAccess = (menuId: number, permission: number) => {
    if (loading) return false;
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return false;
    
    // Admin có tất cả quyền
    if (user.vai_tro_id === 1) return true;

    const menuPerms = permissions.find(p => p.menuId === menuId);
    return menuPerms?.permissions.includes(permission) || false;
  };

  return { permissions, loading, canAccess };
}