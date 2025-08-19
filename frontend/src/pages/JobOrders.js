"use client"

import { useState, useEffect } from "react"
import "./JobOrders.css"

export default function JobOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState("")
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [modalOrderType, setModalOrderType] = useState("Ready")
  const [successMsg, setSuccessMsg] = useState("")

  const [formData, setFormData] = useState({
    customer: "",
    jobType: "Printing",
    qty: "",
    dueDate: "",
    status: "Pending",
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const safeJson = async (res) => {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      return { error: text || "Non-JSON response" }
    }
  }

  // ---------- small helpers ----------
  const statusClass = (s) => (typeof s === "string" ? s.toLowerCase() : "unknown")
  const normalizeOrder = (o) => ({
    id: o.id ?? o._id ?? Math.random().toString(36).slice(2),
    customer: typeof o.customer === "string" ? o.customer : "",
    jobType: typeof o.jobType === "string" ? o.jobType : "Printing",
    qty: Number.isFinite(Number(o.qty)) ? Number(o.qty) : 0,
    dueDate: o.dueDate ?? "",
    status: typeof o.status === "string" ? o.status : "Pending",
  })
  const normalizeList = (list) => (Array.isArray(list) ? list.map(normalizeOrder) : [])

  const fetchOrders = async () => {
    setLoading(true)
    setErrMsg("")
    try {
      const res = await fetch("http://localhost:5000/api/job-orders")
      const data = await safeJson(res)
      if (!res.ok) throw new Error(data.error || "Failed to fetch job orders")
      setOrders(normalizeList(data))
    } catch (e) {
      setErrMsg(e.message)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((f) => ({ ...f, [name]: value }))
  }

  const createOrder = async (e) => {
    e.preventDefault()
    setErrMsg("")
    setSuccessMsg("")

    const payload = {
      customer: formData.customer.trim(),
      jobType: formData.jobType,
      qty: Number(formData.qty),
      dueDate: formData.dueDate,
      status: formData.status,
    }

    if (!payload.customer || !payload.jobType || !payload.qty || !payload.dueDate) {
      return setErrMsg("All fields are required.")
    }
    if (payload.qty <= 0) {
      return setErrMsg("Qty must be at least 1.")
    }

    try {
      const res = await fetch("http://localhost:5000/api/job-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await safeJson(res)
      if (!res.ok) return setErrMsg(data.error || "Create failed")

      const normalized = normalizeOrder(data)
      setOrders((prev) => [normalized, ...prev])
      setSuccessMsg(`Order #${normalized.id} created successfully!`)

      setFormData({
        customer: "",
        jobType: "Printing",
        qty: "",
        dueDate: "",
        status: "Pending",
      })

      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (err) {
      console.error("Error creating order:", err)
      setErrMsg("Network error while creating order.")
    }
  }

  const updateStatus = async (id, newStatus) => {
    setErrMsg("")
    try {
      const res = await fetch(`http://localhost:5000/api/job-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await safeJson(res)
      if (!res.ok) return setErrMsg(data.error || "Update failed")

      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    } catch (err) {
      console.error("Error updating status:", err)
      setErrMsg("Network error while updating status.")
    }
  }

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return
    setErrMsg("")
    try {
      const res = await fetch(`http://localhost:5000/api/job-orders/${id}`, {
        method: "DELETE",
      })
      const data = await safeJson(res)
      if (!res.ok) return setErrMsg(data.error || "Delete failed")
      setOrders((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      console.error("Delete Error:", err)
      setErrMsg("Network error while deleting.")
    }
  }

  const readyOrders = orders.filter((o) => o.status === "Ready")
  const pendingOrders = orders.filter((o) => o.status === "Pending")
  const canceledOrders = orders.filter((o) => o.status === "Canceled")
  const recentOrders = orders.slice(0, 5)

  const openOrdersModal = (orderType) => {
    setModalOrderType(orderType)
    setShowOrdersModal(true)
  }

  const getModalOrders = () => {
    switch (modalOrderType) {
      case "Pending":
        return pendingOrders
      case "Ready":
        return readyOrders
      case "Canceled":
        return canceledOrders
      default:
        return []
    }
  }

  const getModalInfo = () => {
    switch (modalOrderType) {
      case "Pending":
        return { icon: "⏳", title: "Pending Orders", count: pendingOrders.length }
      case "Ready":
        return { icon: "✅", title: "Ready Orders", count: readyOrders.length }
      case "Canceled":
        return { icon: "❌", title: "Canceled Orders", count: canceledOrders.length }
      default:
        return { icon: "📋", title: "Orders", count: 0 }
    }
  }

  return (
    <div className="pos-container">
      <div className="pos-header">
        <div className="header-content">
          <h1 className="pos-title">Job Orders</h1>
          <p className="pos-subtitle">Manage your printing and binding orders efficiently</p>
        </div>
        <div className="stats-dashboard">
          <div className="stat-card pending clickable" onClick={() => openOrdersModal("Pending")}>
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <div className="stat-number">{pendingOrders.length}</div>
              <div className="stat-label">Pending Jobs</div>
            </div>
          </div>
          <div className="stat-card ready clickable" onClick={() => openOrdersModal("Ready")}>
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <div className="stat-number">{readyOrders.length}</div>
              <div className="stat-label">Ready Jobs</div>
            </div>
          </div>
          <div className="stat-card canceled clickable" onClick={() => openOrdersModal("Canceled")}>
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <div className="stat-number">{canceledOrders.length}</div>
              <div className="stat-label">Canceled Jobs</div>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="alert info-alert">Loading orders…</div>}

      {errMsg && (
        <div className="alert error-alert">
          <span className="alert-icon">⚠️</span>
          {errMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert success-alert">
          <span className="alert-icon">✅</span>
          {successMsg}
        </div>
      )}

      <div className="pos-main">
        <div className="order-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2 className="form-title">Create New Order</h2>
              <div className="form-icon">📝</div>
            </div>

            <form onSubmit={createOrder} className="pos-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer">Customer Name</label>
                  <input
                    id="customer"
                    name="customer"
                    placeholder="Enter customer name"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobType">Service Type</label>
                  <div className="select-wrapper">
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Printing">🖨️ Printing</option>
                      <option value="Binding">📚 Binding</option>
                      <option value="Scanning">📄 Scanning</option>
                      <option value="Photocopy">📋 Photocopy</option>
                      <option value="Lamination">🛡️ Lamination</option>
                      <option value="Design">🎨 Design</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="qty">Quantity</label>
                  <input
                    id="qty"
                    name="qty"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.qty}
                    onChange={handleChange}
                    required
                    min={1}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date</label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="create-order-btn">
                  <span className="btn-icon">+</span>
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="recent-orders-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Recent Orders</h3>
            <span className="orders-count">{recentOrders.length}</span>
          </div>

          <div className="recent-orders-list">
            {recentOrders.length === 0 ? (
              <div className="empty-recent">
                <div className="empty-icon">📋</div>
                <p>No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="recent-order-item">
                  <div className="order-info">
                    <div className="order-customer">{order.customer}</div>
                    <div className="order-details">
                      <span className="order-type">{order.jobType}</span>
                      <span className="order-qty">Qty: {order.qty}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={`status-dot ${statusClass(order.status)}`}></span>
                    <span className="status-text">{order.status ?? "Unknown"}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {recentOrders.length > 0 && (
            <div className="sidebar-footer">
              <button className="view-all-btn" onClick={() => openOrdersModal("Ready")}>
                View All Orders
              </button>
            </div>
          )}
        </div>
      </div>

      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">{getModalInfo().icon}</span>
                {getModalInfo().title} ({getModalInfo().count})
              </h2>
              <button className="modal-close-btn" onClick={() => setShowOrdersModal(false)} aria-label="Close modal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="orders-grid">
                <OrderCards orders={getModalOrders()} updateStatus={updateStatus} deleteOrder={deleteOrder} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderCards({ orders, updateStatus, deleteOrder }) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>No orders found</p>
      </div>
    )
  }

  const statusClass = (s) => (typeof s === "string" ? s.toLowerCase() : "unknown")
  const fmtDate = (d) => {
    if (!d) return "—"
    const dt = new Date(d)
    return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString()
  }

  return orders.map((order) => (
    <div key={order.id} className="order-card">
      <div className="card-header">
        <div className="customer-info">
          <h3 className="customer-name">{order.customer || "Unnamed"}</h3>
          <span className="order-id">#{order.id}</span>
        </div>
        <span className={`status-badge ${statusClass(order.status)}`}>{order.status ?? "Unknown"}</span>
      </div>

      <div className="card-content">
        <div className="order-details">
          <div className="detail-item">
            <span className="detail-icon">🖨️</span>
            <div className="detail-info">
              <span className="detail-label">Job Type</span>
              <span className="detail-value">{order.jobType}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📊</span>
            <div className="detail-info">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{order.qty}</span>
            </div>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div className="detail-info">
              <span className="detail-label">Due Date</span>
              <span className="detail-value">{fmtDate(order.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {order.status !== "Ready" && (
          <button onClick={() => updateStatus(order.id, "Ready")} className="action-btn ready-btn">
            ✅ Mark Ready
          </button>
        )}
        {order.status !== "Pending" && (
          <button onClick={() => updateStatus(order.id, "Pending")} className="action-btn pending-btn">
            ⏳ Mark Pending
          </button>
        )}
        {order.status !== "Canceled" && (
          <button onClick={() => updateStatus(order.id, "Canceled")} className="action-btn cancel-btn">
            ❌ Cancel
          </button>
        )}
        <button onClick={() => deleteOrder(order.id)} className="action-btn delete-btn">
          🗑️ Delete
        </button>
      </div>
    </div>
  ))
}
