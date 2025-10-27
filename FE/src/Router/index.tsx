import { useRoutes } from "react-router-dom";
import LayoutWeb from "../Page/Layout";
import HomePage from "../Page/Home/HomePage";
import AdminLayout from "../component/Layout/AdminLayout/Admin";
import DanhSachPhimTable from "../component/Admin/Phim/ListPhim";
import UserList from "../component/Admin/User/ListUser";
import DetailUser from "../component/Admin/User/DetailUser";
import CreateUser from "../component/Admin/User/CreateUser";
import DanhSachTheLoai from "../component/Admin/TheLoai/ListTheLoai";
import PhongChieuChuaXuatBanList from "../component/Admin/Phongchieu/PhongChieuChuaXB";
import CreatePhongChieu from "../component/Admin/Phongchieu/CreatePhongChieu";
import PhongChieuList from "../component/Admin/Phongchieu/PhongChieuXB";
import VaiTroList from "../component/Admin/VaiTro/ListVaiTro";
import FoodList from "../component/Admin/Food/ListFood";
import FoodCreate from "../component/Admin/Food/CreateFood";
import Create from "../component/Admin/LichChieu/Create";
import LichChieuList from "../component/Admin/LichChieu/List";
import CreatePhim from "../component/Admin/Phim/CreatePhim";
import LichChieuDetail from "../component/Admin/LichChieu/LichChieuDetail";

const Routermain = () => {
  const element = useRoutes([
    {
      path: "/",
      element: <LayoutWeb />,
      children: [{ index: true, element: <HomePage /> }],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "phim", element: <DanhSachPhimTable /> },
        {
          path: "/admin/phim/create",
          element: <CreatePhim />,
        },
        {
          path: "/admin/phim/edit/:id",
          element: <CreatePhim />,
        },
        { path: "nguoi-dung", element: <UserList /> },
        { path: "nguoi-dung/:id", element: <DetailUser /> },
        { path: "nguoi-dung/them-moi", element: <CreateUser /> },
        { path: "vai-tro", element: <VaiTroList /> },
        { path: "the-loai", element: <DanhSachTheLoai /> },
        { path: "roomxb", element: <PhongChieuList /> },
        { path: "roomcxb", element: <PhongChieuChuaXuatBanList /> },
        { path: "room/them-moi", element: <CreatePhongChieu /> },
        { path: "room/:id", element: <CreatePhongChieu /> },
        { path: "foods", element: <FoodList /> },
        { path: "foods/them-moi", element: <FoodCreate /> },
        { path: "lich-chieu/them-moi", element: <Create /> },
        { path: "lich-chieu", element: <LichChieuList /> },
        { path: "/admin/lich-chieu/:id", element: <LichChieuDetail /> }
      ],
    },
  ]);

  return element;
};

export default Routermain;
