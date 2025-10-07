import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "../../../App.css";

const AdminLayout: React.FC = () => {
  return (
    <div id="main-wrapper" className="flex flex-col min-h-screen bg-gray-100">
      <Sidebar />
      <div className="page-wrapper flex-1 ml-64">
        <div className="body-wrapper">
          <div className="container-fluid">
            <Header />
            <div className="mt-4 bg-white rounded-lg shadow-md p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <div className="dark-transparent sidebartoggler"></div>
    </div>
  );
};

export default AdminLayout;
