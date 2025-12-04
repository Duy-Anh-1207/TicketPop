import React from "react";
import "./GioiThieu.css";

const GioiThieu: React.FC = () => {
  return (
    <div className="about-page">

      {/* Banner */}
      <div className="about-hero">
        <div className="overlay"></div>
        <h1 className="hero-title">Giới thiệu về hệ thống đặt vé phim</h1>
        <p className="hero-desc">
          Trải nghiệm điện ảnh đỉnh cao – Nhanh chóng, tiện lợi, và chính xác.
        </p>
      </div>

      {/* Nội dung */}
      <div className="about-content">

        <section className="about-section">
          <h2>🎞 Sứ mệnh của chúng tôi</h2>
          <p>
            Website đặt vé xem phim được xây dựng nhằm mang đến cho người dùng
            trải nghiệm đặt vé nhanh nhất, mượt nhất và thân thiện nhất.
            Chúng tôi mong muốn trở thành lựa chọn hàng đầu mỗi khi bạn muốn
            tận hưởng những bộ phim hấp dẫn tại rạp.
          </p>
        </section>

        <section className="about-section">
          <h2>🍿 Các tính năng nổi bật</h2>
          <ul>
            <li>✔ Đặt vé chỉ trong 30 giây</li>
            <li>✔ Chọn ghế trực quan theo thời gian thực</li>
            <li>✔ Lịch chiếu cập nhật liên tục</li>
            <li>✔ Xem trailer, mô tả phim</li>
            <li>✔ Mua bắp nước online</li>
            <li>✔ Voucher và ưu đãi hấp dẫn</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>🎥 Tại sao nên chọn chúng tôi?</h2>
          <p>
            Chúng tôi cam kết cung cấp dịch vụ nhanh – ổn định – chính xác,
            đem lại trải nghiệm giải trí tuyệt vời nhất qua từng suất chiếu.
          </p>
        </section>

      </div>
    </div>
  );
};

export default GioiThieu;
