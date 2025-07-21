const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db/init'); // Make sure this exists

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ GET all services
app.get('/api/services', (req, res) => {
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
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
});
