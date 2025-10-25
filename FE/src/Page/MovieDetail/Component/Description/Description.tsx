import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPhimById } from "../../../../provider/PhimProvider";
import type { Phim } from "../../../../types/phim";
import "./Description.scss";

const Description = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState<Phim | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const id = Number(slug.split("-").pop());

    const fetchMovie = async () => {
      try {
        const data = await getPhimById(id);
        setMovie(data);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết phim:", error);
      }
    };

    fetchMovie();
  }, [slug]);

  useEffect(() => {
    const scrollToLichChieu = location.state?.scrollToLichChieu;

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (scrollToLichChieu) {
      setTimeout(() => {
        const element = document.getElementById("lich-chieu");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          element.classList.add("highlight");
          setTimeout(() => element.classList.remove("highlight"), 2000);
        }
      }, 500);
    }
  }, [location]);

  const openTrailer = (url: string) => {
    if (!url) return;
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

  if (!movie) return <div className="loading">Đang tải phim...</div>;

  return (
    <div className="description-wrapper">
      {/* Cột trái - Ảnh */}
      <div className="description-left">
        <img src={movie.anh_poster} alt={movie.ten_phim} />
      </div>

      {/* Cột phải - Thông tin */}
      <div className="description-right">
        <h2 className="movie-title">{movie.ten_phim}</h2>

        <div className="movie-info">
          <p><strong>Thời lượng:</strong> {movie.thoi_luong} phút</p>
          <p><strong>Quốc gia:</strong> {movie.quoc_gia}</p>
          <p><strong>Ngôn ngữ:</strong> {movie.ngon_ngu}</p>
          <p><strong>Khởi chiếu:</strong> {new Date(movie.ngay_cong_chieu).toLocaleDateString()}</p>
        </div>

        <div className="movie-description">
          <h3>Nội dung phim</h3>
          <p>{movie.mo_ta}</p>
        </div>

        {movie.trailer && (
          <div className="movie-buttons">
            <button className="trailer-btn" onClick={() => openTrailer(movie.trailer)}>
              Xem trailer
            </button>
          </div>
        )}
      </div>

      {/* Modal trailer */}
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

export default Description;
