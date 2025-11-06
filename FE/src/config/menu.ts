// src/config/menu.ts
export type SidebarChild = {
  id: number;
  name: string;
  route: string;
  requiredActions: number[]; // số: 1=Thêm,2=Sửa,3=Xóa,4=Xem
};

export type SidebarMenu = {
  id: number; // phải khớp menu_id backend
  title: string;
  icon?: string;
  children?: SidebarChild[];
};

export const SIDEBAR_MENU: SidebarMenu[] = [
  {
    id: 1,
    title: "Quản lý phim",
    icon: "solar:smart-speaker-minimalistic-line-duotone",
    children: [
      { id: 11, name: "Danh sách phim", route: "/admin/phim", requiredActions: [4] },
      { id: 12, name: "Thêm phim", route: "/admin/phim/them", requiredActions: [1] },
    ],
  },
  {
    id: 2,
    title: "Quản lý thể loại",
    icon: "solar:pie-chart-3-line-duotone",
    children: [
      { id: 21, name: "Danh sách thể loại", route: "/admin/the-loai", requiredActions: [4] },
      { id: 22, name: "Thêm thể loại", route: "/admin/the-loai/them", requiredActions: [1] },
    ],
  },
  {
    id: 3,
    title: "Quản lý phòng chiếu",
    icon: "solar:calendar-mark-line-duotone",
    children: [
      { id: 31, name: "Danh sách phòng", route: "/admin/roomxb", requiredActions: [4] },
      { id: 32, name: "Thêm phòng", route: "/admin/room/them-moi", requiredActions: [1] },
    ],
  },
  
  
];
