import React from "react";
import Navbar from "./Component/Navbar";
import SearchBar from "./Component/Search";
import Logo from "../Logo/Logo";
import LoginButton from "../../../Layout/ClientLayout/Header/Component/LoginBtn";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="header-bg">
      <div className="header-top">
        <div className="header-left">
          <Logo />
        </div>

        <div className="header-right">
          <SearchBar />
          <LoginButton />
        </div>
      </div>

      <div className="header-nav">
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
