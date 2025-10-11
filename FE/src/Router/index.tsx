import { Routes, Route } from "react-router-dom";
import LayoutWeb from "../Page/Layout";
import HomePage from "../Page/Home/HomePage";
import AdminLayout from "../component/Layout/AdminLayout/Admin";
import DanhSachPhimTable from "../component/Admin/Phim/ListPhim";
import UserList from "../component/Admin/User/ListUser";
import DetailUser from "../component/Admin/User/DetailUser";
import CreateUser from "../component/Admin/User/CreateUser";

const Routermain = () => {
  return (
    <Routes>
      {/* Client layout */}
      <Route path="/" element={<LayoutWeb />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Admin layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="phim" element={<DanhSachPhimTable />} />
        <Route path="nguoi-dung" element={<UserList />} />
        <Route path="nguoi-dung/:id" element={<DetailUser />} />
        <Route path="nguoi-dung/them-moi" element={<CreateUser />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div>404 - Page not found</div>} />
    </Routes>
  );
};

export default Routermain;
