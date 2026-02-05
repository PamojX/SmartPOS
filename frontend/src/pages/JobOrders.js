import React, { useState, useEffect } from "react";

export default function JobOrders() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    customer: "",
    jobType: "",
    qty: "",
    dueDate: "",
    status: "Pending",
  });
const [selectedJob, setSelectedJob] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch("http://localhost:5000/api/job-orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/job-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error);

      setOrders((prev) => [...prev, { ...formData, id: data.id }]);

      setFormData({
        customer: "",
        jobType: "",
        qty: "",
        dueDate: "",
        status: "Pending",
      });
    } catch (err) {
      console.error("Error creating order:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/job-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/job-orders/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Delete failed");

      setOrders((prev) => prev.filter((order) => order.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const readyOrders = orders.filter((o) => o.status === "Ready");
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const canceledOrders = orders.filter((o) => o.status === "Canceled");

  return (
    <div style={{ padding: "20px" }}>
      <h1>Job Orders</h1>

      {/* Order Form */}
      <form
        onSubmit={createOrder}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          name="customer"
          placeholder="Customer"
          value={formData.customer}
          onChange={handleChange}
          required
        />
        <select
      value={selectedJob}
      onChange={(e) => setSelectedJob(e.target.value)}
      style={{ padding: "8px", marginBottom: "15px" }}
    >
      <option value="All">All Jobs</option>
      <option value="Printing">Printing</option>
      <option value="Binding">Binding</option>
      <option value="Scanning">Scanning</option>
      <option value="Photocopy">Photocopy</option>
    </select>

        <input
          name="qty"
          type="number"
          placeholder="Qty"
          value={formData.qty}
          onChange={handleChange}
          required
        />
        <input
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{ padding: "8px 15px" }}>
          Add Order
        </button>
      </form>

      {/* Orders Sections */}
      <Section title="✅ Ready Orders" color="#d4edda">
        <OrderCards
          orders={readyOrders}
          updateStatus={updateStatus}
          deleteOrder={deleteOrder}
        />
      </Section>

      <Section title="🕒 Pending Orders" color="#fff3cd">
        <OrderCards
          orders={pendingOrders}
          updateStatus={updateStatus}
          deleteOrder={deleteOrder}
        />
      </Section>

      <Section title="❌ Canceled Orders" color="#f8d7da">
        <OrderCards
          orders={canceledOrders}
          updateStatus={updateStatus}
          deleteOrder={deleteOrder}
        />
      </Section>
    </div>
  );
}

// Section Component
function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: "30px" }}>
      <h2>{title}</h2>
      <div
        style={{
          backgroundColor: color,
          padding: "10px",
          borderRadius: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Order Cards
function OrderCards({ orders, updateStatus, deleteOrder }) {
  if (orders.length === 0) return <p>No orders</p>;

  return orders.map((order) => (
    <div
      key={order.id}
      style={{
        background: "#fff",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "220px",
      }}
    >
      <p>
        <strong>{order.customer}</strong>
      </p>
      <p>{order.jobType}</p>
      <p>Qty: {order.qty}</p>
      <p>Due: {order.dueDate}</p>
      <p>Status: {order.status}</p>

      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {order.status !== "Ready" && (
          <button onClick={() => updateStatus(order.id, "Ready")}>
            Mark Ready
          </button>
        )}
        {order.status !== "Pending" && (
          <button onClick={() => updateStatus(order.id, "Pending")}>
            Mark Pending
          </button>
        )}
        {order.status !== "Canceled" && (
          <button onClick={() => updateStatus(order.id, "Canceled")}>
            Cancel
          </button>
        )}
        <button
          onClick={() => deleteOrder(order.id)}
          style={{ background: "red", color: "#fff" }}
        >
          Delete
        </button>
      </div>
    </div>
  ));
}
