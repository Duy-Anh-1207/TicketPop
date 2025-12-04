import type { Phim } from "../../../../types/phim";
import { useListTheLoai } from "../../../../hook/TheLoaiHook";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

interface MovieCardProps {
  movie: Phim;
  openTrailer: (url: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, openTrailer }) => {
  const navigate = useNavigate();

  // Lấy danh sách thể loại từ API
  const { data: theLoaiList } = useListTheLoai();

  const theLoaiIds = Array.isArray(movie.the_loai_id)
    ? movie.the_loai_id
    : [movie.the_loai_id];

  const tenTheLoaiList =
    theLoaiList
      ?.filter((t: any) => theLoaiIds.includes(String(t.id)))
      .map((t: any) => t.ten_the_loai) || [];

  const toSlug = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleGoDetail = () => {
    const slug = toSlug(movie.ten_phim);
    navigate(`/phim/${slug}-${movie.id}`);
  };

  const posterUrl = movie.anh_poster?.startsWith("http")
    ? movie.anh_poster
    : `${import.meta.env.VITE_API_BASE_URL}/storage/${movie.anh_poster}`;

  return (
    <div className="movie-card-modern group">
      <div className="movie-poster-wrapper">
        <img
          src={posterUrl}
          alt={movie.ten_phim}
          className="movie-poster"
          onClick={handleGoDetail}
        />

        <div className="movie-overlay">
          <div className="overlay-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openTrailer(movie.trailer);
              }}
              className="btn-trailer"
              title="Xem trailer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGoDetail();
              }}
              className="btn-book"
            >
              Đặt vé ngay
            </button>
          </div>
        </div>
      </div>

      <div className="movie-info">
        <h3
          className="movie-title"
          onClick={handleGoDetail}
          title={movie.ten_phim}
        >
          {movie.ten_phim.length > 40
            ? movie.ten_phim.slice(0, 40) + "..."
            : movie.ten_phim}
        </h3>

        <div className="movie-meta">
          <span className="duration">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-5-3 1.5-1.5L10 14.25V7h2v7.25L9 17z" />
            </svg>
            {movie.thoi_luong} phút
          </span>

          <span className="year">
            {new Date(movie.ngay_cong_chieu).getFullYear()}
          </span>
        </div>

        <div className="movie-tags">
          <span className="tag-country">{movie.quoc_gia}</span>
          <span className="tag-lang">{movie.ngon_ngu}</span>
          {tenTheLoaiList.map((name: string, i: number) => (
            <span key={i} className="tag-lang">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
