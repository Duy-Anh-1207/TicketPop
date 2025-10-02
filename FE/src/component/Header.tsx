import React, { useState } from "react";
// import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const Header: React.FC = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleNavbar = () => setIsNavbarOpen(!isNavbarOpen);
  const toggleMobileNav = () => setIsMobileNavOpen(!isMobileNavOpen);

  return (
    <header className="topbar sticky-top">
      <div className="with-vertical">
        <nav className="navbar navbar-expand-lg p-0">
          <ul className="navbar-nav quick-links d-none d-lg-flex align-items-center">
            <li className="nav-item dropdown-hover d-none d-lg-block me-2">
              <a
                className="nav-link"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-chat.html"
              >
                Chat
              </a>
            </li>
            <li className="nav-item dropdown-hover d-none d-lg-block me-2">
              <a
                className="nav-link"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-calendar.html"
              >
                Calendar
              </a>
            </li>
            <li className="nav-item dropdown-hover d-none d-lg-block">
              <a
                className="nav-link"
                href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-email.html"
              >
                Email
              </a>
            </li>
          </ul>
          <a
            className="navbar-toggler p-0 border-0"
            onClick={toggleNavbar}
            aria-controls="navbarNav"
            aria-expanded={isNavbarOpen}
            aria-label="Toggle navigation"
          >
            <span className="p-2">
              <i className="ti ti-dots fs-7"></i>
            </span>
          </a>
          <div
            className={`collapse navbar-collapse justify-content-end ${
              isNavbarOpen ? "show" : ""
            }`}
            id="navbarNav"
          >
            <div className="d-flex align-items-center justify-content-between">
              <a
                href="#"
                className="nav-link d-flex d-lg-none align-items-center justify-content-center"
                onClick={toggleMobileNav}
              >
                <div className="nav-icon-hover-bg rounded-circle">
                  <i className="ti ti-align-justified fs-7"></i>
                </div>
              </a>
              <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
                <li className="nav-item dropdown nav-icon-hover-bg rounded-circle d-flex d-lg-none">
                  <a
                    className="nav-link position-relative"
                    href="#"
                    aria-expanded="false"
                  >
                    <Icon icon="solar:magnifer-linear" className="fs-7" />
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop3"
                  >
                    <div className="modal-header border-bottom p-3">
                      <input
                        type="search"
                        className="form-control fs-3"
                        placeholder="Try to searching ..."
                      />
                    </div>
                    <div className="message-body p-3" data-simplebar>
                      <h5 className="mb-0 fs-5 p-1">Quick Page Links</h5>
                      <ul className="list mb-0 py-2">
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Modern</span>
                            <span className="fs-3 text-muted d-block">
                              /dashboards/dashboard1
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Dashboard</span>
                            <span className="fs-3 text-muted d-block">
                              /dashboards/dashboard2
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Contacts</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/contacts
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Posts</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/blog/posts
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Detail</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Shop</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/ecommerce/shop
                            </span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown d-none d-lg-block">
                  <a
                    className="nav-link position-relative shadow-none"
                    href="#"
                    aria-expanded="false"
                  >
                    <form className="nav-link position-relative shadow-none">
                      <input
                        type="text"
                        className="form-control rounded-3 py-2 ps-5 text-dark"
                        placeholder="Try to searching ..."
                      />
                      <Icon
                        icon="solar:magnifer-linear"
                        className="text-dark position-absolute top-50 start-0 translate-middle-y text-dark ms-3"
                      />
                    </form>
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop3"
                  >
                    <div className="modal-header border-bottom p-3">
                      <input
                        type="search"
                        className="form-control fs-3"
                        placeholder="Try to searching ..."
                      />
                    </div>
                    <div className="message-body p-3" data-simplebar>
                      <h5 className="mb-0 fs-5 p-1">Quick Page Links</h5>
                      <ul className="list mb-0 py-2">
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Modern</span>
                            <span className="fs-3 text-muted d-block">
                              /dashboards/dashboard1
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Dashboard</span>
                            <span className="fs-3 text-muted d-block">
                              /dashboards/dashboard2
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Contacts</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/contacts
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Posts</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/blog/posts
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Detail</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow
                            </span>
                          </a>
                        </li>
                        <li className="p-1 mb-1 bg-hover-light-black rounded">
                          <a href="#">
                            <span className="fs-3 text-dark d-block">Shop</span>
                            <span className="fs-3 text-muted d-block">
                              /apps/ecommerce/shop
                            </span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown nav-icon-hover-bg rounded-circle">
                  <a
                    className="nav-link position-relative"
                    href="#"
                    aria-expanded="false"
                  >
                    <Icon icon="solar:chat-dots-line-duotone" className="fs-6" />
                    <div className="pulse">
                      <span className="heartbit border-warning"></span>
                      <span className="point text-bg-warning"></span>
                    </div>
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop3"
                  >
                    <div className="d-flex align-items-center py-3 px-7">
                      <h3 className="mb-0 fs-5">Messages</h3>
                      <span className="badge bg-info ms-3">5 new</span>
                    </div>
                    <div className="message-body" data-simplebar>
                      <a
                        href="#"
                        className="dropdown-item px-7 d-flex align-items-center py-6"
                      >
                        <span className="flex-shrink-0">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-2.jpg"
                            alt="user"
                            width="45"
                            className="rounded-circle"
                          />
                        </span>
                        <div className="w-100 ps-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fs-3 fw-normal">
                              Roman Joined the Team!
                            </h5>
                            <span className="fs-2 text-nowrap d-block text-muted">
                              9:08 AM
                            </span>
                          </div>
                          <span className="fs-2 d-block mt-1 text-muted">
                            Congratulate him
                          </span>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="dropdown-item px-7 d-flex align-items-center py-6"
                      >
                        <span className="flex-shrink-0">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-3.jpg"
                            alt="user"
                            width="45"
                            className="rounded-circle"
                          />
                        </span>
                        <div className="w-100 ps-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fs-3 fw-normal">
                              New message received
                            </h5>
                            <span className="fs-2 text-nowrap d-block text-muted">
                              9:08 AM
                            </span>
                          </div>
                          <span className="fs-2 d-block mt-1 text-muted">
                            Salma sent you new message
                          </span>
                        </div>
                      </a>
                      <a
                        href="#"
                        className="dropdown-item px-7 d-flex align-items-center py-6"
                      >
                        <span className="flex-shrink-0">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-4.jpg"
                            alt="user"
                            width="45"
                            className="rounded-circle"
                          />
                        </span>
                        <div className="w-100 ps-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="mb-0 fs-3 fw-normal">
                              New Payment received
                            </h5>
                            <span className="fs-2 text-nowrap d-block text-muted">
                              9:08 AM
                            </span>
                          </div>
                          <span className="fs-2 d-block mt-1 text-muted">
                            Check your earnings
                          </span>
                        </div>
                      </a>
                    </div>
                    <div className="py-6 px-7 mb-1">
                      <button className="btn btn-primary w-100">
                        See All Messages
                      </button>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link position-relative ms-6"
                    href="#"
                    aria-expanded="false"
                  >
                    <div className="d-flex align-items-center flex-shrink-0">
                      <div className="user-profile me-sm-3 me-2">
                        <img
                          src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-1.jpg"
                          width="40"
                          className="rounded-circle"
                          alt="spike-img"
                        />
                      </div>
                      <span className="d-sm-none d-block">
                        <Icon icon="solar:alt-arrow-down-line-duotone" />
                      </span>
                      <div className="d-none d-sm-block">
                        <h6 className="fs-4 mb-1 profile-name">Mike Nielsen</h6>
                        <p className="fs-3 lh-base mb-0 profile-subtext">Admin</p>
                      </div>
                    </div>
                  </a>
                  <div
                    className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up"
                    aria-labelledby="drop1"
                  >
                    <div className="profile-dropdown position-relative" data-simplebar>
                      <div className="d-flex align-items-center justify-content-between pt-3 px-7">
                        <h3 className="mb-0 fs-5">User Profile</h3>
                      </div>
                      <div className="d-flex align-items-center mx-7 py-9 border-bottom">
                        <img
                          src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-1.jpg"
                          alt="user"
                          width="90"
                          className="rounded-circle"
                        />
                        <div className="ms-4">
                          <h4 className="mb-0 fs-5 fw-normal">Mike Nielsen</h4>
                          <span className="text-muted">super admin</span>
                          <p className="text-muted mb-0 mt-1 d-flex align-items-center">
                            <Icon
                              icon="solar:mailbox-line-duotone"
                              className="fs-4 me-1"
                            />
                            info@spike.com
                          </p>
                        </div>
                      </div>
                      <div className="message-body">
                        <a
                          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/page-user-profile.html"
                          className="dropdown-item px-7 d-flex align-items-center py-6"
                        >
                          <span className="btn px-3 py-2 bg-info-subtle rounded-1 text-info shadow-none">
                            <Icon
                              icon="solar:wallet-2-line-duotone"
                              className="fs-7"
                            />
                          </span>
                          <div className="w-100 ps-3 ms-1">
                            <h5 className="mb-0 mt-1 fs-4 fw-normal">My Profile</h5>
                            <span className="fs-3 d-block mt-1 text-muted">
                              Account Settings
                            </span>
                          </div>
                        </a>
                        <a
                          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-email.html"
                          className="dropdown-item px-7 d-flex align-items-center py-6"
                        >
                          <span className="btn px-3 py-2 bg-success-subtle rounded-1 text-success shadow-none">
                            <Icon
                              icon="solar:shield-minimalistic-line-duotone"
                              className="fs-7"
                            />
                          </span>
                          <div className="w-100 ps-3 ms-1">
                            <h5 className="mb-0 mt-1 fs-4 fw-normal">My Inbox</h5>
                            <span className="fs-3 d-block mt-1 text-muted">
                              Messages & Emails
                            </span>
                          </div>
                        </a>
                        <a
                          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/app-notes.html"
                          className="dropdown-item px-7 d-flex align-items-center py-6"
                        >
                          <span className="btn px-3 py-2 bg-danger-subtle rounded-1 text-danger shadow-none">
                            <Icon
                              icon="solar:card-2-line-duotone"
                              className="fs-7"
                            />
                          </span>
                          <div className="w-100 ps-3 ms-1">
                            <h5 className="mb-0 mt-1 fs-4 fw-normal">My Task</h5>
                            <span className="fs-3 d-block mt-1 text-muted">
                              To-do and Daily Tasks
                            </span>
                          </div>
                        </a>
                      </div>
                      <div className="py-6 px-7 mb-1">
                        <a
                          href="https://bootstrapdemos.wrappixel.com/spike/dist/main/authentication-login.html"
                          className="btn btn-primary w-100"
                        >
                          Log Out
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div
          className={`offcanvas offcanvas-start dropdown-menu-nav-offcanvas ${
            isMobileNavOpen ? "show" : ""
          }`}
          data-bs-scroll="true"
          tabIndex={-1}
          id="mobilenavbar"
          aria-labelledby="offcanvasWithBothOptionsLabel"
        >
          <nav className="sidebar-nav scroll-sidebar">
            <div className="offcanvas-header justify-content-between">
              <img
                src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/logos/favicon.png"
                alt="spike-img"
                className="img-fluid"
              />
              <button
                type="button"
                className="btn-close"
                onClick={toggleMobileNav}
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body h-n80" data-simplebar>
              <ul id="sidebarnav">
                <li className="sidebar-item">
                  <a
                    className="sidebar-link gap-2 has-arrow"
                    href="#"
                    aria-expanded="false"
                  >
                    <Icon icon="solar:list-bold-duotone" className="fs-7" />
                    <span className="hide-menu">Apps</span>
                  </a>
                  <ul aria-expanded="false" className="collapse first-level my-3">
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-chat.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Chat Application</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            New messages arrived
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-invoice.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Invoice App</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            Get latest invoice
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-mobile.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Contact Application</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            2 Unsaved Contacts
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-message-box.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Email App</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            Get new emails
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-cart.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">User Profile</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            learn more information
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-date.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Calendar App</h6>
                          <span className="fs-2 d-block fw-normal text-muted">Get dates</span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-lifebuoy.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Contact List Table</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            Add new contact
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="sidebar-item py-2">
                      <a href="#" className="d-flex align-items-center">
                        <div className="text-bg-light rounded-1 me-3 p-6 d-flex align-items-center justify-content-center">
                          <img
                            src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/svgs/icon-dd-application.svg"
                            alt="spike-img"
                            className="img-fluid"
                            width="24"
                            height="24"
                          />
                        </div>
                        <div>
                          <h6 className="mb-1 bg-hover-primary">Notes Application</h6>
                          <span className="fs-2 d-block fw-normal text-muted">
                            To-do and Daily tasks
                          </span>
                        </div>
                      </a>
                    </li>
                    <ul className="px-8 mt-6 mb-4">
                      <li className="sidebar-item mb-3">
                        <h5 className="fs-5 fw-semibold">Quick Links</h5>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">
                          Pricing Page
                        </a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">
                          Authentication Design
                        </a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">Register Now</a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">404 Error Page</a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">Notes App</a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">User Application</a>
                      </li>
                      <li className="sidebar-item py-2">
                        <a className="fw-semibold text-dark" href="#">Account Settings</a>
                      </li>
                    </ul>
                  </ul>
                </li>
                <li className="sidebar-item">
                  <a className="sidebar-link gap-2" href="#" aria-expanded="false">
                    <Icon
                      icon="solar:chat-round-unread-line-duotone"
                      className="fs-6 text-dark"
                    />
                    <span className="hide-menu">Chat</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a className="sidebar-link gap-2" href="#" aria-expanded="false">
                    <Icon
                      icon="solar:calendar-add-line-duotone"
                      className="fs-6 text-dark"
                    />
                    <span className="hide-menu">Calendar</span>
                  </a>
                </li>
                <li className="sidebar-item">
                  <a className="sidebar-link gap-2" href="#" aria-expanded="false">
                    <Icon
                      icon="solar:mailbox-line-duotone"
                      className="fs-6 text-dark"
                    />
                    <span className="hide-menu">Email</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;