import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null; // login page pe navbar nahi

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h3 className="logo">LeaveMS</h3>

      <div className="nav-links">
        {user.role === "employee" && (
          <Link to="/employee">Employee</Link>
        )}

        {user.role === "manager" && (
          <Link to="/manager">Manager</Link>
        )}

        {user.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
