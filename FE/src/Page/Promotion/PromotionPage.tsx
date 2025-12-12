import React, { useState } from "react";
import { message } from "antd";
import { useListVouchers } from "../../hook/useVoucher";
import type { Voucher } from "../../types/Voucher";

const VoucherCard: React.FC<{ voucher: Voucher }> = ({ voucher }) => {
  const getImageUrl = (img: string | undefined) => {
    if (!img) return "https://placehold.co/600x400?text=Voucher";

    if (img.startsWith("http")) return img;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    return `${baseUrl}/storage/${img.replace("vouchers/", "vouchers/")}`;
  };



  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.ma);
    message.success(`Đã sao chép mã: ${voucher.ma}`);
  };

  const displayDiscount = () => {
    if (voucher.phan_tram_giam) return `GIẢM ${voucher.phan_tram_giam}%`;
    if (voucher.giam_toi_da)
   return `GIẢM TỚI ${Number(voucher.giam_toi_da).toLocaleString("vi-VN")}đ`;
 return "ƯU ĐÃI ĐẶC BIỆT";
  };

  const isHot = voucher.phan_tram_giam && voucher.phan_tram_giam >= 30;

  return (
    <div className="position-relative overflow-hidden rounded-3 shadow-lg hover-shadow border-0 h-100">
      {isHot && (
        <div className="position-absolute top-0 start-0 z-3">
          <span className="badge bg-danger fs-6 px-3 py-2 rounded-bottom-end shadow">
            <i className="fa-solid fa-fire me-1"></i> HOT
          </span>
        </div>
      )}

      <div className="overflow-hidden" style={{ height: "200px" }}>
        <img
          src={getImageUrl(voucher.image)}
          alt={voucher.ma}
          className="w-100 h-100 object-fit-cover transition-transform duration-500 hover-scale"
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-gradient-primary text-white fs-5 px-4 py-3 shadow-lg fw-bold">
            {displayDiscount()}
          </span>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-4 bg-white">
        <h4 className="card-title fw-bold text-primary mb-3">
          MÃ: <span className="text-danger fs-3">{voucher.ma}</span>
        </h4>

        <div className="text-muted small mb-3 flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <i className="fa-solid fa-calendar-check text-success me-2"></i>
            <span>
              Hiệu lực từ:{" "}
              {new Date(voucher.ngay_bat_dau).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <i className="fa-solid fa-clock text-danger me-2"></i>
            <span>
              Hết hạn:{" "}
              {new Date(voucher.ngay_ket_thuc).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {voucher.gia_tri_don_hang_toi_thieu ? (
            <div className="text-warning fw-semibold mt-3">
              <i className="fa-solid fa-tag me-2"></i>
              Đơn tối thiểu:{" "}
              {Number(voucher.gia_tri_don_hang_toi_thieu).toLocaleString("vi-VN")}đ
            </div>
          ) : null}
        </div>

        <button
          onClick={handleCopyCode}
          className="btn btn-lg btn-outline-primary border-2 fw-bold d-flex align-items-center justify-content-center gap-2 mt-auto hover-lift"
        >
          <i className="fa-regular fa-copy fs-5"></i>
          LẤY MÃ NGAY
        </button>
      </div>
    </div>
  );
};

const PromotionPage: React.FC = () => {
  const { data: vouchers, isLoading, isError } = useListVouchers();
  const [searchTerm, setSearchTerm] = useState("");

  const validVouchers =
    vouchers?.filter((v) => {
      const now = new Date();
      const endDate = new Date(v.ngay_ket_thuc);
      const isActive =
        v.trang_thai === 1 || String(v.trang_thai) === "KÍCH HOẠT";
      const isNotExpired = endDate >= now;
      const matchesSearch = v.ma
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return isActive && isNotExpired && matchesSearch;
    }) || [];

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />

      <style>{`
        .hover-scale:hover {
          transform: scale(1.1);
        }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .hover-shadow {
          transition: all 0.4s ease;
        }
        .hover-shadow:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>

      <div className="min-vh-100 bg-light py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <p className="lead text-muted">
              Săn ngay mã giảm giá vé phim & bắp nước tại{" "}
              <strong className="text-danger">TicketPop</strong>
            </p>
          </div>

          <div className="row justify-content-center mb-5">
            <div className="col-lg-6">
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-0">
                  <i className="fa-solid fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-0"
                  placeholder="Nhập mã voucher cần tìm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "4rem", height: "4rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {isError && (
            <div className="alert alert-danger text-center py-5">
              <i className="fa-solid fa-triangle-exclamation fa-3x mb-3"></i>
              <h4>Không thể tải danh sách voucher</h4>
              <p>Vui lòng thử lại sau vài phút nhé!</p>
            </div>
          )}

          {!isLoading && !isError && validVouchers.length > 0 && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {validVouchers.map((voucher) => (
                <div key={voucher.id} className="col">
                  <VoucherCard voucher={voucher} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !isError && validVouchers.length === 0 && (
            <div className="text-center py-5 my-5">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-9887663-8004739.png"
                alt="Không có voucher"
                className="img-fluid mb-4"
                style={{ maxWidth: "300px" }}
              />
              <h3 className="text-muted fw-bold">
                Hiện chưa có voucher nào khả dụng
              </h3>
              <p className="text-muted">
                Hãy quay lại thường xuyên để săn deal hot nhé!
              </p>
              <button
                className="btn btn-primary btn-lg mt-3"
                onClick={() => window.location.reload()}
              >
                <i className="fa-solid fa-rotate-right me-2"></i>
                Tải lại trang
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PromotionPage;
