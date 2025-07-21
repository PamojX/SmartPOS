"use client"
import { Home, FileText, ShoppingCart, Package, Users, BarChart3, Settings } from "lucide-react"
import "./Sidebar.css"

const Sidebar = ({ activeItem = "Dashboard", onItemClick }) => {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: Home },
    { id: "NewBill", label: "New Bill", icon: FileText },
    { id: "JobOrders", label: "Job Orders", icon: ShoppingCart },
    { id: "Inventory", label: "Inventory", icon: Package },
    { id: "Customers", label: "Customers", icon: Users },
    { id: "Reports", label: "Reports", icon: BarChart3 },
    { id: "Settings", label: "Settings", icon: Settings },
  ]

  const handleItemClick = (itemId) => {
    if (onItemClick) {
      onItemClick(itemId)
    }
  }

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Navora Printers - Hikkaduwa</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`sidebar-menu-button ${isActive ? "active" : ""}`}
                >
                  <Icon className="sidebar-menu-icon" />
                  <span className="sidebar-menu-label">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
