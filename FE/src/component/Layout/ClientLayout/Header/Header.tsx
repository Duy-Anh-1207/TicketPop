import React from "react";
import Navbar from "./Component/Navbar";
import SearchBar from "./Component/Search";
import Logo from "../Logo/Logo";
import LoginButton from "../../../Layout/ClientLayout/Header/Component/LoginBtn";

const Header: React.FC = () => {
  return (
    <header
      style={{ backgroundColor: "#ffffff", color: "#000", padding: "10px 0" }}
    >
      <div
        style={{
          width: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Logo />
        </div>
        <div style={{ display: 'flex', gap: '50px' }}>
          <div
            style={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
          >
            <SearchBar />
          </div>

          <div>
            <LoginButton />
          </div>
        </div>
      </div>

      <div style={{ width: "1200px", margin: "10px auto 0" }}>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
