import React, { useState, useEffect } from "react";
import { useListBanners } from "../../../../hook/BannerHook";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Banner.css";

const Banner: React.FC = () => {
  const { data: banners, isLoading } = useListBanners();
  const [index, setIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (isLoading) return <div className="banner-loading">Đang tải banners...</div>;
  if (!banners || banners.length === 0) return <div className="banner-loading">Không có banner nào</div>;

  const prevBanner = () => setIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const nextBanner = () => setIndex((prev) => (prev + 1) % banners.length);

  return (
    <div className="banner-container">
      {/* Container trượt ngang */}
      <div
        className="banner-slide"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="banner-slide-item">
            <img
              src={`http://127.0.0.1:8000${banner.image_url}`}
              alt={banner.title}
              className="banner-image"
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <button
        onClick={prevBanner}
        className="banner-btn banner-btn-left"
        style={{ visibility: index === 0 ? "hidden" : "visible" }}
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextBanner}
        className="banner-btn banner-btn-right"
        style={{ visibility: index === banners.length - 1 ? "hidden" : "visible" }}
      >
        <ChevronRight size={28} />
      </button>


      {/* Dots */}
      <div className="banner-dots">
        {banners.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`banner-dot ${i === index ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
