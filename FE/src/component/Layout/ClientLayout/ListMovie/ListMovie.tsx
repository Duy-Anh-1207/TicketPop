import { useListPhim } from "../../../../hook/PhimHook";
import type { Phim } from "../../../../types/phim";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListMovie.css";

interface MovieCardProps {
  movie: Phim;
  openTrailer: (url: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, openTrailer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const toSlug = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleGoDetail = (scrollToLichChieu = false) => {
    const slug = toSlug(movie.ten_phim);
    navigate(`/phim/${slug}-${movie.id}`, {
      state: { scrollToLichChieu },
    });
  };

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="poster-wrapper" onClick={() => handleGoDetail(false)}>
        <img
          src={movie.anh_poster}
          className="card-img-top"
          alt={movie.ten_phim}
        />
        {isHovered && (
          <div className="movie-info-overlay">
            <h3 className="movie-title-overlay">{movie.ten_phim}</h3>
            <div className="movie-details">
              <p>
                <i className="fa-solid fa-clock"></i> {movie.thoi_luong} phút
              </p>
              <p>
                <i className="fa-solid fa-globe"></i> {movie.quoc_gia}
              </p>
              <p>
                <i className="fa-solid fa-language"></i> {movie.ngon_ngu}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="movie-title" onClick={() => handleGoDetail(false)}>
        {movie.ten_phim}
      </p>

      <div className="movie-actions">
        <div
          className="trailer-link"
          onClick={() => openTrailer(movie.trailer)}
        >
          <i className="fa-solid fa-circle-play"></i>
          <p>Xem trailer</p>
        </div>
        <button
          className="book-ticket"
          onClick={() => handleGoDetail(true)} 
        >
          ĐẶT VÉ
        </button>
      </div>
    </div>
  );
};

interface MovieSliderProps {
  movieList: Phim[];
  openTrailer: (url: string) => void;
}

const MovieSlider: React.FC<MovieSliderProps> = ({
  movieList,
  openTrailer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage =
    window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 4;
  const canScroll = movieList.length > itemsPerPage;
  const maxIndex = canScroll ? movieList.length - itemsPerPage : 0;

  const scrollLeft = () => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  const scrollRight = () =>
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : prev));

  return (
    <div className="slider-container">
      <div
        className="slider"
        style={{
          transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
        }}
      >
        {movieList.map((movie) => (
          <MovieCard key={movie.id} movie={movie} openTrailer={openTrailer} />
        ))}
      </div>
      {canScroll && currentIndex > 0 && (
        <i
          className="fa-solid fa-chevron-left slider-arrow left"
          onClick={scrollLeft}
        ></i>
      )}
      {canScroll && currentIndex < maxIndex && (
        <i
          className="fa-solid fa-chevron-right slider-arrow right"
          onClick={scrollRight}
        ></i>
      )}
    </div>
  );
};

const ListMovie: React.FC = () => {
  const { data: movies, isLoading } = useListPhim({});
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

  if (isLoading) return <div className="loading">Đang tải phim...</div>;

  if (!movies || movies.length === 0)
    return <div className="no-movies">Không có phim nào</div>;

  const now = new Date();

  const dangChieu = movies.filter((m: Phim) => {
    const ngayCongChieu = new Date(m.ngay_cong_chieu);
    const ngayKetThuc = new Date(m.ngay_ket_thuc);
    return ngayCongChieu <= now && now <= ngayKetThuc;
  });

  const sapChieu = movies.filter((m: Phim) => {
    const ngayCongChieu = new Date(m.ngay_cong_chieu);
    return ngayCongChieu > now;
  });

  const openTrailer = (url: string) => {
    let embedUrl = url;
    if (url.includes("watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtube.com/") && !url.includes("embed/")) {
      const videoId = url.split("/").pop() || url.split("v=")[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setCurrentTrailer(`${embedUrl}?autoplay=1`);
    setShowTrailer(true);
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setCurrentTrailer(null);
  };

  return (
    <div className="container">
      <h2 className="section-title">PHIM ĐANG CHIẾU</h2>
      {dangChieu.length > 0 ? (
        <MovieSlider movieList={dangChieu} openTrailer={openTrailer} />
      ) : (
        <p className="no-movies">Không có phim đang chiếu</p>
      )}

      <h2 className="section-title">PHIM SẮP CHIẾU</h2>
      {sapChieu.length > 0 ? (
        <MovieSlider movieList={sapChieu} openTrailer={openTrailer} />
      ) : (
        <p className="no-movies">Không có phim sắp chiếu</p>
      )}

      {showTrailer && (
        <div className="trailer-modal" onClick={closeTrailer}>
          <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={currentTrailer ?? ""}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <button className="close-trailer" onClick={closeTrailer}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListMovie;
