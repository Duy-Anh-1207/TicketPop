import { useLocation } from "react-router-dom";
import { useListPhim } from "../../hook/PhimHook";
import type { Phim } from "../../types/phim";
import MovieCard from "../../component/Layout/ClientLayout/ListMovie/MovieCard";
import { useState } from "react";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const TimKiemPage = () => {
    const { data: movies, isLoading } = useListPhim({});
    const query = useQuery();
    const keyword = (query.get("keyword") || "").toLowerCase().trim();

    const [showTrailer, setShowTrailer] = useState(false);
    const [currentTrailer, setCurrentTrailer] = useState<string | null>(null);

    const now = Date.now();

    if (isLoading) return <div className="text-center p-5">Đang tải dữ liệu...</div>;
    if (!movies) return <div className="text-center p-5">Không có dữ liệu phim</div>;

    // --- Lọc phim ---
    const phimDangChieu = movies.filter((m: Phim) => {
        const start = Date.parse(m.ngay_cong_chieu);
        const end = Date.parse(m.ngay_ket_thuc);
        return (
            start <= now &&
            now <= end &&
            m.ten_phim.toLowerCase().includes(keyword)
        );
    });

    const phimSapChieu = movies.filter((m: Phim) => {
        const start = Date.parse(m.ngay_cong_chieu);
        return start > now && m.ten_phim.toLowerCase().includes(keyword);
    });

    // --- Trailer ---
    const openTrailer = (url: string) => {
        let embedUrl = url;

        if (url.includes("watch?v=")) {
            embedUrl = url.replace("watch?v=", "embed/");
        } else if (url.includes("youtube.com/") && !url.includes("embed/")) {
            const id = url.split("v=")[1]?.split("&")[0];
            if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
        }

        setCurrentTrailer(`${embedUrl}?autoplay=1`);
        setShowTrailer(true);
    };

    const closeTrailer = () => {
        setShowTrailer(false);
        setCurrentTrailer(null);
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">
                Kết quả tìm kiếm cho: <span className="text-primary">"{keyword}"</span>
            </h2>

            {/* Đang chiếu */}
            <h3 className="section-title">Phim đang chiếu</h3>
            <div className="movie-list mb-5">
                {phimDangChieu.length > 0 ? (
                    phimDangChieu.map((m) => (
                        <MovieCard key={m.id} movie={m} openTrailer={openTrailer} />
                    ))
                ) : (
                    <p>Không tìm thấy phim đang chiếu phù hợp</p>
                )}
            </div>

            {/* Sắp chiếu */}
            <h3 className="section-title">Phim sắp chiếu</h3>
            <div className="movie-list">
                {phimSapChieu.length > 0 ? (
                    phimSapChieu.map((m) => (
                        <MovieCard key={m.id} movie={m} openTrailer={openTrailer} />
                    ))
                ) : (
                    <p>Không tìm thấy phim sắp chiếu phù hợp</p>
                )}
            </div>

            {/* Popup Trailer */}
            {showTrailer && (
                <div className="trailer-modal" onClick={closeTrailer}>
                    <div className="trailer-content" onClick={(e) => e.stopPropagation()}>
                        <iframe
                            src={currentTrailer ?? ""}
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

export default TimKiemPage;
