import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPhimById } from "../../../../provider/PhimProvider";
import { useListTheLoai } from "../../../../hook/TheLoaiHook";
import { useListPhienBan } from "../../../../hook/PhienBanHook";
import type { Phim } from "../../../../types/phim";
import "./Description.scss";

const Description = () => {

  const { slug } = useParams();
  const location = useLocation();
  const [movie, setMovie] = useState<Phim | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

  // Lấy danh sách thể loại & phiên bản
  const { data: listTheLoai } = useListTheLoai();
  const { data: listPhienBan } = useListPhienBan();

  // HÀM MAP TÊN THỂ LOẠI
  const getTenTheLoai = (ids: number[] | number | string | null | undefined) => {
    if (!ids || !listTheLoai) return ["Đang cập nhật"];

    // Nếu chỉ là 1 ID → ép thành mảng
    const arrayIds = Array.isArray(ids) ? ids : [ids];

    return arrayIds
      .map((id) => {
        const found = listTheLoai.find(t => t.id === Number(id));
        return found?.ten_the_loai ?? "Đang cập nhật";
      });
  };


  // HÀM MAP TÊN PHIÊN BẢN
  const getTenPhienBan = (ids: number[] | number | string | null | undefined) => {
    if (!ids || !listPhienBan) return ["Đang cập nhật"];

    const arrayIds = Array.isArray(ids) ? ids : [ids];

    return arrayIds
      .map((id) => {
        const found = listPhienBan.find(p => p.id === Number(id));
        return found?.the_loai ?? "Đang cập nhật";
      });
  };


  //LẤY PHIM
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

  // SCROLL
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

  //TRAILER
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
        <img
          src={
            movie.anh_poster?.startsWith("http")
              ? movie.anh_poster
              : `${import.meta.env.VITE_API_BASE_URL}/storage/${movie.anh_poster}`
          }
          alt={movie.ten_phim}
          className="card-img-top"
        />
      </div>

      {/* Cột phải */}
      <div className="description-right">
        <h2 className="movie-title">{movie.ten_phim}</h2>

        <div className="movie-info">
          <p><strong>Thời lượng:</strong> {movie.thoi_luong} phút</p>
          <p><strong>Quốc gia:</strong> {movie.quoc_gia}</p>
          <p><strong>Ngôn ngữ:</strong> {movie.ngon_ngu}</p>
          <p><strong>Thể loại:</strong> {getTenTheLoai(movie.the_loai_id).map((name, index) => (
            <span key={index} >{name}, </span>
          ))}
          </p>
          <p><strong>Phiên bản:</strong>  {getTenPhienBan(movie.phien_ban_id).map((name, index) => (
            <span key={index}> {name}, </span>
          ))}
          </p>



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
