export interface Voucher {
  id: number;
  ma: string;
  image?: string;
  giam_toi_da?: number;
  gia_tri_don_hang_toi_thieu?: number;
  phan_tram_giam?: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  so_lan_su_dung?: number;
  so_lan_da_su_dung?: number;
  trang_thai?: number;
  created_at?: string;
  updated_at?: string;
}