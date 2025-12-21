import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useUserPermissions } from "../../../hook/useUserPermissions";
import axios from "axios";
import logo from "/src/assets/logo.png";
import "./Sidebar.css";


interface MenuItem {
  id: number;
  ma_chuc_nang: string;
  ma_cha: string | null;
  ten_chuc_nang: string;
  icon: string;
  path: string;
  color: string;
  trang_thai: boolean;
}

interface MenuGroup {
  id: number;
  ma_chuc_nang: string;
  ten_chuc_nang: string;
  icon: string;
  path: string;
  color: string;
  trang_thai: boolean;
  children: MenuItem[];
}

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [menus, setMenus] = useState<MenuGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { canAccess } = useUserPermissions();



  // Fetch menu từ API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        // VITE_API_URL trong .env có dạng: http://127.0.0.1:8000/api
        const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
        const response = await axios.get(`${apiBase}/menu`);

        let allMenus: MenuItem[] = response.data;

        // Lấy user từ localStorage
        const user = JSON.parse(localStorage.getItem('user') || 'null');

        // Nếu là Staff (vai_tro_id !== 1), lọc menu từ bảng quyen_truy_cap
        if (user && user.vai_tro_id !== 1) {
          try {
            const permResponse = await axios.get(`${apiBase}/quyen-truy-cap`);
            const allPerms = permResponse.data.data || [];

            // Lấy danh sách menu_id mà user này được phép xem
            const allowedMenuIds = allPerms
              .filter((perm: any) => perm.vai_tro_id === user.vai_tro_id)
              .map((perm: any) => perm.menu_id);

            // Lọc menu: chỉ giữ lại những menu user có quyền
            allMenus = allMenus.filter((menu) => allowedMenuIds.includes(menu.id));
          } catch (error) {
            console.error('Lỗi fetch quyền truy cập:', error);
            allMenus = [];
          }
        }

        // Lọc menu cha (ma_cha = null) và đang hoạt động
        const parentMenus = allMenus.filter((menu) => !menu.ma_cha && menu.trang_thai);

        // Nhóm menu con theo ma_cha
        const groupedMenus: MenuGroup[] = parentMenus.map((parent) => {
          const childMenus = allMenus.filter(
            (child) => child.ma_cha === parent.ma_chuc_nang && child.trang_thai
          );

          return {
            id: parent.id,
            ma_chuc_nang: parent.ma_chuc_nang,
            ten_chuc_nang: parent.ten_chuc_nang,
            icon: parent.icon || 'solar:menu-dots-bold-duotone',
            path: parent.path || '#',
            color: parent.color || 'primary',
            trang_thai: parent.trang_thai,
            children: childMenus
          };
        });

        setMenus(groupedMenus);
      } catch (error) {
        console.error('Lỗi fetch menu:', error);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const toggleMenu = (maChucNang: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [maChucNang]: !prev[maChucNang],
    }));
  };

  return (
    <aside className="left-sidebar with-vertical">
      {/* LOGO */}
      <div className="brand-logo">
        <Link to="/" className="logo-img">
          <img
            src={logo}
            alt="Logo"
            style={{
              height: "120px",
              width: "100%",
              objectFit: "contain",
            }}
          />
        </Link>
      </div>

      {/* MENU */}
      <div className="scroll-sidebar">
        <nav className="sidebar-nav">
          <ul id="sidebarnav">
            {loading ? (
              <li className="sidebar-item">
                <p className="p-3">Đang tải menu...</p>
              </li>
            ) : menus.length === 0 ? (
              <li className="sidebar-item">
                <p className="p-3">Không có menu nào</p>
              </li>
            ) : (
              menus.map((menu) => {
                if (!canAccess(menu.id, 4)) return null;

                const isOpen = openMenus[menu.ma_chuc_nang] || false;
                const hasChildren = menu.children.length > 0;

                return (
                  <li key={menu.ma_chuc_nang} className="sidebar-item">
                    {/* MENU CHA */}
                    {hasChildren ? (
                      <a
                        href="#"
                        className="sidebar-link has-arrow"
                        aria-expanded={isOpen}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMenu(menu.ma_chuc_nang);
                        }}
                      >
                        <span className="aside-icon">
                          <Icon icon={menu.icon} />
                        </span>
                        <span className="hide-menu">{menu.ten_chuc_nang}</span>
                      </a>
                    ) : (
                      <Link to={menu.path} className="sidebar-link">
                        <span className="aside-icon">
                          <Icon icon={menu.icon} />
                        </span>
                        <span className="hide-menu">{menu.ten_chuc_nang}</span>
                      </Link>
                    )}

                    {/* MENU CON */}
                    {hasChildren && (
                      <ul
                        className={`first-level collapse ${isOpen ? "show" : ""}`}
                      >
                        {menu.children.map((child) =>
                          canAccess(child.id, 4) ? (
                            <li key={child.ma_chuc_nang} className="sidebar-item">
                              <Link to={child.path} className="sidebar-link">
                                <span className="aside-icon">
                                  <Icon icon={child.icon || "solar:dot-circle-bold"} />
                                </span>
                                <span className="hide-menu">
                                  {child.ten_chuc_nang}
                                </span>
                              </Link>
                            </li>
                          ) : null
                        )}
                      </ul>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );

};
export default Sidebar;
