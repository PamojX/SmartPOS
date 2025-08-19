const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// ⬇️ import the actual Database handle and the initializer
const { db, initDB } = require("./db/init");

const itemRoutes = require("./routes/items");
const transactionRoutes = require("./routes/transactions");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS set:", !!process.env.EMAIL_PASS);
console.log("OWNER_EMAIL:", process.env.OWNER_EMAIL);

app.use(cors());
app.use(bodyParser.json()); // (or: app.use(express.json()))

// Make sure tables exist
initDB();

// Routes
app.use("/api/auth", authRoutes);

// ✅ GET all services
app.get("/api/services", (req, res) => {
  db.all("SELECT * FROM services", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// ✅ DELETE existing services & insert demo data
app.get("/api/reset-services", (req, res) => {
  db.run("DELETE FROM services", [], (err) => {
    if (err) return res.status(500).send(err);

    const demo = [
      ["B/W Photocopy", 10],
      ["Color Photocopy", 50],
      ["Document Print", 30],
    ];

    const stmt = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)");
    demo.forEach(([name, price]) => stmt.run(name, price));
    stmt.finalize();

    res.send("Reset and seeded.");
  });
});

// ✅ Save a billing transaction
app.post("/api/transactions", (req, res) => {
  const { items, total } = req.body;

  db.run(
    `INSERT INTO transactions (type, total) VALUES (?, ?)`,
    ["service", total],
    function (err) {
      if (err) return res.status(500).send("Failed to insert transaction.");

      const transactionId = this.lastID;

      const stmt = db.prepare(
        `INSERT INTO transaction_items (transaction_id, item_id, name, qty, price)
         VALUES (?, ?, ?, ?, ?)`
      );
      items.forEach((item) =>
        stmt.run(transactionId, item.id, item.name, item.qty, item.price)
      );
      stmt.finalize();

      res.json({ message: "Transaction saved", transactionId });
    }
  );
});

// ✅ Job orders CRUD
app.get("/api/job-orders", (req, res) => {
  db.all("SELECT * FROM job_orders_new", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

app.post("/api/job-orders", (req, res) => {
  const { customer, jobType, qty, dueDate, status } = req.body;
  if (!customer || !jobType || !qty || !dueDate) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    `INSERT INTO job_orders_new (customer, jobType, qty, dueDate, status)
     VALUES (?, ?, ?, ?, ?)`,
    [customer, jobType, qty, dueDate, status || "Pending"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Job order added", id: this.lastID });
    }
  );
});

app.put("/api/job-orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Ready"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  db.run(
    `UPDATE job_orders_new SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Job order updated", updatedID: id });
    }
  );
});

app.delete("/api/job-orders/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM job_orders_new WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Job order not found" });
    res.json({ message: "Job order deleted", deletedID: id });
  });
});

// Mount other routers (ensure they don't duplicate /api/transactions above)
app.use("/api/items", itemRoutes);
// If your transactionRoutes also defines /api/transactions, consider changing its base path
app.use("/api/transactions-extra", transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
