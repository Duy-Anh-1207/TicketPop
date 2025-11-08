export interface LichChieu {
  id: number;
  phim_id: number;
  phong_id: number;
  phien_ban_id: number | null;
  gio_chieu: string;
  gio_ket_thuc: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null | undefined;


  phim?: {
    id: number;
    ten_phim: string;
    thoi_luong:string;
    anh_poster:string;
  };

  phong?: {
    id: number;
    ten_phong: string;
    hang_thuong:number;
    hang_vip:number;
  };

  phien_ban?: {
    id: number;
    the_loai: string; 
  };

  gia_ve?: {
    id: number;
    gia_ve: number;
  };
  
}
