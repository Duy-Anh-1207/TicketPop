import React, { useState } from 'react';
import { message } from 'antd';
import { useListVouchers } from '../../hook/useVoucher';
import type { Voucher } from '../../types/Voucher';

const VoucherCard: React.FC<{ voucher: Voucher }> = ({ voucher }) => {
    
    const getImageUrl = (img: string | undefined) => {
        if (!img) return 'https://placehold.co/600x400?text=Voucher';
        if (img.startsWith('http')) return img;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace('/api', '');
        return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(voucher.ma);
        message.success(`Đã sao chép mã: ${voucher.ma}`);
    };

    const displayDiscount = () => {
        if (voucher.phan_tram_giam) return `Giảm ${voucher.phan_tram_giam}%`;
        if (voucher.giam_toi_da) return `Giảm ${voucher.giam_toi_da.toLocaleString('vi-VN')}đ`;
        return "Ưu đãi đặc biệt";
    };

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
            <div className="relative overflow-hidden aspect-[5/3]">
                <img
                    src={getImageUrl(voucher.image)}
                    alt={voucher.ma}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {displayDiscount()}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    MÃ: <span className="text-blue-600">{voucher.ma}</span>
                </h3>
                
                <div className="text-sm text-gray-600 mb-4 flex-grow">
                    <p className="mb-1">
                        <i className="fa-solid fa-calendar-check text-green-500 mr-2"></i>
                        Bắt đầu: {new Date(voucher.ngay_bat_dau).toLocaleDateString('vi-VN')}
                    </p>
                    <p>
                        <i className="fa-solid fa-clock text-red-500 mr-2"></i>
                        Kết thúc: {new Date(voucher.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-2 text-gray-500 italic text-xs">
                        *Đơn tối thiểu: {voucher.gia_tri_don_hang_toi_thieu?.toLocaleString('vi-VN')}đ
                    </p>
                </div>

                <button
                    onClick={handleCopyCode}
                    className="w-full py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-gray-300 hover:border-transparent flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-copy"></i>
                    Lưu Mã Ngay
                </button>
            </div>
        </div>
    );
};

const PromotionPage: React.FC = () => {
    const { data: vouchers, isLoading, isError } = useListVouchers();
    const [searchTerm, setSearchTerm] = useState('');

    const validVouchers = vouchers?.filter(v => {
        const now = new Date();
        const endDate = new Date(v.ngay_ket_thuc);
        const isActive = v.trang_thai === 1 || String(v.trang_thai) === 'KÍCH HOẠT';
        const isNotExpired = endDate >= now;
        const matchesSearch = v.ma.toLowerCase().includes(searchTerm.toLowerCase());
        
        return isActive && isNotExpired && matchesSearch;
    }) || [];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 uppercase tracking-wide">
                        Kho Voucher Ưu Đãi
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Săn ngay mã giảm giá vé xem phim và bắp nước độc quyền tại TicketPop. Số lượng có hạn!
                    </p>
                </div>

                <div className="flex justify-center mb-10">
                    <div className="relative w-full max-w-md">
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm mã voucher..." 
                            className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 text-red-500 bg-white rounded-lg shadow p-8">
                        <i className="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
                        <p>Không thể tải danh sách khuyến mãi lúc này.</p>
                    </div>
                ) : validVouchers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {validVouchers.map(voucher => (
                            <VoucherCard key={voucher.id} voucher={voucher} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-gray-100">
                        <img 
                            src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" 
                            alt="Empty" 
                            className="w-48 mx-auto opacity-50 mb-4"
                        />
                        <h3 className="text-xl font-semibold text-gray-600">Hiện chưa có voucher nào khả dụng</h3>
                        <p className="text-gray-400 mt-2">Vui lòng quay lại sau nhé!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionPage;