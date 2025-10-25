import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
  const [isFrontPagesOpen, setIsFrontPagesOpen] = useState(false);
  const [isEcommerceOpen, setIsEcommerceOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isLichChieuOpen, setIsLichChieuOpen] = useState(false);
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [isTinTucOpen, setIsTinTucOpen] = useState(false);

  return (
    <aside className="left-sidebar with-vertical">
      <div className="brand-logo d-flex align-items-center justify-content-between">
        <a
          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/index.html"
          className="text-nowrap logo-img"
        >
          <img
            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/logos/logo-light.svg"
            className="dark-logo"
            alt="Logo-Dark"
          />
        </a>
        <a
          href="#"
          className="sidebartoggler ms-auto text-decoration-none fs-5 d-block d-xl-none"
          onClick={(e) => e.preventDefault()}
        >
          <i className="ti ti-x"></i>
        </a>
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
              <a
                className="sidebar-link primary-hover-bg"
                href="#"
                id="get-url"
                aria-expanded="false"
              >
                <span className="aside-icon p-2 bg-primary-subtle rounded-1">
                  <Icon
                    icon="solar:screencast-2-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Dashboard</span>
              </a>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow indigo-hover-bg"
                href="#"
                aria-expanded={isFrontPagesOpen}
                onClick={() => setIsFrontPagesOpen(!isFrontPagesOpen)}
              >
                <span className="aside-icon p-2 bg-indigo-subtle rounded-1">
                  <Icon
                    icon="solar:smart-speaker-minimalistic-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý phim</span>
              </a>
              <ul
                aria-expanded={isFrontPagesOpen}
                className={`collapse first-level ${
                  isFrontPagesOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/phim" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Quản lý phim</span>
                  </Link>
                </li>

                <li className="sidebar-item">
                  <Link to="/admin/the-loai" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Quản lý thể loại</span>
                  </Link>
                </li>

                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-aboutpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">About Us</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow success-hover-bg"
                href="#"
                aria-expanded={isEcommerceOpen}
                onClick={() => setIsEcommerceOpen(!isEcommerceOpen)}
              >
                <span className="aside-icon p-2 bg-success-subtle rounded-1">
                  <Icon
                    icon="solar:smart-speaker-minimalistic-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý tài khoản</span>
              </a>
              <ul
                aria-expanded={isEcommerceOpen}
                className={`collapse first-level ${
                  isEcommerceOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/nguoi-dung" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Người dùng</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link to="/admin/vai-tro" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Vai trò</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow warning-hover-bg"
                href="#"
                aria-expanded={isBlogOpen}
                onClick={() => setIsBlogOpen(!isBlogOpen)}
              >
                <span className="aside-icon p-2 bg-warning-subtle rounded-1">
                  <Icon
                    icon="solar:pie-chart-3-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý phòng chiếu</span>
              </a>
              <ul
                aria-expanded={isBlogOpen}
                className={`collapse first-level ${isBlogOpen ? "show" : ""}`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/roomxb" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Phòng chiếu đã xuất bản</span>
                  </Link>
                </li>

                <li className="sidebar-item">
                  <Link to="/admin/roomcxb" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Phòng chiếu chưa xuất bản</span>
                  </Link>
                </li>

                <li className="sidebar-item">
                  <Link to="/admin/room/them-moi" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Thêm mới phòng chiếu</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow danger-hover-bg"
                href="#"
                aria-expanded={isUserProfileOpen}
                onClick={() => setIsUserProfileOpen(!isUserProfileOpen)}
              >
                <span className="aside-icon p-2 bg-danger-subtle rounded-1">
                  <Icon
                    icon="solar:user-circle-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý dịch vụ</span>
              </a>
              <ul
                aria-expanded={isUserProfileOpen}
                className={`collapse first-level ${
                  isUserProfileOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/foods" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Quản lý đồ ăn</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link to="/admin/foods/them-moi" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Thêm mới đồ ăn</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow danger-hover-bg"
                href="#"
                aria-expanded={isLichChieuOpen}
                onClick={() => setIsLichChieuOpen(!isLichChieuOpen)}
              >
                <span className="aside-icon p-2 bg-danger-subtle rounded-1">
                  <Icon
                    icon="solar:calendar-mark-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý lịch chiếu</span>
              </a>
              <ul
                aria-expanded={isLichChieuOpen}
                className={`collapse first-level ${
                  isLichChieuOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/lich-chieu" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Danh sách lịch chiếu</span>
                  </Link>
                </li>
                <li className="sidebar-item">
                  <Link
                    to="/admin/lich-chieu/them-moi"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Thêm mới lịch chiếu</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow danger-hover-bg"
                href="#"
                aria-expanded={isVoucherOpen}
                onClick={() => setIsVoucherOpen(!isVoucherOpen)}
              >
                <span className="aside-icon p-2 bg-danger-subtle rounded-1">
                  <Icon
                    icon="solar:calendar-mark-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý voucher</span>
              </a>
              <ul
                aria-expanded={isVoucherOpen}
                className={`collapse first-level ${
                  isVoucherOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/vouchers" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Danh sách voucher</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link has-arrow danger-hover-bg"
                href="#"
                aria-expanded={isTinTucOpen}
                onClick={() => setIsTinTucOpen(!isTinTucOpen)}
              >
                <span className="aside-icon p-2 bg-danger-subtle rounded-1">
                  <Icon
                    icon="solar:calendar-mark-line-duotone"
                    className="fs-6"
                  />
                </span>
                <span className="hide-menu ps-1">Quản lý tin tức</span>
              </a>
              <ul
                aria-expanded={isTinTucOpen}
                className={`collapse first-level ${
                  isTinTucOpen ? "show" : ""
                }`}
              >
                <li className="sidebar-item">
                  <Link to="/admin/tin-tuc" className="sidebar-link">
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Danh sách tin tức</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <div className="fixed-profile mx-3 mt-3">
        <div className="card bg-primary-subtle mb-0 shadow-none">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <img
                  src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-1.jpg"
                  width="45"
                  height="45"
                  className="img-fluid rounded-circle"
                  alt="spike-img"
                />
                <div>
                  <h5 className="mb-1">Mike</h5>
                  <p className="mb-0">Admin</p>
                </div>
              </div>
              <a
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/authentication-login.html"
                className="position-relative"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                data-bs-title="Logout"
              >
                <Icon icon="solar:logout-line-duotone" className="fs-8" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
