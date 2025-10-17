import React from 'react';
import { useListBanners } from "../../../../hook/BannerHook";

const Banner: React.FC = () => {
  const { data: banners, isLoading } = useListBanners();

  if (isLoading) return <div style={{ textAlign:'center' }}>Đang tải banners...</div>;
  if (!banners || banners.length === 0) return <div>Không có banner nào</div>;

  const banner = banners[0];

  return (
    <div
      style={{
        width:'1214px',
        margin:'0 auto',
        position: 'relative',
        padding: '10px',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', maxWidth: '100%', overflow: 'hidden' }}>
        <img
          src={banner.image_url}
          alt={banner.title}
          style={{ width: '100%', height: 'auto' , borderRadius:'10px'}}
        />
      </div>
    </div>
  );
};

export default Banner;
