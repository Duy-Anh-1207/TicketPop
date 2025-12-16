import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DanhGiaList.scss";

interface NguoiDung {
    id: number;
    ten: string;
    email: string;
}

interface DanhGiaItem {
    id: number;
    noi_dung: string;
    so_sao: number;
    created_at: string;
    nguoi_dung: NguoiDung;
}

interface ApiResponse {
    message: string;
    data: {
        data: DanhGiaItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const DanhGiaList = () => {
    const { slug } = useParams();
    const phimId = slug ? parseInt(slug.split("-").pop() || "0", 10) : 0;

    const [danhGia, setDanhGia] = useState<DanhGiaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchDanhGia = async (pageNum: number = 1) => {
        if (!phimId) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");

            const response = await axios.get<ApiResponse>(
                `${import.meta.env.VITE_API_BASE_URL}/api/danh-gia`,
                {
                    params: { phim_id: phimId, page: pageNum },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const resData = response.data.data;
            setDanhGia(pageNum === 1 ? resData.data : [...danhGia, ...resData.data]);
            setTotalPages(resData.last_page);
            setPage(resData.current_page);
        } catch (error) {
            console.error("Lỗi khi lấy đánh giá:", error);
            setDanhGia([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (phimId) {
            fetchDanhGia(1);
        }
    }, [phimId]);

    const renderStars = (so_sao: number) => {
        return (
            <div className="stars">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < so_sao ? "star filled" : "star"}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (!phimId) return null;

    return (
        <div id="danh-gia" className="danhgia-wrapper">
            <h3 className="title">Đánh giá từ khán giả</h3>

            {loading && page === 1 ? (
                <p>Đang tải đánh giá...</p>
            ) : danhGia.length === 0 ? (
                <p>Chưa có đánh giá nào cho phim này.</p>
            ) : (
                <>
                    <div className="danhgia-list">
                        {danhGia.map((dg) => (
                            <div key={dg.id} className="danhgia-item">
                                <div className="danhgia-header">
                                    <div className="avatar">
                                        {dg.nguoi_dung.ten.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="user-meta">
                                        <strong className="name">{dg.nguoi_dung.ten}</strong>
                                        <span className="date">
                                            {new Date(dg.created_at).toLocaleDateString("vi-VN")}
                                        </span>
                                        {renderStars(dg.so_sao)}
                                    </div>
                                </div>

                                <p className="content">{dg.noi_dung}</p>
                            </div>

                        ))}
                    </div>

                    {page < totalPages && (
                        <div className="load-more">
                            <button
                                onClick={() => fetchDanhGia(page + 1)}
                                disabled={loading}
                            >
                                {loading ? "Đang tải..." : "Xem thêm đánh giá"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DanhGiaList;