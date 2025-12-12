import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LichChieu.scss";
import { getLichChieuTheoPhim } from "../../../../provider/Client/lichChieuClientProvider";

interface LichChieuItem {
  id: number;
  phong: {
    id: number;
    ten_phong: string;
  };
  phien_ban: {
    id: number;
    the_loai: string;
  } | null;
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
    const value = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    return { label, value };
  });

  const [datesWithShowtime, setDatesWithShowtime] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!phimId) return;

    const checkShowtimes = async () => {
      const results = await Promise.all(
        days.map((day) =>
          getLichChieuTheoPhim(phimId, day.value)
            .then((res) => (res.data && res.data.length > 0 ? day.value : null))
            .catch(() => null)
        )
      );

      const validDates = new Set(results.filter(Boolean) as string[]);
      setDatesWithShowtime(validDates);

      if (!selectedDate && validDates.size > 0) {
        const firstValid = days.find((d) => validDates.has(d.value));
        if (firstValid) setSelectedDate(firstValid.value);
      }
    };

    checkShowtimes();
  }, [phimId]);

  useEffect(() => {
    const fetchLichChieu = async () => {
      if (!selectedDate || !phimId) return;
      if (!datesWithShowtime.has(selectedDate)) {
        setLichChieu([]);
        return;
      }

      try {
        setLoading(true);
        const res = await getLichChieuTheoPhim(phimId, selectedDate);
        setLichChieu(res.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy lịch chiếu:", error);
        setLichChieu([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLichChieu();
  }, [selectedDate, phimId, datesWithShowtime]);

  const handleSelectDate = (dateValue: string) => {
    if (datesWithShowtime.has(dateValue)) {
      setSelectedDate(dateValue);
    }
  };

  const handleSelectShowtime = (lc: LichChieuItem) => {
    navigate(`/booking/${slug}`, { state: { lichChieuId: lc.id } });
  };

  return (
    <div id="lich-chieu" className="lichchieu-wrapper">
      <h3 className="title">Lịch chiếu</h3>

      <div className="days-container">
        {days.map((day) => {
          const hasShowtime = datesWithShowtime.has(day.value);
          const isSelected = selectedDate === day.value;

          return (
            <button
              key={day.value}
              className={`day-btn ${isSelected ? "active" : ""} ${!hasShowtime ? "disabled" : ""
                }`}
              onClick={() => handleSelectDate(day.value)}
              disabled={!hasShowtime}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      <div className="schedule-box">
        {selectedDate ? (
          loading ? (
            <p>Đang tải lịch chiếu...</p>
          ) : lichChieu.length > 0 ? (
            <>
              {Object.entries(
                lichChieu.reduce((groups, lc) => {
                  const phongId = lc.phong.id;
                  const key = `${phongId}`;
                  if (!groups[key]) {
                    groups[key] = {
                      phong: lc.phong,
                      showtimes: [],
                    };
                  }
                  groups[key].showtimes.push(lc);
                  return groups;
                }, {} as Record<string, { phong: LichChieuItem["phong"]; showtimes: LichChieuItem[] }>)
              )
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([_, group]) => (
                  <div key={group.phong.id} className="room-group">
                    <h4 className="room-name">
                      {group.phong.ten_phong}
                    </h4>
                    <div className="showtimes-row">
                      {group.showtimes
                        .sort((a, b) => new Date(a.gio_chieu).getTime() - new Date(b.gio_chieu).getTime())
                        .map((lc) => {
                          const date = new Date(lc.gio_chieu);
                          const gioPhut = date.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const phienBan = lc.phien_ban?.the_loai || "Thường";

                          return (
                            <div
                              key={lc.id}
                              className="showtime-item"
                              onClick={() => handleSelectShowtime(lc)}
                            >
                              <div className="time">{gioPhut}</div>
                              <div className="version-tag">{phienBan}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </>
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