import React, { useState, useEffect } from 'react';
import { useListBanners } from "../../../../hook/BannerHook";
import { motion, AnimatePresence } from "framer-motion";

const Banner: React.FC = () => {
  const { data: banners, isLoading } = useListBanners();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners && banners.length > 1) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % banners.length);
      }, 4000); // đổi banner sau 4 giây
      return () => clearInterval(interval);
    }
  }, [banners]);

  if (isLoading) return <div className="text-center py-8">Đang tải banners...</div>;
  if (!banners || banners.length === 0) return <div className="text-center py-8">Không có banner nào</div>;

  return (
    <div className="relative w-full max-w-[1214px] mx-auto overflow-hidden rounded-2xl shadow-lg mt-4">
      <AnimatePresence mode="wait">
        <motion.img
          key={banners[index].id}
          src={banners[index].image_url}
          alt={banners[index].title}
          className="w-full h-auto object-cover rounded-2xl"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Dấu chấm chuyển banner */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {banners.map((_, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              i === index ? 'bg-white' : 'bg-gray-400 opacity-70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
