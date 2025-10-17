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
  phim?: {
    id: number;
    ten_phim: string;
  };
  phong?: {
    id: number;
    ten_phong: string;
  };
  phienBan?: {
    id: number;
    ten_phien_ban: string;
  };
}