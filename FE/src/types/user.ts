export interface User {
  id: number;
  ten: string;
  email: string;
  so_dien_thoai?: string | null;
  password?: string;
  anh_dai_dien?: string | null;
  trang_thai: boolean;          // ✅ boolean theo DB
  vai_tro_id: number;
  created_at: string;
  updated_at: string;
}
