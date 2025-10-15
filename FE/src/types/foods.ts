export interface Food {
  id: number;
  ten_do_an: string;
  image: string;
  mo_ta?: string;      // nullable
  gia_nhap: number;    // decimal(10,2)
  gia_ban: number;     // decimal(10,2)
  so_luong_ton: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;   // softDeletes
}