import React from 'react';
import Logo from '../Logo/Logo';
const Footer: React.FC = () => {
  return (
    <footer style={{ color: 'black', borderTop: '1px solid black', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            <Logo />
          </div>
        </div>


        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>TÀI KHOẢN</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }} ><a href="dang-nhap" style={{ textDecoration: 'none', color: 'black' }}>
              Đăng nhập
            </a>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <a href="dang-ky" style={{ textDecoration: 'none', color: 'black' }}>
                Đăng kí
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>XEM PHIM</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }} ><a href="dang-chieu" style={{ textDecoration: 'none', color: 'black' }}>
              Phim đang chiếu
            </a>
            </li>
            <li style={{ marginBottom: '5px' }}>
              <a href="sap-chieu" style={{ textDecoration: 'none', color: 'black' }}>
                Phim sắp chiếu
              </a>
            </li>
            <li style={{ marginBottom: '5px' }}>Phim lẻ</li>
            <li style={{ marginBottom: '5px' }}>Phim bộ</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>DỊCH VỤ</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Thẻ quà tặng</li>
            <li style={{ marginBottom: '5px' }}>Membership</li>
            <li style={{ marginBottom: '5px' }}>Membership</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>TICKETPOP</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Giới thiệu</li>
            <li style={{ marginBottom: '5px' }}>Liên hệ</li>
            <li style={{ marginBottom: '5px' }}>Tuyển dụng</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;