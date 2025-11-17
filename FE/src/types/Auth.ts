// src/types/Auth.ts
export type PermissionItem = {
  menu_id: number;
  chuc_nang: string[]; // ví dụ ["1","2","4"]
};

export type LoginData = {
  id: number;
  ten: string;
  email: string;
  so_dien_thoai?: string | null;
  vai_tro: string;
  vai_tro_id: number;
  can_access_admin: boolean;
  token: string;
  redirect_url?: string;
  permissions: PermissionItem[];
};

export type ApiLoginResponse = {
  status: boolean;
  message: string;
  data: LoginData;
};
