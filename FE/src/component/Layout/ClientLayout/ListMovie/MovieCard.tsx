import { useListPhim } from "../../../../hook/PhimHook";
import type { Phim } from "../../../../types/phim";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

interface MovieCardProps {
  movie: Phim;
  openTrailer: (url: string) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, openTrailer }) => {
  const navigate = useNavigate();

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

  return (
    <div className="movie-card-list">
      <img
        className="poster-list"
        src={
          movie.anh_poster?.startsWith("http")
            ? movie.anh_poster
            : `${import.meta.env.VITE_API_BASE_URL}/storage/${movie.anh_poster}`
        }
        alt={movie.ten_phim}
        onClick={handleGoDetail}
      />
      <div className="movie-info-list">
        <h3 onClick={handleGoDetail}>{movie.ten_phim}</h3>
        <p><strong>Thời lượng:</strong> {movie.thoi_luong} phút</p>
        <p><strong>Quốc gia:</strong> {movie.quoc_gia}</p>
        <p><strong>Khởi chiếu:</strong> {new Date(movie.ngay_cong_chieu).toLocaleDateString()}</p>
        <p><strong>Ngôn ngữ:</strong> {movie.ngon_ngu}</p>
        <div className="movie-actions-list">
          <button
            onClick={() => openTrailer(movie.trailer)}
            className="btn btn-outline-primary"
          >
            Xem trailer
          </button>
          <button onClick={handleGoDetail} className="btn btn-primary">
            Đặt vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
