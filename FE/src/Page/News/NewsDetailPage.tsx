import React from 'react';
import { useParams, Link } from 'react-router-dom';
// Sửa đường dẫn import cho đúng (đi lên 2 cấp ra src/, rồi vào hook/)
import { useTinTucDetail } from '../../hook/TinTucHook';
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill để hiển thị nội dung HTML
import "./NewsDetailPage.css";

const NewsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Lấy ID từ URL

    // Gọi hook để lấy chi tiết tin tức
    const { data: tinTuc, isLoading, isError, error } = useTinTucDetail(id);

    // Xử lý link ảnh (giống như trang danh sách)
    const getImageUrl = (hinh_anh: string | null) => {
        if (!hinh_anh) return 'https://placehold.co/1200x600?text=No+Image';
        if (hinh_anh.startsWith('http')) {
            return hinh_anh;
        }
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace('/api', '');
        return `${baseUrl}${hinh_anh.startsWith('/') ? '' : '/'}${hinh_anh}`;
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Đang tải bài viết...</div>;
    }

    if (isError) {
        return <div className="text-center py-20 text-red-500">Lỗi: {(error as Error).message}</div>;
    }

    if (!tinTuc) {
        return <div className="text-center py-20 text-gray-500">Không tìm thấy bài viết.</div>;
    }

    // Helper để định dạng tên Type
    const formatNewsType = (type: string) => {
        switch (type) {
            case 'uu_dai': return 'Ưu Đãi';
            case 'su_kien': return 'Sự Kiện';
            case 'tin_tuc': return 'Tin Tức';
            default: return 'Tin Tức';
        }
    };

    return (
        <div className="news-detail-page">
            <div className="news-article">
                <Link to="/tin-tuc" className="news-back-link">
                    ← Quay lại tin tức
                </Link>

                <h1 className="news-title">{tinTuc.tieu_de}</h1>

                <div className="news-meta">
                    <span>{formatNewsType(tinTuc.type)}</span>
                    <span>
                        {new Date(tinTuc.created_at).toLocaleDateString("vi-VN")}
                    </span>
                </div>

                {tinTuc.hinh_anh && (
                    <img
                        src={getImageUrl(tinTuc.hinh_anh)}
                        alt={tinTuc.tieu_de}
                        className="news-cover-image"
                    />
                )}

                <div
                    className="news-content"
                    dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung }}
                />
            </div>
        </div>
    );


};

export default NewsDetailPage;

