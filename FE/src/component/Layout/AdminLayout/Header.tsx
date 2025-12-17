import { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { useNavigate, } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/dang-nhap");
  };

  if (!user) return null;

  return (
    <header className="topbar shadow-sm bg-white">
      <div className="container-fluid">
        <div className="d-flex justify-content-end align-items-center py-2">

          {/* USER DROPDOWN */}
          <div className="position-relative" ref={menuRef}>
            <div
              className="d-flex align-items-center gap-2 cursor-pointer"
              style={{ cursor: "pointer" }}
              onClick={() => setShowMenu(!showMenu)}
            >
              <img
                src="https://bootstrapdemos.wrappixel.com/spike/dist/assets/images/profile/user-1.jpg"
                width="36"
                height="36"
                className="rounded-circle"
              />
              <div className="d-none d-md-block">
                <strong>{user.ten}</strong>
                <div className="text-muted small">
                  {user.vai_tro ?? "Người dùng"}
                </div>
              </div>
              <Icon icon="solar:alt-arrow-down-line-duotone" />
            </div>

            {showMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm"
                style={{ minWidth: 200, zIndex: 999 }}
              >
                <button
                  onClick={handleLogout}
                  className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-danger border-0 bg-transparent w-100 text-start"
                >
                  <Icon icon="solar:logout-line-duotone" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
