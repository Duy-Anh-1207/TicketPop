import React, { useState } from "react";
import { Icon } from "@iconify/react";

const Sidebar: React.FC = () => {
  const [isFrontPagesOpen, setIsFrontPagesOpen] = useState(false);
  const [isEcommerceOpen, setIsEcommerceOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  return (
    <aside className="left-sidebar with-vertical">
      <div className="brand-logo d-flex align-items-center justify-content-between">
        <a
          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/index.html"
          className="text-nowrap logo-img">
          <img
            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/logos/logo-light.svg"
            className="dark-logo" alt="Logo-Dark" />
        </a>
        <a
          href="#"
          className="sidebartoggler ms-auto text-decoration-none fs-5 d-block d-xl-none"
          onClick={(e) => e.preventDefault()}>
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
                <span className="hide-menu ps-1">Front Pages</span>
              </a>
              <ul
                aria-expanded={isFrontPagesOpen}
                className={`collapse first-level ${isFrontPagesOpen ? "show" : ""
                  }`}
              >
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-landingpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Homepage</span>
                  </a>
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
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-blogpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Blog</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-blogdetailpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Blog Details</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-contactpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Contact Us</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-portfoliopage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Portfolio</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/frontend-pricingpage.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Pricing</span>
                  </a>
                </li>
              </ul>
            </li>

            <li className="nav-small-cap">
              <Icon
                icon="solar:menu-dots-bold-duotone"
                className="nav-small-cap-icon fs-5"
              />
              <span className="hide-menu">Apps</span>
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
                <span className="hide-menu ps-1">Ecommerce</span>
              </a>
              <ul
                aria-expanded={isEcommerceOpen}
                className={`collapse first-level ${isEcommerceOpen ? "show" : ""
                  }`}
              >
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-shop.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Shop One</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-shop2.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Shop Two</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-shop-detail.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Details One</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-shop-detail2.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Details Two</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-product-list.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">List</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-checkout.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Checkout</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-add-product.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Add Product</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/eco-edit-product.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Edit Product</span>
                  </a>
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
                <span className="hide-menu ps-1">Blog</span>
              </a>
              <ul
                aria-expanded={isBlogOpen}
                className={`collapse first-level ${isBlogOpen ? "show" : ""}`}
              >
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/blog-posts.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Posts</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/blog-detail.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Details</span>
                  </a>
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
                <span className="hide-menu ps-1">User Profile</span>
              </a>
              <ul
                aria-expanded={isUserProfileOpen}
                className={`collapse first-level ${isUserProfileOpen ? "show" : ""
                  }`}
              >
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/page-user-profile.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Profile One</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a
                    href="https://bootstrapdemos.wrappixel.com/spike/dist/main/page-user-profile2.html"
                    className="sidebar-link"
                  >
                    <span className="sidebar-icon"></span>
                    <span className="hide-menu">Profile Two</span>
                  </a>
                </li>
              </ul>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link indigo-hover-bg"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-email.html"
                aria-expanded="false"
              >
                <span className="aside-icon p-2 bg-indigo-subtle rounded-1">
                  <Icon icon="solar:mailbox-line-duotone" className="fs-6" />
                </span>
                <span className="hide-menu ps-1">Email</span>
              </a>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link success-hover-bg"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-contact.html"
                aria-expanded="false"
              >
                <span className="aside-icon p-2 bg-success-subtle rounded-1">
                  <Icon icon="solar:phone-line-duotone" className="fs-6" />
                </span>
                <span className="hide-menu ps-1">Contact Table</span>
              </a>
            </li>

            <li className="sidebar-item">
              <a
                className="sidebar-link warning-hover-bg"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-contact2.html"
                aria-expanded="false"
              >
                <span className="aside-icon p-2 bg-warning-subtle rounded-1">
                  <Icon icon="solar:list-check-line-duotone" className="fs-6" />
                </span>
                <span className="hide-menu ps-1">Contact List</span>
              </a>
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
