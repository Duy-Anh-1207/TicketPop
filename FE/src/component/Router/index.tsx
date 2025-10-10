import { useRoutes } from "react-router-dom";
import DanhSachPhim from "../Admin/Phim/ListPhim";
import DanhSachNguoiDung from "../Admin/User/ListUser";
import AdminLayout from "../Layout/AdminLayout/Admin";
import DetailUser from "../Admin/User/DetailUser";
import CreateUser from "../Admin/User/CreateUser";
import DanhSachTheLoai from "../Admin/TheLoai/ListTheLoai";
const Routermain = () => {
  const element = useRoutes([
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        { path: "phim", element: <DanhSachPhim /> },
        { path: "nguoi-dung", element: <DanhSachNguoiDung /> },
        { path: "nguoi-dung/:id", element: <DetailUser /> },
        { path: "nguoi-dung/them-moi", element: <CreateUser/> },
        { path: "the-loai", element: <DanhSachTheLoai /> },
      ],
    },
  ]);

  return element;
};

export default Routermain;
