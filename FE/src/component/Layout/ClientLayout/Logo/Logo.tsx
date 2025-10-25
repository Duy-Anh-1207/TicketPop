import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="d-inline-block px-2 py-1"
      style={{
        backgroundColor: "#f5f5f5",
        fontWeight: 900,
        fontSize: "25px",
        backgroundImage:
          "linear-gradient(90deg, rgba(43,29,82,0.94), rgba(98,0,255,0.95))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textDecoration: "none",
      }}
    >
      TicketPop
    </Link>
  );
};

export default Logo;
