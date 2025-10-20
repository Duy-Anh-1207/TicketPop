export interface Phim {
  id: number;
  ten_phim: string;
  the_loai: number[];   // sửa thành mảng số
  phien_ban: number[];
  thoi_luong: number;
  anh_poster: string;
  loai_suat_chieu: string;
  ngay_cong_chieu: Date; 
  ngay_ket_thuc: Date;
  do_tuoi_gioi_han: string;
  trailer: string;
  quoc_gia:string;
  ngon_ngu:string;
}