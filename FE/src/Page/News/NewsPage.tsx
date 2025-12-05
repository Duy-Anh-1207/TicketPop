import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useListTinTuc } from "../../hook/TinTucHook";
import type { NewsFilterType } from "../../hook/TinTucHook";
import type { TinTuc } from "../../types/tin-tuc";

const NewsCard: React.FC<{ tinTuc: TinTuc }> = ({ tinTuc }) => {
  const getImageUrl = (hinh_anh: string | null) => {
    if (!hinh_anh) return "https://placehold.co/600x400?text=No+Image";
    if (hinh_anh.startsWith("http")) return hinh_anh;
    const baseUrl = (
      import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
    ).replace("/api", "");
    return `${baseUrl}${hinh_anh.startsWith("/") ? "" : "/"}${hinh_anh}`;
  };

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "uu_dai":
        return "bg-success text-white";
      case "su_kien":
        return "bg-warning text-dark";
      default:
        return "bg-primary text-white";
    }
  };

  const formatType = (type: string) => {
    switch (type) {
      case "uu_dai":
        return "Ưu Đãi";
      case "su_kien":
        return "Sự Kiện";
      case "tin_tuc":
        return "Tin Tức";
      default:
        return "Tin Tức";
    }
  };

  return (
    <div className="card h-100 shadow-sm hover-shadow transition-all duration-300 border-0">
      <Link to={`/tin-tuc/${tinTuc.id}`} className="text-decoration-none">
        <div className="position-relative overflow-hidden">
          <img
            src={getImageUrl(tinTuc.hinh_anh)}
            className="card-img-top"
            alt={tinTuc.tieu_de}
            style={{ height: "220px", objectFit: "cover" }}
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/600x400?text=No+Image")
            }
          />
          <div className="position-absolute top-0 start-0 p-3">
            <span
              className={`badge rounded-pill px-3 py-2 ${getBadgeClass(
                tinTuc.type
              )}`}
            >
              {formatType(tinTuc.type)}
            </span>
          </div>
        </div>
      </Link>

      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-3">
          <Link
            to={`/tin-tuc/${tinTuc.id}`}
            className="text-decoration-none text-dark hover-text-primary line-clamp-2"
          >
            {tinTuc.tieu_de}
          </Link>
        </h5>

        <div className="mt-auto">
          <Link
            to={`/tin-tuc/${tinTuc.id}`}
            className="text-primary fw-medium text-decoration-none d-flex align-items-center gap-1 hover-text-primary-dark"
          >
            Xem thêm
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

const NewsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<NewsFilterType>("all");
  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
  } = useListTinTuc(page, activeTab);

  const tinTucList = paginatedData?.data ?? [];
  const totalPages = paginatedData?.last_page ?? 1;
  const currentPage = paginatedData?.current_page ?? 1;

  const handleTabClick = (tab: NewsFilterType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const tabs: { key: NewsFilterType; label: string }[] = [
    { key: "all", label: "Tất Cả" },
    { key: "uu_dai", label: "Ưu Đãi" },
    { key: "su_kien", label: "Sự Kiện" },
    { key: "tin_tuc", label: "Tin Tức" },
  ];

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        {/* Tiêu đề */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-3">Tin Tức & Ưu Đãi</h1>
          <p className="text-muted lead">
            Cập nhật thông tin mới nhất từ chúng tôi
          </p>
        </div>

        {/* Tabs lọc */}
        <div className="d-flex justify-content-center mb-5">
          <div className="btn-group shadow-sm" role="group">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`btn ${
                  activeTab === tab.key
                    ? "btn-primary text-white"
                    : "btn-outline-primary"
                } px-4`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading & Error */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải tin tức...</p>
          </div>
        )}

        {isError && (
          <div className="alert alert-danger text-center" role="alert">
            Lỗi khi tải dữ liệu: {(error as Error)?.message}
          </div>
        )}

        {/* Danh sách tin tức */}
        {!isLoading && !isError && tinTucList.length > 0 && (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {tinTucList.map((tinTuc) => (
              <div key={tinTuc.id} className="col">
                <NewsCard tinTuc={tinTuc} />
              </div>
            ))}
          </div>
        )}

        {/* Không có dữ liệu */}
        {!isLoading && !isError && tinTucList.length === 0 && (
          <div className="text-center py-5">
            <div className="bg-light rounded-3 p-5">
              <i className="bi bi-newspaper display-1 text-muted opacity-25"></i>
              <p className="mt-4 text-muted fs-5">
                Không có bài viết nào thuộc mục này.
              </p>
            </div>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation" className="mt-5">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <i className="bi bi-chevron-left"></i> Trước
                </button>
              </li>

              <li className="page-item disabled">
                <span className="page-link">
                  Trang {currentPage} / {totalPages}
                </span>
              </li>

              <li
                className={`page-item ${page === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Sau <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* CSS tùy chỉnh nhẹ (có thể bỏ vào file CSS riêng) */}
      <style>{`
        .hover-shadow:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-4px);
        }
        .card-img-top {
          transition: transform 0.4s ease;
        }
        .card:hover .card-img-top {
          transform: scale(1.05);
        }
        .hover-text-primary:hover {
          color: #0d6efd !important;
        }
        .hover-text-primary-dark:hover {
          color: #0b5ed7 !important;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default NewsPage;
