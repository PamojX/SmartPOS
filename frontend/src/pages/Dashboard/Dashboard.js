"use client"
import { FileText, Plus, Minus } from "lucide-react"
import "./Dashboard.css"

const Dashboard = () => {
  // Sample data - in real app this would come from props or API
  const todaysSales = 35620.0
  const pendingJobs = 4

  const lowStockItems = [
    { item: "A4 Paper", currentQty: 10 },
    { item: "Lamination Film", currentQty: 5 },
    { item: "Spiral Bindings", currentQty: 8 },
  ]

  const handleNewBill = () => {
    console.log("New Bill clicked")
    // Add navigation logic here
  }

  const handleAddJob = () => {
    console.log("Add Job clicked")
    // Add navigation logic here
  }

  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">{"Today's Sales"}</h1>
          <button className="dashboard-minimize-btn">
            <Minus size={20} />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Today's Sales Card */}
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">{"Today's Sales"}</h2>
            <div className="dashboard-card-value">{formatCurrency(todaysSales)}</div>
          </div>

          {/* Pending Jobs Card */}
          <div className="dashboard-card">
            <h2 className="dashboard-card-title">Pending Jobs</h2>
            <div className="dashboard-card-value">{pendingJobs}</div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="low-stock-section">
          <div className="low-stock-header">
            <h2 className="low-stock-title">Low Stock Alert</h2>

            <div className="low-stock-table-container">
              <table className="low-stock-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Current Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.currentQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-grid">
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <button onClick={handleNewBill} className="quick-action-button">
              <FileText className="quick-action-icon" />
              <span className="quick-action-label">New Bill</span>
            </button>
          </div>

          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <button onClick={handleAddJob} className="quick-action-button">
              <Plus className="quick-action-icon" />
              <span className="quick-action-label">Add Job</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
