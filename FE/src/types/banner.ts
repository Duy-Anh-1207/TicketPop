export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface BannerResponse {
  data: Banner[];
}