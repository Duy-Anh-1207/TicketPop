export interface TinTuc {
  id: number;
  tieu_de: string;
  noi_dung: string;
  hinh_anh: string | null;
  type: 'tin_tuc' | 'uu_dai' | 'su_kien';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaginatedTinTuc {
  current_page: number;
  data: TinTuc[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}