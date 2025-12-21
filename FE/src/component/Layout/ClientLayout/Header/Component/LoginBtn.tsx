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
        {/* ĐĂNG NHẬP */}
        <Link
          to="/dang-nhap"
          className="d-flex align-items-center gap-2 px-3 py-2"
          style={{
            color: "#e5e7eb",
            borderRadius: "10px",
            fontWeight: 500,
            fontSize: "14px",
            textDecoration: "none",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#6366f1";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#e5e7eb";
            e.currentTarget.style.transform = "none";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        >
          <User size={22} />
          <span>Đăng nhập</span>
        </Link>

        {/* ĐĂNG KÝ */}
        <Link
          to="/dang-ky"
          className="d-flex align-items-center gap-2 px-4 py-2"
          style={{
            color: "#fff",
            borderRadius: "10px",
            fontWeight: 500,
            fontSize: "14px",
            textDecoration: "none",
            border: "1px solid rgba(99,102,241,0.6)",
            transition: "all 0.25s ease",
            boxShadow: "0 0 0 rgba(99,102,241,0)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#6366f1";
            e.currentTarget.style.borderColor = "#6366f1";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 20px rgba(99,102,241,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        >
          <User size={22} />
          <span>Đăng ký</span>
        </Link>
      </div>

    );
  }

  // 🟢 Nếu đã đăng nhập → hiện tên người dùng và menu Đăng xuất
  return (
    <div className="position-relative" ref={menuRef} style={{ zIndex: 1000 }}>
      {/* USER BUTTON */}
      <div
        className="d-flex align-items-center gap-2 px-3 py-2"
        style={{
          color: "#e5e7eb",
          cursor: "pointer",
          borderRadius: "10px",
          fontWeight: 500,
          fontSize: "14px",
          transition: "all 0.25s ease",
        }}
        onClick={() => setShowMenu(!showMenu)}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#6366f1";
          e.currentTarget.style.background = "rgba(99,102,241,0.12)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#e5e7eb";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.transform = "none";
        }}
      >
        <User size={22} />
        <span>{user.ten}</span>
      </div>


      {/* DROPDOWN */}
      {showMenu && (
        <div
          className="position-absolute end-0 mt-2 py-2"
          style={{
            minWidth: "200px",
            background: "rgba(2,6,23,0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          {/* THÔNG TIN TÀI KHOẢN */}
          <Link
            to="/thong-tin-tai-khoan"
            onClick={() => setShowMenu(false)}
            className="d-flex align-items-center gap-2 px-4 py-2"
            style={{
              color: "#e5e7eb",
              fontSize: "14px",
              textDecoration: "none",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(99,102,241,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <User size={16} />
            <span>Thông tin tài khoản</span>
          </Link>

          {/* ĐĂNG XUẤT */}
          <button
            onClick={handleLogout}
            className="d-flex align-items-center gap-2 w-100 px-4 py-2 border-0 bg-transparent"
            style={{
              color: "#f87171",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(248,113,113,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>

  );
}
