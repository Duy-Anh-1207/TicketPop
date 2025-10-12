import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav
      style={{
        paddingTop: "20px",
        display:'flex',
        justifyContent:'space-between'
      }}
    >
        <ul
          style={{
            display: "flex",
          }}
        >
          <li>
            <a
              href="#choose-theater"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="location"
                style={{ marginRight: "5px" }}
              >
                <i className="fa-solid fa-location-dot"></i>
              </span>
              Chọn rạp
            </a>
          </li>
          <li style={{ margin: "0 40px" }}>
            <a
              href="#schedule"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                role="img"
                aria-label="calendar"
                style={{ marginRight: "5px" }}
              >
                <i className="fa-solid fa-location-dot"></i>
              </span>
              Lịch chiếu
            </a>
          </li>
        </ul>

        <ul
          style={{
            display: "flex",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li style={{ margin: "0 15px" }}>
            <a
              href="#promotion"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Khuyến mãi
            </a>
          </li>
          <li style={{ margin: "0 15px" }}>
            <a
              href="#event"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Tổ chức sự kiện
            </a>
          </li>
          <li style={{ margin: "0 15px" }}>
            <a
              href="#entertainment"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Dịch vụ giải trí khác
            </a>
          </li>
          <li style={{ margin: "0 15px" }}>
            <a
              href="#introduction"
              style={{
                color: "black",
                textDecoration: "none",
                fontSize: "16px",
              }}
            >
              Giới thiệu
            </a>
          </li>
        </ul>
    </nav>
  );
};

export default Navbar;
