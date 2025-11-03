import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LichChieu.scss";
import { getLichChieuTheoPhim } from "../../../../provider/Client/lichChieuClientProvider";

interface LichChieuItem {
  id: number;
  phong: { id: number; ten_phong: string };
  gio_chieu: string;
}

const LichChieu = () => {
  const { slug } = useParams();
  const phimId = slug ? parseInt(slug.split("-").pop() || "0", 10) : 0;
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lichChieu, setLichChieu] = useState<LichChieuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      label: date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }),
      value: date.toISOString().split("T")[0],
    };
  });

  useEffect(() => {
    const fetchLichChieu = async () => {
      if (!selectedDate || !phimId) return;
      try {
        setLoading(true);
        const res = await getLichChieuTheoPhim(phimId, selectedDate);
        setLichChieu(res.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy lịch chiếu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLichChieu();
  }, [selectedDate, phimId]);

  const handleSelectShowtime = (lc: LichChieuItem) => {
    console.log("Chọn lịch chiếu:", lc);
    navigate(`/booking/${slug}`, { state: { lichChieuId: lc.id } });
  };

  
  return (
    <div id="lich-chieu" className="lichchieu-wrapper">
      
      <h3 className="title">Lịch chiếu</h3>

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

      <div className="schedule-box">
        {selectedDate ? (
          loading ? (
            <p>Đang tải lịch chiếu...</p>
          ) : lichChieu.length > 0 ? (
            <div className="schedule-grid">
              {lichChieu.map((lc) => {
                const date = new Date(lc.gio_chieu);
                const gioPhut = date.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={lc.id}
                    className="showtime"
                    onClick={() => handleSelectShowtime(lc)}
                    style={{ cursor: "pointer" }}
                  >
                    {gioPhut}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Không có suất chiếu nào trong ngày này.</p>
          )
        ) : (
          <p>Vui lòng chọn ngày để xem lịch chiếu.</p>
        )}
      </div>
    </div>
  );
};

export default LichChieu;
