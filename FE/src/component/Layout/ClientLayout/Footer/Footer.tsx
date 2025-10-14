import React from 'react';
import Logo from '../Logo/Logo';
const Footer: React.FC = () => {
  return (
    <footer style={{  color: 'black',borderTop:'1px solid black', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            <Logo/>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>THỂ LOẠI PHIM</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Phim đang chiếu</li>
            <li style={{ marginBottom: '5px' }}>Phim sắp chiếu</li>
            <li style={{ marginBottom: '5px' }}>Phim lẻ</li>
            <li style={{ marginBottom: '5px' }}>Phim bộ</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>DỊCH VỤ</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Thẻ quà tặng</li>
            <li style={{ marginBottom: '5px' }}>Membership</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>CINESTAR</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Giới thiệu</li>
            <li style={{ marginBottom: '5px' }}>Liên hệ</li>
            <li style={{ marginBottom: '5px' }}>Tuyển dụng</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>HỆ THỐNG RẠP</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Tất cả hệ thống rạp</li>
            <li style={{ marginBottom: '5px' }}>Cinestar Quốc Thanh (TPHCM)</li>
            <li style={{ marginBottom: '5px' }}>Cinestar Hai Bà Trưng (TPHCM)</li>
            <li style={{ marginBottom: '5px' }}>Cinestar Sân Vườn (TPHCM)</li>
            <li style={{ marginBottom: '5px' }}>Cinestar Huế (TP Huế)</li>
            <li style={{ marginBottom: '5px' }}>Đống Đa Lat (Lâm Đồng)</li>
            <li style={{ marginBottom: '5px' }}>Cinestar Mỹ Tho (Tiền Giang)</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;