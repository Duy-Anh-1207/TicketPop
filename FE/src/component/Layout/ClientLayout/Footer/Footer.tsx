import React from "react";
import Logo from "../Logo/Logo";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer-bg">
      <div className="footer-container">
        <div className="footer-col footer-logo">
          <Logo />
        </div>

        <div className="footer-col">
          <h4>TÀI KHOẢN</h4>
          <ul>
            <li><a href="dang-nhap">Đăng nhập</a></li>
            <li><a href="dang-ky">Đăng ký</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>XEM PHIM</h4>
          <ul>
            <li><a href="dang-chieu">Phim đang chiếu</a></li>
            <li><a href="sap-chieu">Phim sắp chiếu</a></li>
            <li>Phim lẻ</li>
            <li>Phim bộ</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>DỊCH VỤ</h4>
          <ul>
            <li>Thẻ quà tặng</li>
            <li>Membership</li>
            <li>Membership</li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>TICKETPOP</h4>
          <ul>
            <li><a href="gioi-thieu">Giới thiệu</a></li>
            <li>Liên hệ</li>
            <li>Tuyển dụng</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
