
import { useState, useMemo } from "react"; 
import { useNavigate } from "react-router-dom";
import { useListVouchers, useDeleteVoucher } from "../../../hook/useVoucher";
import Swal from "sweetalert2";
import { format } from "date-fns";
import type { Voucher } from "../../../types/Voucher"; 

const ITEMS_PER_PAGE = 5;

export default function ListVoucher() {
  const navigate = useNavigate();
  const { data: allVouchers, isLoading, error } = useListVouchers();
  const { mutate: deleteVoucher, isPending: isDeleting } = useDeleteVoucher();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVouchers = useMemo(() => {
    if (!allVouchers) return [];
    return allVouchers.filter((voucher: Voucher) =>
      voucher.ma.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allVouchers, searchTerm]);

  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredVouchers.slice(start, end);
  }, [filteredVouchers, currentPage]);

  const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc muốn xóa mã giảm giá này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteVoucher(id);
      }
    });
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Lỗi khi tải danh sách mã giảm giá: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5 d-flex justify-content-between align-items-center">
          <span>Danh sách mã giảm giá</span>
          <button
            className="btn btn-light btn-sm"
            onClick={() => navigate("/admin/vouchers/them-moi")}
          >
            Thêm mã giảm giá
          </button>
        </div>

        <div className="card-body">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo mã giảm giá..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : paginatedVouchers && paginatedVouchers.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Mã</th>
                    <th scope="col">Phần trăm giảm</th>
                    <th scope="col">Ngày bắt đầu</th>
                    <th scope="col">Ngày kết thúc</th>
                    <th scope="col">Ảnh</th>
                    <th scope="col">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVouchers.map((voucher: Voucher) => (
                    <tr key={voucher.id}>
                      <td>{voucher.ma}</td>
                      <td>
                        {voucher.phan_tram_giam
                          ? `${voucher.phan_tram_giam}%`
                          : "N/A"}
                      </td>
                      <td>
                        {voucher.ngay_bat_dau
                          ? format(new Date(voucher.ngay_bat_dau), "dd/MM/yyyy")
                          : "N/A"}
                      </td>
                      <td>
                        {voucher.ngay_ket_thuc
                          ? format(
                              new Date(voucher.ngay_ket_thuc),
                              "dd/MM/yyyy"
                            )
                          : "N/A"}
                      </td>
                      <td>
                        {voucher.image ? (
                          <img
                            src={`${"http://localhost:8000/"}storage/${
                              voucher.image
                            }`}
                            alt="Voucher"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #ddd",
                            }}
                          />
                        ) : (
                          <span className="text-muted">Không có ảnh</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() =>
                            navigate(`/admin/vouchers/view/${voucher.id}`)
                          }
                          disabled={isDeleting}
                        >
                          Xem
                        </button>
                        <button
                          className="btn btn-info btn-sm me-2"
                          onClick={() =>
                            navigate(`/admin/vouchers/edit/${voucher.id}`)
                          }
                          disabled={isDeleting}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(voucher.id)}
                          disabled={isDeleting}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">Không tìm thấy mã giảm giá nào.</div>
          )}

          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                </li>
                <li className="page-item active">
                  <span className="page-link">{currentPage} / {totalPages}</span>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
}