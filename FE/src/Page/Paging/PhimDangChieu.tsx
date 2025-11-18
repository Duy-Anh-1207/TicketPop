import { useListPhim } from "../../hook/PhimHook";
import type { Phim } from "../../types/phim";
import { useState } from "react";
import MovieCard from "../../component/Layout/ClientLayout/ListMovie/MovieCard";
import "./PhimDangVaSapChieu.css";

const PhimDangChieu: React.FC = () => {
  const { data: movies, isLoading } = useListPhim({});
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

  if (isLoading) return <div>Đang tải phim...</div>;
  if (!movies || movies.length === 0) return <div>Không có phim nào</div>;

  const now = Date.now();

  const dangChieu = movies.filter((m: Phim) => {
    const start = Date.parse(m.ngay_cong_chieu);
    const end = Date.parse(m.ngay_ket_thuc);
    return start <= now && now <= end;
  });

  const openTrailer = (url: string) => {
    let embedUrl = url;
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    setCurrentTrailer(`${embedUrl}?autoplay=1`);
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setCurrentTrailer(null);
  };

  return (
    <div className="container py-4">
      <h2 className="section-title">Phim đang chiếu ({dangChieu.length})</h2>
      {dangChieu.length > 0 ? (
        <div className="movie-list">
          {dangChieu.map((movie) => (
            <MovieCard key={movie.id} movie={movie} openTrailer={openTrailer} />
          ))}
        </div>
      ) : <p>Không có phim đang chiếu</p>}

      {showTrailer && (
        <div className="trailer-modal" onClick={closeTrailer}>
          <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={currentTrailer ?? ""}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <button className="close-trailer" onClick={closeTrailer}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhimDangChieu;
