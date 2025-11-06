import React from 'react';
import { useParams, Link } from 'react-router-dom';
// Sửa đường dẫn import cho đúng (đi lên 2 cấp ra src/, rồi vào hook/)
import { useTinTucDetail } from '../../hook/TinTucHook';
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill để hiển thị nội dung HTML

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
        <div className="bg-white dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Nút quay lại */}
                <div className="mb-6">
                    <Link
                        to="/tin-tuc"
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        &larr; Quay lại danh sách
                    </Link>
                </div>

                {/* Tiêu đề */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {tinTuc.tieu_de}
                </h1>

                {/* Thông tin phụ (Loại tin, Ngày đăng) */}
                <div className="flex items-center space-x-4 mb-6 text-gray-500 dark:text-gray-400 text-sm">
                    <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${tinTuc.type === 'uu_dai' ? 'bg-green-100 text-green-800' :
                                tinTuc.type === 'su_kien' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                            }`}
                    >
                        {formatNewsType(tinTuc.type)}
                    </span>
                    <span>|</span>
                    <span>
                        Ngày đăng: {new Date(tinTuc.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>

                {/* Ảnh bìa */}
                {tinTuc.hinh_anh && (
                    <img
                        src={getImageUrl(tinTuc.hinh_anh)}
                        alt={tinTuc.tieu_de}
                        className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}

                {/* Nội dung bài viết */}
                <div
                    className="prose prose-lg max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 ql-editor"
                    // RẤT QUAN TRỌNG: Dùng dangerouslySetInnerHTML để render HTML từ ReactQuill
                    dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung }}
                />
            </div>
        </div>
    );
};

export default NewsDetailPage;

