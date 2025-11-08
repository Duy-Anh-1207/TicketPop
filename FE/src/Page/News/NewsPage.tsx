import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Sửa đường dẫn import cho đúng (từ Page/News/ đi lên 2 cấp ra src/, rồi vào hook/)
import { useListTinTuc } from '../../hook/TinTucHook';
import type { NewsFilterType } from '../../hook/TinTucHook';
import type { TinTuc } from '../../types/tin-tuc';
// Component Thẻ Bài Viết (Tách riêng cho sạch code)
const NewsCard: React.FC<{ tinTuc: TinTuc }> = ({ tinTuc }) => {
    // Xử lý link ảnh (thêm base URL của BE nếu ảnh không phải link tuyệt đối)
    const getImageUrl = (hinh_anh: string | null) => {
        if (!hinh_anh) return 'https://placehold.co/600x400?text=No+Image';
        if (hinh_anh.startsWith('http')) {
            return hinh_anh;
        }
        // Lấy VITE_API_URL từ file .env (ví dụ: http://127.0.0.1:8000)
        // Thay thế /api ở cuối (nếu có)
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace('/api', '');
        return `${baseUrl}${hinh_anh.startsWith('/') ? '' : '/'}${hinh_anh}`;
    };

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
            <Link to={`/tin-tuc/${tinTuc.id}`} className="block aspect-[3/2] overflow-hidden">
                <img
                    src={getImageUrl(tinTuc.hinh_anh)}
                    alt={tinTuc.tieu_de}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Error')}
                />
            </Link>
            <div className="p-4">
                <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2 ${tinTuc.type === 'uu_dai' ? 'bg-green-100 text-green-800' :
                        tinTuc.type === 'su_kien' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                        }`}
                >
                    {formatNewsType(tinTuc.type)}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 h-14 overflow-hidden text-ellipsis">
                    <Link to={`/tin-tuc/${tinTuc.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
                        {tinTuc.tieu_de}
                    </Link>
                </h3>
                <Link
                    to={`/tin-tuc/${tinTuc.id}`}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                >
                    Xem thêm &rarr;
                </Link>
            </div>
        </div>
    );
};

// Component Trang Tin Tức Chính
const NewsPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<NewsFilterType>('all');

    // Gọi hook đã cập nhật
    const { data: paginatedData, isLoading, isError, error } = useListTinTuc(page, activeTab);

    const tinTucList = paginatedData?.data ?? [];
    const totalPages = paginatedData?.last_page ?? 1;

    const handleTabClick = (tab: NewsFilterType) => {
        setActiveTab(tab);
        setPage(1); // Reset về trang 1 khi đổi tab
    };

    // Định nghĩa các tab
    const tabs: { key: NewsFilterType; label: string }[] = [
        { key: 'all', label: 'Tất Cả' },
        { key: 'uu_dai', label: 'Ưu Đãi' },
        { key: 'su_kien', label: 'Sự Kiện' },
        { key: 'tin_tuc', label: 'Tin Tức' },
    ];

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
                    Tin Tức & Ưu Đãi
                </h1>

                {/* Thanh Tabs để lọc */}
                <div className="flex justify-center mb-8">
                    <div className="flex flex-wrap justify-center space-x-1 sm:space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabClick(tab.key)}
                                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hiển thị Loading, Error, hoặc Lưới Tin Tức */}
                {isLoading && (
                    <div className="text-center py-10 text-gray-600 dark:text-gray-400">Đang tải tin tức...</div>
                )}
                {isError && (
                    <div className="text-center py-10 text-red-500">Lỗi khi tải dữ liệu: {(error as Error).message}</div>
                )}
                {!isLoading && !isError && tinTucList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tinTucList.map(tinTuc => (
                            <NewsCard key={tinTuc.id} tinTuc={tinTuc} />
                        ))}
                    </div>
                )}
                {!isLoading && !isError && tinTucList.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Không có bài viết nào thuộc mục này.
                    </div>
                )}

                {/* Phân trang */}
                <div className="mt-10 flex justify-center items-center space-x-4">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                        &larr; Trang Trước
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Trang {paginatedData?.current_page ?? 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages || totalPages === 0 || !paginatedData?.next_page_url}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                        Trang Sau &rarr;
                    </button>
                </div>

            </div>
        </div>
    );
};

export default NewsPage;

