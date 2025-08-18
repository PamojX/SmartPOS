// LogoutButton.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🧹 Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // 🔁 Redirect to login
    navigate("/pages/login");
  };

  return (
    <button onClick={handleLogout} style={{ color: "white", background: "red", padding: "5px 10px", border: "none", borderRadius: "5px" }}>
      Logout
    </button>
  );
}
