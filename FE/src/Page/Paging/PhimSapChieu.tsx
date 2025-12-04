import { useListPhim } from "../../hook/PhimHook";
import type { Phim } from "../../types/phim";
import { useState } from "react";
import MovieCard from "../../component/Layout/ClientLayout/ListMovie/MovieCard";
import "./PhimDangVaSapChieu.css";

const PhimSapChieu: React.FC = () => {
  const { data: movies, isLoading } = useListPhim({});
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

  // Bộ lọc
  const [tenPhimLoc, setTenPhimLoc] = useState("");
  const [theLoaiLoc, setTheLoaiLoc] = useState("Tất cả");
  const [quocGiaLoc, setQuocGiaLoc] = useState("Tất cả");

  if (isLoading)
    return (
      <div className="text-center py-10 text-red-500">Đang tải phim...</div>
    );
  if (!movies || movies.length === 0) return <div>Không có phim nào</div>;

  const now = Date.now();

  // Lọc phim sắp chiếu
  let phimSapChieu = movies.filter(
    (m: Phim) => Date.parse(m.ngay_cong_chieu) > now
  );

  // Danh sách thể loại và quốc gia
  const danhSachTheLoai = Array.from(new Set(movies.map((m) => m.the_loai)));
  const danhSachQuocGia = Array.from(new Set(movies.map((m) => m.quoc_gia)));

  // Áp dụng bộ lọc tên phim
  if (tenPhimLoc.trim() !== "") {
    phimSapChieu = phimSapChieu.filter((m) =>
      m.ten_phim.toLowerCase().includes(tenPhimLoc.toLowerCase())
    );
  }

  // Áp dụng bộ lọc thể loại
  if (theLoaiLoc !== "Tất cả") {
    phimSapChieu = phimSapChieu.filter((m) => m.the_loai === theLoaiLoc);
  }

  // Áp dụng bộ lọc quốc gia
  if (quocGiaLoc !== "Tất cả") {
    phimSapChieu = phimSapChieu.filter((m) => m.quoc_gia === quocGiaLoc);
  }

  const moTrailer = (url: string) => {
    let embedUrl = url;
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    setCurrentTrailer(`${embedUrl}?autoplay=1`);
    setShowTrailer(true);
  };

  const dongTrailer = () => {
    setShowTrailer(false);
    setCurrentTrailer(null);
  };

  return (
    <div className="container py-4">
      {/* Bộ lọc */}
      <div className="filter-container mb-4">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch">
          <div className="flex-fill position-relative">
            <input
              type="text"
              placeholder="Tìm kiếm tên phim..."
              value={tenPhimLoc}
              onChange={(e) => setTenPhimLoc(e.target.value)}
              className="form-control ps-5 shadow-sm"
              style={{ height: "48px" }}
            />
            <i className="bi bi-search position-absolute top-50 start-4 translate-middle-y text-muted"></i>
          </div>

          <select
            value={theLoaiLoc}
            onChange={(e) => setTheLoaiLoc(e.target.value)}
            className="form-select shadow-sm"
            style={{ minWidth: "180px", height: "48px" }}
          >
            <option value="Tất cả">Tất cả thể loại</option>
            {danhSachTheLoai.map((tl) => (
              <option key={tl} value={tl}>
                {tl}
              </option>
            ))}
          </select>

          <select
            value={quocGiaLoc}
            onChange={(e) => setQuocGiaLoc(e.target.value)}
            className="form-select shadow-sm"
            style={{ minWidth: "160px", height: "48px" }}
          >
            <option value="Tất cả">Tất cả quốc gia</option>
            {danhSachQuocGia.map((qg) => (
              <option key={qg} value={qg}>
                {qg}
              </option>
            ))}
          </select>

          {(tenPhimLoc ||
            theLoaiLoc !== "Tất cả" ||
            quocGiaLoc !== "Tất cả") && (
            <button
              onClick={() => {
                setTenPhimLoc("");
                setTheLoaiLoc("Tất cả");
                setQuocGiaLoc("Tất cả");
              }}
              className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm"
              style={{ height: "48px", whiteSpace: "nowrap" }}
            >
              <i className="bi bi-arrow-repeat"></i>
              Đặt lại
            </button>
          )}
        </div>
      </div>

      <h2 className="section-title">Phim sắp chiếu ({phimSapChieu.length})</h2>
      {phimSapChieu.length > 0 ? (
        <div className="movie-list">
          {phimSapChieu.map((movie) => (
            <MovieCard key={movie.id} movie={movie} openTrailer={moTrailer} />
          ))}
        </div>
      ) : (
        <p>Không tìm thấy phim phù hợp</p>
      )}

      {showTrailer && (
        <div className="trailer-modal" onClick={dongTrailer}>
          <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={currentTrailer ?? ""}
              title="Trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
            <button className="close-trailer" onClick={dongTrailer}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhimSapChieu;
