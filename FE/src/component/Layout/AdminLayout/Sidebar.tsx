import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useUserPermissions } from "../../../hook/useUserPermissions";

const MENU_IDS = {
  PHIM: 1,
  BANNER: 2,
  TAI_KHOAN: 3,
  PHONG_CHIEU: 4,
  DICH_VU: 5,
  LICH_CHIEU: 6,
  VOUCHER: 7,
  TIN_TUC: 8,
  THONG_KE: 9,
};

interface MenuItem {
  id: number;
  title: string;
  icon: string;
  path: string;
  color: string;
  children?: { title: string; path: string }[];
}

const MENU_CONFIG: MenuItem[] = [
  {
    id: MENU_IDS.PHIM,
    title: "Quản lý phim",
    icon: "solar:smart-speaker-minimalistic-line-duotone",
    path: "/admin/phim",
    color: "indigo",
    children: [
      { title: "Danh sách phim", path: "/admin/phim" },
      { title: "Quản lý thể loại", path: "/admin/the-loai" },
    ],
  },
  {
    id: MENU_IDS.BANNER,
    title: "Quản lý Banner",
    icon: "solar:smart-speaker-minimalistic-line-duotone",
    path: "/admin/banners",
    color: "indigo",
    children: [
      { title: "Danh sách banner", path: "/admin/banners" },
      { title: "Thêm mới banner", path: "/admin/banners/them-moi" },
    ],
  },
  {
    id: MENU_IDS.TAI_KHOAN,
    title: "Quản lý tài khoản",
    icon: "solar:user-circle-line-duotone",
    path: "/admin/nguoi-dung",
    color: "success",
    children: [
      { title: "Người dùng", path: "/admin/nguoi-dung" },
      { title: "Vai trò", path: "/admin/vai-tro" },
    ],
  },
  {
    id: MENU_IDS.PHONG_CHIEU,
    title: "Quản lý phòng chiếu",
    icon: "solar:pie-chart-3-line-duotone",
    path: "/admin/roomxb",
    color: "warning",
    children: [
      { title: "Phòng chiếu đã xuất bản", path: "/admin/roomxb" },
      { title: "Phòng chiếu chưa xuất bản", path: "/admin/roomcxb" },
      { title: "Thêm mới phòng chiếu", path: "/admin/room/them-moi" },
    ],
  },
  {
    id: MENU_IDS.DICH_VU,
    title: "Quản lý dịch vụ",
    icon: "solar:user-circle-line-duotone",
    path: "/admin/foods",
    color: "danger",
    children: [
      { title: "Quản lý đồ ăn", path: "/admin/foods" },
      { title: "Thêm mới đồ ăn", path: "/admin/foods/them-moi" },
      { title: "Quản lý menu", path: "/admin/menu" },
    ],
  },
  {
    id: MENU_IDS.LICH_CHIEU,
    title: "Quản lý lịch chiếu",
    icon: "solar:calendar-mark-line-duotone",
    path: "/admin/lich-chieu",
    color: "danger",
    children: [
      { title: "Danh sách lịch chiếu", path: "/admin/lich-chieu" },
      { title: "Thêm mới lịch chiếu", path: "/admin/lich-chieu/them-moi" },
    ],
  },
  {
    id: MENU_IDS.VOUCHER,
    title: "Quản lý voucher",
    icon: "solar:calendar-mark-line-duotone",
    path: "/admin/vouchers",
    color: "danger",
    children: [{ title: "Danh sách voucher", path: "/admin/vouchers" }],
  },
  {
    id: MENU_IDS.TIN_TUC,
    title: "Quản lý tin tức",
    icon: "solar:calendar-mark-line-duotone",
    path: "/admin/tin-tuc",
    color: "danger",
    children: [{ title: "Danh sách tin tức", path: "/admin/tin-tuc" }],
  },
  {
    id: MENU_IDS.THONG_KE,
    title: "Thống kê",
    icon: "solar:chart-square-line-duotone",
    path: "/admin/thongke",
    color: "primary",
    children: [
      { title: "Thống kê doanh thu", path: "thong-ke/doanh-thu" },
      { title: "Thống kê vé", path: "thong-ke/ve" },
    ],
  },
];

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const { canAccess } = useUserPermissions();

  return (
    <aside className="left-sidebar with-vertical">
      <div className="brand-logo d-flex align-items-center justify-content-between">
        <Link to="/admin/dashbroad" className="text-nowrap logo-img">
          <img
            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/logos/logo-light.svg"
            alt="Logo"
          />
        </Link>
      </div>

      <div className="scroll-sidebar" data-simplebar>
        <nav className="sidebar-nav">
          <ul id="sidebarnav" className="mb-0">
            <li className="nav-small-cap">
              <Icon
                icon="solar:menu-dots-bold-duotone"
                className="nav-small-cap-icon fs-5"
              />
              <span className="hide-menu">Home</span>
            </li>

            <li className="sidebar-item">
              <Link
                to="/admin/dashbroad"
                className="sidebar-link primary-hover-bg"
              >
                <span className="aside-icon p-2 bg-primary-subtle rounded-1">
                  <Icon icon="solar:screencast-2-line-duotone" className="fs-6" />
                </span>
                <span className="hide-menu ps-1">Dashboard</span>
              </Link>
            </li>

            {MENU_CONFIG.map((menu) => {
              if (!canAccess(menu.id, 4)) return null;
              const isOpen = openMenus[menu.id] || false;

              return (
                <li key={menu.id} className="sidebar-item">
                  <a
                    href="#"
                    className={`sidebar-link has-arrow ${menu.color}-hover-bg`}
                    aria-expanded={isOpen}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenus((prev) => ({
                        ...prev,
                        [menu.id]: !prev[menu.id],
                      }));
                    }}
                  >
                    <span
                      className={`aside-icon p-2 bg-${menu.color}-subtle rounded-1`}
                    >
                      <Icon icon={menu.icon} className="fs-6" />
                    </span>
                    <span className="hide-menu ps-1">{menu.title}</span>
                  </a>

                  <ul
                    aria-expanded={isOpen}
                    className={`collapse first-level ${isOpen ? "show" : ""}`}
                  >
                    {menu.children?.map((child, idx) => (
                      <li key={`${menu.id}-${idx}`} className="sidebar-item">
                        <Link to={child.path} className="sidebar-link">
                          <span className="hide-menu">{child.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
