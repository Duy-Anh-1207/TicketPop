import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useListTinTuc, useDeleteTinTuc } from '../../../hook/TinTucHook';
import type { TinTuc } from '../../../types/tin-tuc';

// Helper hiển thị tên type đẹp hơn

export default function ListTinTuc() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading, isError } = useListTinTuc(page, 'all');
    const deleteTinTuc = useDeleteTinTuc();

    if (isLoading) return <p className="text-center">Đang tải danh sách...</p>;
    if (isError) return <p className="text-center text-danger">Lỗi khi tải dữ liệu</p>;

    const tinTucList: TinTuc[] = paginatedData?.data ?? [];
    const totalPages = paginatedData?.last_page ?? 1;

    const handleDelete = (id: number, tieuDe: string) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: `Bạn sẽ không thể khôi phục tin tức: "${tieuDe}"!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Vâng, xóa nó!',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTinTuc.mutate(id);
            }
        });
    };

    return (
        <div className="container p-4">
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h2>Quản lý Tin Tức & Ưu Đãi</h2>
                <button
                    className="btn btn-success"
                    onClick={() => navigate(`/admin/tin-tuc/them-moi`)}
                >
                    Thêm tin tức
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered mx-auto">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">ID</th>
                            <th className="text-center">Tiêu đề</th>
                            <th className="text-center">Nội dung</th>
                            <th className="text-center">Hình ảnh</th>
                            <th className="text-center">Ngày tạo</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tinTucList.length > 0 ? tinTucList.map((tinTuc) => (
                            <tr key={tinTuc.id}>
                                <td className="text-center">{tinTuc.id}</td>
                                <td className="text-center">{tinTuc.tieu_de}</td>
                                <td className="text-center">
                                    {tinTuc.noi_dung.replace(/<[^>]+>/g, '').slice(0, 50)}...
                                </td>
                                <td className="text-center">
                                    {tinTuc.hinh_anh ? (
                                        <img
                                            src={`http://localhost:8000${tinTuc.hinh_anh}`}
                                            alt={tinTuc.tieu_de}
                                            style={{ width: 50, height: 50, objectFit: 'cover' }}
                                        />
                                    ) : 'Không có'}
                                </td>
                                <td className="text-center">
                                    {new Date(tinTuc.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="text-center">
                                    <div className="dropup position-static">
                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <i className="fa-solid fa-ellipsis-vertical"></i>
                                        </button>
                                        <ul className="dropdown-menu" style={{ minWidth: '220px' }}>
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => navigate(`/admin/tin-tuc/${tinTuc.id}`)}
                                                >
                                                    Xem chi tiết / Sửa
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={() => handleDelete(tinTuc.id, tinTuc.tieu_de)}
                                                >
                                                    Xóa
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="text-center">Không có tin tức nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <span>
                    Hiển thị {paginatedData?.from} - {paginatedData?.to} trên tổng {paginatedData?.total}
                </span>
                <div>
                    <button
                        className="btn btn-outline-secondary btn-sm me-2"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Trước
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
}
