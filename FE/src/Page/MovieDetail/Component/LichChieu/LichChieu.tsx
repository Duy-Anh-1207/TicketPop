import { useState, useEffect, useCallback } from "react";
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
  const navigate = useNavigate();

  const phimId = slug ? parseInt(slug.split("-").pop() || "0", 10) : 0;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [lichChieu, setLichChieu] = useState<LichChieuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [datesWithShowtime, setDatesWithShowtime] = useState<Set<string>>(new Set());

  // ===== Tạo danh sách 7 ngày =====
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

  // ===== Kiểm tra ngày nào có suất chiếu =====
  useEffect(() => {
    if (!phimId) return;

    const checkShowtimes = async () => {
      const results = await Promise.all(
        days.map((day) =>
          getLichChieuTheoPhim(phimId, day.value)
            .then((res) => (res.data?.length > 0 ? day.value : null))
            .catch(() => null)
        )
      );

      const validDates = new Set(results.filter(Boolean) as string[]);
      setDatesWithShowtime(validDates);

      if (!selectedDate && validDates.size > 0) {
        const firstDate = days.find((d) => validDates.has(d.value));
        if (firstDate) setSelectedDate(firstDate.value);
      }
    };

    checkShowtimes();
  }, [phimId]);

  // ===== Hàm fetch lịch chiếu (dùng cho realtime) =====
  const fetchLichChieu = useCallback(async () => {
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
  }, [selectedDate, phimId, datesWithShowtime]);

  // ===== Realtime polling (15s) =====
  useEffect(() => {
    fetchLichChieu();

    const interval = setInterval(() => {
      fetchLichChieu();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchLichChieu]);

  // ===== Refresh khi quay lại tab =====
  useEffect(() => {
    const onFocus = () => fetchLichChieu();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchLichChieu]);

  const handleSelectDate = (date: string) => {
    if (datesWithShowtime.has(date)) {
      setSelectedDate(date);
    }
  };

  const handleSelectShowtime = (lc: LichChieuItem) => {
    navigate(`/booking/${slug}`, {
      state: { lichChieuId: lc.id },
    });
  };

  return (
    <div id="lich-chieu" className="lichchieu-wrapper">
      <h3 className="title">Lịch chiếu</h3>

      {/* ===== Chọn ngày ===== */}
      <div className="days-container">
        {days.map((day) => {
          const hasShowtime = datesWithShowtime.has(day.value);
          const isSelected = selectedDate === day.value;

          return (
            <button
              key={day.value}
              className={`day-btn ${isSelected ? "active" : ""} ${
                !hasShowtime ? "disabled" : ""
              }`}
              disabled={!hasShowtime}
              onClick={() => handleSelectDate(day.value)}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* ===== Lịch chiếu ===== */}
      <div className="schedule-box">
        {loading ? (
          <p>Đang tải lịch chiếu...</p>
        ) : lichChieu.length === 0 ? (
          <p>Không có suất chiếu nào.</p>
        ) : (
          Object.values(
            lichChieu.reduce((groups, lc) => {
              const id = lc.phong.id;
              if (!groups[id]) {
                groups[id] = { phong: lc.phong, showtimes: [] as LichChieuItem[] };
              }
              groups[id].showtimes.push(lc);
              return groups;
            }, {} as Record<number, { phong: LichChieuItem["phong"]; showtimes: LichChieuItem[] }>)
          ).map((group) => (
            <div key={group.phong.id} className="room-group">
              <h4 className="room-name">{group.phong.ten_phong}</h4>

              <div className="showtimes-row">
                {group.showtimes
                  .sort(
                    (a, b) =>
                      new Date(a.gio_chieu).getTime() -
                      new Date(b.gio_chieu).getTime()
                  )
                  .map((lc) => {
                    const time = new Date(lc.gio_chieu).toLocaleTimeString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" }
                    );

                    return (
                      <div
                        key={lc.id}
                        className="showtime-item"
                        onClick={() => handleSelectShowtime(lc)}
                      >
                        <div className="time">{time}</div>
                        <div className="version-tag">
                          {lc.phien_ban?.the_loai || "Thường"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LichChieu;
