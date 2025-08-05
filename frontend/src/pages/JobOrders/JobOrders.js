import { BarChart3 } from "lucide-react"
import "./JobOrders.css" // Import the CSS file

const jobOrders = [
  {
    orderId: "#A1032",
    customer: "Lahiru",
    jobType: "A3 Color Poster",
    qty: 10,
    dueDate: "21-Jul",
    status: "Pending",
  },
  {
    orderId: "#A1033",
    customer: "Nadeesha",
    jobType: "Laminated ID Cards",
    qty: 25,
    dueDate: "25-Jul",
    status: "Ready",
  },
  // Add more empty rows for demonstration
  { orderId: "", customer: "", jobType: "", qty: null, dueDate: "", status: "" },
  { orderId: "", customer: "", jobType: "", qty: null, dueDate: "", status: "" },
  { orderId: "", customer: "", jobType: "", qty: null, dueDate: "", status: "" },
  { orderId: "", customer: "", jobType: "", qty: null, dueDate: "", status: "" },
  { orderId: "", customer: "", jobType: "", qty: null, dueDate: "", status: "" },
]

export default function JobOrders() {
  return (
    <div className="job-orders-container">
      <div className="job-orders-card">
        <div className="job-orders-header">
          <div className="job-orders-company-info">
            <div className="job-orders-company-name">Asian Printers - Galle</div>
          </div>
          <div className="job-orders-user-info">
            <span className="job-orders-user-role">Operator</span>
            <span className="job-orders-user-name">Nuwan</span>
          </div>
        </div>
        <div className="job-orders-content">
          <h2 className="job-orders-title">Job Orders</h2>
          <div className="job-orders-table-wrapper">
            <table className="job-orders-table">
              <thead>
                <tr>
                  <th className="job-orders-table-head">Order ID</th>
                  <th className="job-orders-table-head">Customer</th>
                  <th className="job-orders-table-head">Job Type</th>
                  <th className="job-orders-table-head">Qty</th>
                  <th className="job-orders-table-head">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {jobOrders.map((order, index) => (
                  <tr key={index} className="job-orders-table-row">
                    <td className="job-orders-table-cell font-medium">{order.orderId}</td>
                    <td className="job-orders-table-cell">{order.customer}</td>
                    <td className="job-orders-table-cell">{order.jobType}</td>
                    <td className="job-orders-table-cell">{order.qty}</td>
                    <td className="job-orders-table-cell">
                      {order.status === "Ready" ? (
                        <span className="job-orders-ready-status">Ready</span>
                      ) : (
                        order.dueDate
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <button className="job-orders-floating-button">
        <BarChart3 />
        Orders
      </button>
    </div>
  )
}
