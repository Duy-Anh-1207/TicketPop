import { useState } from "react";
import "./LichChieu.scss";

const LichChieu = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Tạo danh sách 7 ngày kế tiếp
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      label: date.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }),
      value: date.toISOString().split("T")[0],
    };
  });

  return (
    <div id="lich-chieu" className="lichchieu-wrapper">
      <h3 className="title">Lịch chiếu</h3>

      {/* Danh sách ngày */}
      <div className="days-container">
        {days.map((day) => (
          <button
            key={day.value}
            className={`day-btn ${selectedDate === day.value ? "active" : ""}`}
            onClick={() => setSelectedDate(day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Lịch chiếu bên dưới */}
      {selectedDate && (
        <div className="schedule-box">
          <h4>Lịch chiếu ngày {selectedDate}</h4>
          <div className="schedule-grid">
            <div className="showtime">09:30 - Phòng 1</div>
            <div className="showtime">13:45 - Phòng 2</div>
            <div className="showtime">16:00 - Phòng 3</div>
            <div className="showtime">19:15 - Phòng 1</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LichChieu;
