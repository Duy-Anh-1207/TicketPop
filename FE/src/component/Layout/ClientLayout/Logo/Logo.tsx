import { Link } from "react-router-dom";
import logo from "/src/assets/logo.png";

const Logo = () => {
  return (
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
      }}
    >
      <img
        src={logo}
        alt="TicketPop"
        style={{
          height: "160px",        // TO hơn
          maxWidth: "100%",
          objectFit: "contain",
          transition: "transform 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      />
    </Link>
  );
};

export default Logo;
