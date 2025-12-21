import React, { useState } from "react";
import { message } from "antd";
import { useListVouchers } from "../../hook/useVoucher";
import type { Voucher } from "../../types/Voucher";

/* ===================== VOUCHER CARD ===================== */
const VoucherCard: React.FC<{ voucher: Voucher }> = ({ voucher }) => {
  const getImageUrl = (img?: string) => {
    if (!img) return "https://placehold.co/600x400?text=Voucher";
    if (img.startsWith("http")) return img;
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
    return `${baseUrl}/storage/${img}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.ma);
    message.success(`Đã sao chép mã: ${voucher.ma}`);
  };

  const displayDiscount = () => {
    if (voucher.phan_tram_giam)
      return `GIẢM ${voucher.phan_tram_giam}%`;
    if (voucher.giam_toi_da)
      return `GIẢM TỚI ${Number(voucher.giam_toi_da).toLocaleString("vi-VN")}đ`;
    return "ƯU ĐÃI ĐẶC BIỆT";
  };

  const isHot =
    voucher.phan_tram_giam && voucher.phan_tram_giam >= 30;

  const daDung = voucher.so_lan_da_su_dung ?? 0;
  const toiDa = voucher.so_lan_su_dung; // có thể null
  const isOut =
    typeof toiDa === "number" && daDung >= toiDa;

  

  return (
    <div className="position-relative overflow-hidden rounded-4 shadow-lg h-100 bg-white">
      {/* HOT */}
      {isHot && (
        <div className="position-absolute top-0 start-0 z-3">
          <span className="badge bg-danger px-3 py-2 rounded-bottom-end fs-6">
            🔥 HOT
          </span>
        </div>
      )}

      {/* IMAGE */}
      <div className="position-relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={getImageUrl(voucher.image)}
          alt={voucher.ma}
          className="w-100 h-100 object-fit-cover"
        />

        {/* DISCOUNT BADGE */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-primary fs-6 px-3 py-2 fw-bold shadow">
            {displayDiscount()}
          </span>
        </div>

        {/* USAGE BADGE */}
        <div className="position-absolute bottom-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-75 px-3 py-2">
            {daDung}/{toiDa ?? "∞"} lượt
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="p-4 d-flex flex-column h-100">
        <h4 className="fw-bold text-primary mb-2">
          MÃ: <span className="text-danger">{voucher.ma}</span>
        </h4>

        {/* DATE */}
        <div className="small text-muted mb-2">
          <div className="mb-1">
            <i className="fa-solid fa-calendar-check me-2 text-success"></i>
            Từ{" "}
            {new Date(voucher.ngay_bat_dau).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <i className="fa-solid fa-clock me-2 text-danger"></i>
            Đến{" "}
            {new Date(voucher.ngay_ket_thuc).toLocaleDateString("vi-VN")}
          </div>
        </div>

        {/* MIN ORDER */}
        {voucher.gia_tri_don_hang_toi_thieu && (
          <div className="fw-semibold text-warning mb-3">
            <i className="fa-solid fa-tag me-2"></i>
            Đơn tối thiểu:{" "}
            {Number(voucher.gia_tri_don_hang_toi_thieu).toLocaleString(
              "vi-VN"
            )}
            đ
          </div>
        )}

        {/* USAGE INFO */}
        {/* <div className="mt-auto mb-3">
          <div className="d-flex justify-content-between small">
            <span className="text-muted">Đã sử dụng</span>
            <strong>{daDung}</strong>
          </div>
          <div className="d-flex justify-content-between small">
            <span className="text-muted">Lượt tối đa</span>
            <strong>{toiDa ?? "Không giới hạn"}</strong>
          </div>

          {typeof toiDa === "number" && (
            <div className="progress mt-2" style={{ height: 6 }}>
              <div
                className={`progress-bar ${percent >= 80 ? "bg-danger" : "bg-primary"
                  }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
        </div> */}

        {/* BUTTON */}
        <button
          onClick={handleCopyCode}
          disabled={isOut}
          className={`btn btn-lg fw-bold ${isOut ? "btn-secondary" : "btn-outline-primary"
            }`}
        >
          <i className="fa-regular fa-copy me-2"></i>
          {isOut ? "HẾT LƯỢT" : "SAO CHÉP MÃ"}
        </button>
      </div>
    </div>
  );
};

/* ===================== PAGE ===================== */
const PromotionPage: React.FC = () => {
  const { data: vouchers, isLoading, isError } = useListVouchers();
  const [searchTerm, setSearchTerm] = useState("");

  const validVouchers =
    vouchers?.filter((v) => {
      const now = new Date();
      const end = new Date(v.ngay_ket_thuc);
      const active =
        v.trang_thai === 1 || String(v.trang_thai) === "KÍCH HOẠT";
      return (
        active &&
        end >= now &&
        v.ma.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  return (
    <div className="promo-bg">
      <div className="container py-5">
        {/* TITLE */}
        <div className="text-center text-white mb-5">
          <h1 className="fw-bold display-5">Khuyến Mãi & Voucher</h1>
          <p className="opacity-75">
            Săn mã giảm giá tại
            <strong className="text-warning ms-2">
              TicketPop
            </strong>
          </p>
        </div>

        {/* SEARCH */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-6">
            <div className="input-group input-group-lg shadow">
              <span className="input-group-text bg-white border-0">
                🔍
              </span>
              <input
                className="form-control border-0"
                placeholder="Nhập mã voucher..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {isLoading && (
          <div className="text-center text-white">
            <div className="spinner-border" />
          </div>
        )}

        {isError && (
          <div className="alert alert-danger text-center">
            Không thể tải voucher
          </div>
        )}

        {!isLoading && !isError && validVouchers.length > 0 && (
          <div className="row g-4">
            {validVouchers.map((v) => (
              <div className="col-md-6 col-lg-4" key={v.id}>
                <VoucherCard voucher={v} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && validVouchers.length === 0 && (
          <div className="text-center text-white">
            <h4>Chưa có voucher khả dụng</h4>
          </div>
        )}
      </div>

    </div>
  );
};

export default PromotionPage;
