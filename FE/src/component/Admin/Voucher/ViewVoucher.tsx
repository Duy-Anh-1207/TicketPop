import { useNavigate, useParams } from "react-router-dom";
import { useVoucherDetail } from "../../../hook/useVoucher";
import { format } from "date-fns";

export default function ViewVoucher() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: voucher, isLoading: loadingDetail, error } = useVoucherDetail(id!);

  // Xử lý lỗi hoặc đang tải
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Lỗi khi tải mã giảm giá: {error.message}
        </div>
      </div>
    );
  }

  if (loadingDetail || !voucher) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white fw-semibold fs-5">
          Chi tiết Mã Giảm Giá
        </div>

        <div className="card-body">
          <div className="row">
            {/* Mã giảm giá */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Mã giảm giá</label>
              <p className="form-control-plaintext">{voucher.ma}</p>
            </div>

            {/* Phần trăm giảm */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Phần trăm giảm (%)</label>
              <p className="form-control-plaintext">
                {voucher.phan_tram_giam ? `${voucher.phan_tram_giam}%` : "N/A"}
              </p>
            </div>

            {/* Giảm tối đa */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Giảm tối đa (VNĐ)</label>
              <p className="form-control-plaintext">
                {voucher.giam_toi_da
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(voucher.giam_toi_da)
                  : "N/A"}
              </p>
            </div>

            {/* Giá trị đơn hàng tối thiểu */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Giá trị đơn hàng tối thiểu (VNĐ)</label>
              <p className="form-control-plaintext">
                {voucher.gia_tri_don_hang_toi_thieu
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(voucher.gia_tri_don_hang_toi_thieu)
                  : "N/A"}
              </p>
            </div>

            {/* Ngày bắt đầu */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày bắt đầu</label>
              <p className="form-control-plaintext">
                {voucher.ngay_bat_dau
                  ? format(new Date(voucher.ngay_bat_dau), "dd/MM/yyyy")
                  : "N/A"}
              </p>
            </div>

            {/* Ngày kết thúc */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày kết thúc</label>
              <p className="form-control-plaintext">
                {voucher.ngay_ket_thuc
                  ? format(new Date(voucher.ngay_ket_thuc), "dd/MM/yyyy")
                  : "N/A"}
              </p>
            </div>

            {/* Số lần sử dụng */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Số lần sử dụng</label>
              <p className="form-control-plaintext">
                {voucher.so_lan_su_dung ? voucher.so_lan_su_dung : "N/A"}
              </p>
            </div>

            {/* Số lần đã sử dụng */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Số lần đã sử dụng</label>
              <p className="form-control-plaintext">
                {voucher.so_lan_da_su_dung ? voucher.so_lan_da_su_dung : "0"}
              </p>
            </div>

            {/* Trạng thái */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Trạng thái</label>
              <p className="form-control-plaintext">
                {voucher.trang_thai === 1 ? "Đã kích hoạt" : "Ngừng kích hoạt"}
              </p>
            </div>

            {/* Ảnh đại diện */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ảnh đại diện</label>
              {voucher.image ? (
                <div className="mt-2">
                  <img
                    src={`http://localhost:8000/storage/${voucher.image}`}
                    alt="Voucher"
                    style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              ) : (
                <p className="form-control-plaintext">N/A</p>
              )}
            </div>

            {/* Ngày tạo */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày tạo</label>
              <p className="form-control-plaintext">
                {voucher.created_at
                  ? format(new Date(voucher.created_at), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </p>
            </div>

            {/* Ngày cập nhật */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Ngày cập nhật</label>
              <p className="form-control-plaintext">
                {voucher.updated_at
                  ? format(new Date(voucher.updated_at), "dd/MM/yyyy HH:mm")
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => navigate("/admin/vouchers")}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/admin/vouchers/edit/${id}`)}
            >
              Sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


