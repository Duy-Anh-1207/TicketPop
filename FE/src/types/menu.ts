export interface Menu {
  id: number;
  ma_chuc_nang: string;
  ma_cha: string | null;
  ten_chuc_nang: string;
  state?: string;
  path?: string;
  stt?: string;
  trang_thai: number;
  children?: Menu[] | null;  
  checked?: boolean;
}
