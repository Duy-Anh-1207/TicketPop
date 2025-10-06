import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api/phim"; // Địa chỉ backend

const PhimList: React.FC = () => {
  const [phims, setPhims] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setPhims(data));
  }, []);

  return (
    <div>
      <h2>Danh sách phim
      </h2>
      <ul>
  {Array.isArray(phims) && phims.length > 0 ? (
    phims.map((phim: any) => (
      <li key={phim.id}>
        <strong>{phim.ten_phim}</strong>
        {typeof phim.thoi_luong === "number" && ` — ${phim.thoi_luong} phút`}
        {phim.ngay_cong_chieu && ` — ${new Date(phim.ngay_cong_chieu).toLocaleDateString("vi-VN")}`}
      </li>
    ))
  ) : (
    <li>Chưa có phim nào.</li>
  )}
</ul>

    </div>
  );
};

export default PhimList;