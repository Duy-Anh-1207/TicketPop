import React from "react";

const Booking: React.FC = () => {
  return (
    <div className="py-4 d-flex justify-content-center">
      <div
        className="w-100"
        style={{
          maxWidth: "1200px",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-between px-4 py-3 rounded shadow-sm"
          style={{
            backgroundColor: "#f4f6ff",
            borderRadius: "8px",
            width: "100%",
            display:'flex',
            gap:'10px'
          }}
        >
          <h4 className="fw-bold mb-0 text-dark">ĐẶT VÉ NHANH</h4>

          <select
            className="form-select border-1 fw-bold text-purple"
            style={selectStyle}
          >
            <option>1. Chọn Rạp</option>
            <option>CGV</option>
            <option>Lotte Cinema</option>
          </select>

          <select
            className="form-select border-1 fw-bold text-purple"
            style={selectStyle}
          >
            <option>2. Chọn Phim</option>
            <option>Avengers</option>
            <option>Inception</option>
          </select>

          <select
            className="form-select border-1 fw-bold text-purple"
            style={selectStyle}
          >
            <option>3. Chọn Ngày</option>
            <option>11/10/2025</option>
            <option>12/10/2025</option>
          </select>

          <select
            className="form-select border-1 fw-bold text-purple"
            style={selectStyle}
          >
            <option>4. Chọn Suất</option>
            <option>18:00</option>
            <option>21:00</option>
          </select>

          <button
            className="btn fw-bold text-white px-4"
            style={{
              backgroundColor: "#8000ff",
              fontSize: "1.1rem",
              borderRadius: "8px",
              height:'45px'
            }}
          >
            ĐẶT NGAY
          </button>
        </div>
      </div>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  width:'180px',
  color: "#8000ff",
  fontSize: "1.1rem",
  borderColor: "#d1d1d1",
  borderRadius: "8px",
  height:'45px'
};

export default Booking;
