export interface LichChieu {
  id: number;
  phim_id: number;
  phong_id: number;
  phien_ban_id: number | null;
  gio_chieu: string;
  gio_ket_thuc: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;

  // 🔹 Quan hệ (theo đúng JSON API Laravel trả về)
  phim?: {
    id: number;
    ten_phim: string;
  };

  phong?: {
    id: number;
    ten_phong: string;
  };

  phien_ban?: {
    id: number;
    the_loai: string; // ⚠️ backend dùng “the_loai”, không phải “ten_phien_ban”
  };

  gia_ve?: {
    id: number;
    gia_ve: number;
  };
}
