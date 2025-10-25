import { useRoutes } from "react-router-dom";

//Client
//Home
import LayoutWeb from "../Page/Layout";
import HomePage from "../Page/Home/HomePage";
import AdminLayout from "../component/Layout/AdminLayout/Admin";

//Chi tiết phim
import MovieDetail from "../Page/MovieDetail/MovieDetail";

// Phim
import DanhSachPhimTable from "../component/Admin/Phim/ListPhim";
import CreatePhim from "../component/Admin/Phim/CreatePhim";

// Người dùng
import UserList from "../component/Admin/User/ListUser";
import DetailUser from "../component/Admin/User/DetailUser";
import CreateUser from "../component/Admin/User/CreateUser";

// Thể loại
import DanhSachTheLoai from "../component/Admin/TheLoai/ListTheLoai";

// Phòng chiếu
import PhongChieuChuaXuatBanList from "../component/Admin/Phongchieu/PhongChieuChuaXB";
import CreatePhongChieu from "../component/Admin/Phongchieu/CreatePhongChieu";
import PhongChieuList from "../component/Admin/Phongchieu/PhongChieuXB";

// Vai trò
import VaiTroList from "../component/Admin/VaiTro/ListVaiTro";

// Food
import FoodList from "../component/Admin/Food/ListFood";
import FoodCreate from "../component/Admin/Food/CreateFood";

// Lịch chiếu
import Create from "../component/Admin/LichChieu/Create";
import LichChieuList from "../component/Admin/LichChieu/List";
import LichChieuDetail from "../component/Admin/LichChieu/Show";

// Voucher
import ListVoucher from "../component/Admin/Voucher/ListVoucher";
import CreateVoucher from "../component/Admin/Voucher/CreateVoucher";
import EditVoucher from "../component/Admin/Voucher/EditVoucher";
import ViewVoucher from "../component/Admin/Voucher/ViewVoucher";

// Tin tức
import TinTucList from "../component/Admin/TinTuc/ListTinTuc";
import CreateTinTuc from "../component/Admin/TinTuc/CreateTinTuc";
import DetailTinTuc from "../component/Admin/TinTuc/DetailTinTuc";

const Routermain = () => {
  const element = useRoutes([
    // Route chính website
    {
      path: "/",
      element: <LayoutWeb />,
      children: [
        { index: true, element: <HomePage /> }, 
        { path: "phim/:slug", element:<MovieDetail/> }
      ],
    },

    // Route admin
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        // Phim
        { path: "phim", element: <DanhSachPhimTable /> },
        { path: "/admin/phim/create", element: <CreatePhim /> },
        { path: "/admin/phim/edit/:id", element: <CreatePhim /> },

        // Người dùng
        { path: "nguoi-dung", element: <UserList /> },
        { path: "nguoi-dung/:id", element: <DetailUser /> },
        { path: "nguoi-dung/them-moi", element: <CreateUser /> },

        // Vai trò
        { path: "vai-tro", element: <VaiTroList /> },

        // Thể loại
        { path: "the-loai", element: <DanhSachTheLoai /> },

        // Phòng chiếu
        { path: "roomxb", element: <PhongChieuList /> },         
        { path: "roomcxb", element: <PhongChieuChuaXuatBanList /> }, 
        { path: "room/them-moi", element: <CreatePhongChieu /> },
        { path: "room/:id", element: <CreatePhongChieu /> },

        // Food
        { path: "foods", element: <FoodList /> },
        { path: "foods/them-moi", element: <FoodCreate /> },

        // Lịch chiếu
        { path: "lich-chieu", element: <LichChieuList /> },
        { path: "lich-chieu/them-moi", element: <Create /> },
        { path: "lich-chieu/chi-tiet/:id", element: <LichChieuDetail /> },

        // Voucher
        { path: "vouchers", element: <ListVoucher /> },
        { path: "vouchers/them-moi", element: <CreateVoucher /> },
        { path: "vouchers/edit/:id", element: <EditVoucher /> },
        { path: "vouchers/view/:id", element: <ViewVoucher /> },

        // Tin tức
        { path: "tin-tuc", element: <TinTucList /> },
        { path: "tin-tuc/them-moi", element: <CreateTinTuc /> },
        { path: "tin-tuc/:id", element: <DetailTinTuc /> },
      ],
    },
  ]);

  return element;
};

export default Routermain;
