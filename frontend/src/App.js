import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import NewBill from "./components/Newbill/Newbill";
import JobOrders from "./pages/JobOrders";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import "./App.css";

export default function App() {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token) {
      setIsAuthenticated(true);
      if (storedRole) setRole(storedRole);
    }
  }, []);

  const handleMenuItemClick = (itemId) => {
    if (itemId === "Logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setIsAuthenticated(false);
      setActiveMenuItem("Dashboard");
      return;
    }
    setActiveMenuItem(itemId);
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case "Dashboard": return <Dashboard />;
      case "NewBill": return <NewBill />;
      case "JobOrders": return <JobOrders />;
      case "Inventory": return <div className="content-placeholder"><h1>Inventory Page</h1></div>;
      case "Customers": return <div className="content-placeholder"><h1>Customers Page</h1></div>;
      case "Reports": return <div className="content-placeholder"><h1>Reports Page</h1></div>;
      case "Settings": return <div className="content-placeholder"><h1>Settings Page</h1></div>;
      default: return <Dashboard />;
    }
  };

  const showSignupScreen = () => setShowSignup(true);
  const showLoginScreen = () => setShowSignup(false);

  return (
    <div className="app-container">
      {isAuthenticated ? (
        <>
          <Sidebar
            activeItem={activeMenuItem}
            onItemClick={handleMenuItemClick}
            role={role}
          />
          {renderContent()}
        </>
      ) : (
        <>
          {showSignup ? (
            <Signup
              onSignupSuccess={() => {
                // after creating account, go to login screen
                showLoginScreen();
              }}
              onShowLogin={showLoginScreen}
            />
          ) : (
            <Login
              onLoginSuccess={() => setIsAuthenticated(true)}
              setRole={setRole}
              onShowSignup={showSignupScreen}
            />
          )}
        </>
      )}
    </div>
  );
}
