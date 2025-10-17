import { User } from "lucide-react";

export default function LoginButton() {
  return (
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
      onMouseEnter={(e) => (e.currentTarget.style.color = "#8000ff")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
    >
      <User size={20} /> 
      <span>Đăng nhập</span>
    </div>
  );
}
