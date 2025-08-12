"use client"

import { useState } from "react"
import Sidebar from './components/Sidebar/Sidebar'
import Dashboard from './pages/Dashboard/Dashboard'
import NewBill from './pages/Newbill/Newbill'
import InventoryPage from './pages/Inventory/InventoryPage'
import JobOrders from './pages/JobOrders/JobOrders'
import './App.css'

export default function Home() {
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard")

  const handleMenuItemClick = (itemId) => {
    setActiveMenuItem(itemId)
    console.log(`Navigating to: ${itemId}`)
  }

  const renderContent = () => {
    switch (activeMenuItem) {
      case "Dashboard":
        return <Dashboard />
      case "NewBill":
        return <NewBill />
      case "JobOrders":
        return <JobOrders/>
      case "Inventory":
        return <InventoryPage />

      case "Customers":
        return (
          <div className="content-placeholder">
            <h1>Customers Page</h1>
          </div>
        )
      case "Reports":
        return (
          <div className="content-placeholder">
            <h1>Reports Page</h1>
          </div>
        )
      case "Settings":
        return (
          <div className="content-placeholder">
            <h1>Settings Page</h1>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app-container">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} />
      {renderContent()}
    </div>
  )
}

