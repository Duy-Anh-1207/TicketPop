import { useRoutes } from "react-router-dom";

//Client
//Payment
import Payment from "../Page/Payment/Payment";
import PaymentResult from "../Page/PaymentResult";
//Home
import LayoutWeb from "../Page/Layout";
import HomePage from "../Page/Home/HomePage";
import AdminLayout from "../component/Layout/AdminLayout/Admin";
import MovieDetail from "../Page/MovieDetail/MovieDetail";
import Booking from "../Page/Booking/Booking";

// Auth
import Login from "../component/Auth/DangNhap";
import Register from "../component/Auth/DangKy";
import VerifyCode from "../component/Auth/VerifyRegister";

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

// Voucher
import ListVoucher from "../component/Admin/Voucher/ListVoucher";
import CreateVoucher from "../component/Admin/Voucher/CreateVoucher";
import EditVoucher from "../component/Admin/Voucher/EditVoucher";
import ViewVoucher from "../component/Admin/Voucher/ViewVoucher";

// Tin tức
import TinTucList from "../component/Admin/TinTuc/ListTinTuc";
import CreateTinTuc from "../component/Admin/TinTuc/CreateTinTuc";
import DetailTinTuc from "../component/Admin/TinTuc/DetailTinTuc";
import LichChieuDetail from "../component/Admin/LichChieu/LichChieuDetail";
import DeletedLichChieuList from "../component/Admin/LichChieu/DeletedLichChieuList";

// import EditLichChieu from "../component/Admin/LichChieu/Show";
import ProtectedRouteAdmin from "../component/Auth/ProtectedRouteAdmin";
import MenuList from "../component/Admin/Menu/MenuList";
import MenuCreate from "../component/Admin/Menu/MenuCreate";

// Banner
import BannerList from "../component/Admin/Banner/ListBanner";
import CreateBanner from "../component/Admin/Banner/CreateBanner";

//Thống kê
import ThongKeVe from "../component/Admin/ThongKe/ThongKeVe";
import ThongKeDoanhThu from "../component/Admin/ThongKe/ThongKeDoanhThu";
//Dashbroad
import Dashbroad from "../component/Admin/Dashboard/Dashboard";

//Tin tức (CLIENT)
import NewsPage from "../Page/News/NewsPage";
import NewsDetailPage from "../Page/News/NewsDetailPage";
import TimKiemPage from "../Page/TimKiemPage/TimKiemPage";
import PhimDangChieu from "../Page/Paging/PhimDangChieu";
import PhimSapChieu from "../Page/Paging/PhimSapChieu";
import MyAccountPage from "../Page/Profile/MyAccountPage";
import ListDonVe from "../component/Admin/DonVe/ListDonVe";
import ChiTietDonVe from "../component/Admin/DonVe/ChiTietDonVe";
import PromotionPage from "../Page/Promotion/PromotionPage";



const Routermain = () => {
  const element = useRoutes([
    // ✅ Route đăng nhập (ngoài layout)
    { path: "/dang-nhap", element: <Login /> },

    { path: "/dang-ky", element: <Register /> },

    { path: "/verify-code", element: <VerifyCode /> },
    // ✅ Trang hiển thị kết quả sau khi MoMo redirect
    { path: "ket-qua-thanh-toan", element: <PaymentResult /> },
    // Route chính website (client)
    {
      path: "/",
      element: <LayoutWeb />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "phim/:slug", element: <MovieDetail /> },
        { path: "booking/:slug", element: <Booking /> },
        { path: "thong-tin-tai-khoan", element: <MyAccountPage /> },
        { path: "dang-chieu", element: <PhimDangChieu /> },
        { path: "sap-chieu", element: <PhimSapChieu /> },


        // ✅ Thêm route tin tức cho CLIENT
        { path: "tin-tuc", element: <NewsPage /> },
        { path: "tin-tuc/:id", element: <NewsDetailPage /> },


        { path: "thong-tin-tai-khoan", element: <MyAccountPage /> },

        { path: "khuyen-mai", element: <PromotionPage /> },


        { path: "booking/:slug", element: <Booking /> },
        { path: "booking/payment", element: <Payment /> },
        { path: "/tim-kiem", element: <TimKiemPage /> },
      ],
    },

    // Route admin
    {
      path: "/admin",
      element: (
        <ProtectedRouteAdmin>
          <AdminLayout />
        </ProtectedRouteAdmin>
      ),
      children: [
        // Phim
        { path: "phim", element: <DanhSachPhimTable /> },
        { path: "phim/create", element: <CreatePhim /> },
        { path: "phim/edit/:id", element: <CreatePhim /> },

        // Người dùng
        { path: "nguoi-dung", element: <UserList /> },
        { path: "nguoi-dung/:id", element: <DetailUser /> },
        { path: "nguoi-dung/them-moi", element: <CreateUser /> },

        // Vai trò
        { path: "vai-tro", element: <VaiTroList /> },

        { path: "menu", element: <MenuList /> },
        { path: "menu/create", element: <MenuCreate /> },

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
        // { path: "lich-chieu/chi-tiet/:id", element: <EditLichChieu /> },
        { path: "lich-chieu/:id", element: <LichChieuDetail /> },
        { path: "lich-chieu/deleted", element: <DeletedLichChieuList /> },

        // Voucher
        { path: "vouchers", element: <ListVoucher /> },
        { path: "vouchers/them-moi", element: <CreateVoucher /> },
        { path: "vouchers/edit/:id", element: <EditVoucher /> },
        { path: "vouchers/view/:id", element: <ViewVoucher /> },

        // Tin tức
        { path: "tin-tuc", element: <TinTucList /> },
        { path: "tin-tuc/them-moi", element: <CreateTinTuc /> },
        { path: "tin-tuc/:id", element: <DetailTinTuc /> },

        // Banner
        { path: "banners", element: <BannerList /> },
        { path: "banners/them-moi", element: <CreateBanner /> },
        // Thống kê
        { path: "thong-ke/ve", element: <ThongKeVe /> },
        { path: "thong-ke/doanh-thu", element: <ThongKeDoanhThu /> },
        //dashbroad
        { path: "dashboard", element: <Dashbroad /> },
        { path: "ve", element: <ListDonVe /> }, 
        { path: "ve/:id", element: <ChiTietDonVe /> },


      ],
    },
  ]);

  return element;
};

export default Routermain;
