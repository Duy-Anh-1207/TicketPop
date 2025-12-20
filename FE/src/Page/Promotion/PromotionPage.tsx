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
    <div className="promo-bg">
      <div className="promo-overlay">

        <div className="container py-5">

          {/* TIÊU ĐỀ */}
          <div className="text-center text-white mb-5">
            <h1 className="display-5 fw-bold mb-3">
              Khuyến Mãi & Voucher
            </h1>
            <p className="lead opacity-75">
              Săn ngay mã giảm giá vé phim & bắp nước tại
              <strong className="text-warning ms-2">TicketPop</strong>
            </p>
          </div>

          {/* SEARCH */}
          <div className="row justify-content-center mb-5">
            <div className="col-lg-6">
              <div className="input-group input-group-lg shadow">
                <span className="input-group-text bg-white border-0">
                  <i className="fa-solid fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Nhập mã voucher cần tìm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="text-center py-5 text-white">
              <div className="spinner-border text-light" />
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="alert alert-danger text-center">
              Không thể tải danh sách voucher
            </div>
          )}

          {/* DANH SÁCH VOUCHER */}
          {!isLoading && !isError && validVouchers.length > 0 && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {validVouchers.map((voucher) => (
                <div key={voucher.id} className="col">
                  <VoucherCard voucher={voucher} />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !isError && validVouchers.length === 0 && (
            <div className="text-center py-5 text-white">
              <h3>Hiện chưa có voucher khả dụng</h3>
              <p>Hãy quay lại sau nhé!</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PromotionPage;
