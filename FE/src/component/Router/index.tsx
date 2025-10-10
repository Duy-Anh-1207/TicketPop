<<<<<<< HEAD
import { useRoutes } from "react-router-dom"
import DanhSachPhim from "../Admin/Phim/ListPhim"
import AdminLayout from "../Layout/AdminLayout/Admin"



=======
import { useRoutes } from "react-router-dom";
import DanhSachPhim from "../Admin/Phim/ListPhim";
import DanhSachNguoiDung from "../Admin/User/ListUser";
import AdminLayout from "../Layout/AdminLayout/Admin";
import DetailUser from "../Admin/User/DetailUser";
import CreateUser from "../Admin/User/CreateUser";
>>>>>>> cfed1d3e82ae3a6ee389aaddb71003236ff80442
const Routermain = () => {
  const element = useRoutes([
    {
      path: "/admin",
<<<<<<< HEAD
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
=======
      element: <AdminLayout />,
      children: [
        { path: "phim", element: <DanhSachPhim /> },
        { path: "nguoi-dung", element: <DanhSachNguoiDung /> },
        { path: "nguoi-dung/:id", element: <DetailUser /> },
        { path: "nguoi-dung/them-moi", element: <CreateUser/> }
      ],
    },
  ]);

  return element;
};

export default Routermain;
>>>>>>> cfed1d3e82ae3a6ee389aaddb71003236ff80442
