// src/pages/Logout.js
import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    // 🧹 Clear the token
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // 🔁 Reload the page (so it goes to login)
    window.location.reload();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Logging out...</h2>
    </div>
  );
}
