import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Ẩn menu khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    navigate("/dang-nhap");
  };

  // 🟣 Nếu chưa đăng nhập → hiện nút Đăng nhập & Đăng ký
  if (!user) {
    return (
      <div className="d-flex align-items-center gap-3">
        <Link
          to="/dang-nhap"
          className="d-flex align-items-center gap-2 px-3 py-2"
          style={{
            color: "black",
            cursor: "pointer",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "15px",
            transition: "color 0.2s ease",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#8000ff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
        >
          <User size={20} />
          <span>Đăng nhập</span>
        </Link>

        <Link
          to="/dang-ky"
          className="d-flex align-items-center gap-2 px-3 py-2"
          style={{
            color: "black",
            cursor: "pointer",
            borderRadius: "6px",
            fontWeight: "500",
            fontSize: "15px",
            transition: "color 0.2s ease",
            textDecoration: "none",
            border: "1px solid #8000ff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8000ff";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "black";
          }}
        >
          <User size={20} />
          <span>Đăng ký</span>
        </Link>
      </div>
    );
  }

  // 🟢 Nếu đã đăng nhập → hiện tên người dùng và menu Đăng xuất
  return (
    <div
      className="position-relative"
      ref={menuRef}
      style={{ zIndex: 999 }}
    >
      <div
        className="d-flex align-items-center gap-2 px-3 py-2"
        style={{
          color: "black",
          cursor: "pointer",
          borderRadius: "6px",
          fontWeight: "500",
          fontSize: "15px",
          transition: "color 0.2s ease",
        }}
        onClick={() => setShowMenu(!showMenu)}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#8000ff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
      >
        <User size={20} />
        <span>{user.ten}</span>
      </div>

      {showMenu && (
        <div
          className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 py-2"
          style={{
            minWidth: "160px",
            top: "100%",
            right: 0,
            zIndex: 9999,
          }}
        >
          <button
            onClick={handleLogout}
            className="d-flex align-items-center gap-2 w-100 px-3 py-2 text-start border-0 bg-transparent"
            style={{
              color: "#333",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f3f3")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
}
