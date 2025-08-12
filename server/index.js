const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/init'); // Make sure this exists
const authRoutes=require("./routes/auth");

const app = express();
const PORT = 5000;
//require('dotenv').config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL);

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth",authRoutes);


// ✅ GET all services
app.get('/api/services', (req, res) => {
  console.log("egedgefgdfgdfgdfgdfgdfgd")
  db.all("SELECT * FROM services", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// ✅ DELETE existing services & insert demo data
app.get('/api/reset-services', (req, res) => {
  db.run("DELETE FROM services", [], (err) => {
    if (err) return res.status(500).send(err);
    const demo = [
      ["B/W Photocopy", 10],
      ["Color Photocopy", 50],
      ["Document Print", 30]
    ];
    demo.forEach(([name, price]) => {
      db.run("INSERT INTO services (name, price) VALUES (?, ?)", [name, price]);
    });
    res.send("Reset and seeded.");
  });
});

// ✅ Save a billing transaction
app.post('/api/transactions', (req, res) => {
  const { items, total } = req.body;

  db.run(
    `INSERT INTO transactions (type, total) VALUES (?, ?)`,
    ['service', total],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Failed to insert transaction.");
      }

      const transactionId = this.lastID;

      const stmt = db.prepare(
        `INSERT INTO transaction_items (transaction_id, item_id, name, qty, price) VALUES (?, ?, ?, ?, ?)`
      );
      items.forEach(item => {
        stmt.run(transactionId, item.id, item.name, item.qty, item.price);
      });
      stmt.finalize();

      res.json({ message: "Transaction saved", transactionId });
    }
  );
});// ✅ GET all job orders

app.get("/api/job-orders", (req, res) => {
  db.all("SELECT * FROM job_orders", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// ✅ ADD a new job order
app.post("/api/job-orders", (req, res) => {
  const { customer, jobType, qty, dueDate, status } = req.body;

  if (!customer || !jobType || !qty || !dueDate) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.run(
    `INSERT INTO job_orders (customer, jobType, qty, dueDate, status) VALUES (?, ?, ?, ?, ?)`,
    [customer, jobType, qty, dueDate, status || "Pending"],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Job order added", id: this.lastID });
    }
  );
});

// ✅ UPDATE status (Ready/Pending)
app.put("/api/job-orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Ready"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  db.run(
    `UPDATE job_orders SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Job order updated", updatedID: id });
    }
  );
});

// ✅ DELETE a job order
app.delete("/api/job-orders/:id", (req, res) => {
  const { id } = req.params;

console.log("🗑 Backend delete ID:", id);
 // ✅ Check in terminal

  db.run(`DELETE FROM job_orders WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error("❌ DB Error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Job order not found" });
    }

    res.json({ message: "Job order deleted", deletedID: id });
  });
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
});
