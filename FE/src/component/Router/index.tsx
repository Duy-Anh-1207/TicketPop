import { useRoutes } from "react-router-dom"
import DanhSachPhim from "../Admin/Phim/ListPhim"
import AdminLayout from "../Layout/AdminLayout/Admin"



const Routermain = () => {
  const element = useRoutes([
    {
      path: "/admin",
      element: (
        <AdminLayout/>
      ),
      children: [
        { path: "phim", element: <DanhSachPhim /> },
      ],
    },
  ]);
return element; 
};
export default Routermain;