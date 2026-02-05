const JobOrder = require("../models/jobOrderModel");
JobOrder.createTable();

function validateOrder(data) {
  if (!data.customer || data.customer.trim() === "")
    return "Customer name is required";
  if (!data.jobType || data.jobType.trim() === "")
    return "Job type is required";
  if (!data.qty || isNaN(data.qty) || data.qty <= 0)
    return "Quantity must be a positive number";
  if (!data.dueDate || data.dueDate.trim() === "")
    return "Due date is required";
  if (!data.status || !["Pending", "Ready"].includes(data.status))
    return "Status must be Pending or Ready";
  return null;
}

exports.getOrders = (req, res) => {
  JobOrder.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createOrder = (req, res) => {
  const error = validateOrder(req.body);
  if (error) return res.status(400).json({ error });

  JobOrder.create(req.body, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    //console.log(req.body);
    res.json({ message: "Order created successfully" });
  });
};

exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Pending", "Ready"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  JobOrder.updateStatus(id, status, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Status updated", updatedID: id });
  });
};

exports.deleteOrder = (req, res) => {
  const { id } = req.params;

  JobOrder.delete(id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Order deleted successfully" });
  });
};
