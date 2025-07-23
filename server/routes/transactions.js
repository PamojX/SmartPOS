const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../db/database.sqlite");
const db = new sqlite3.Database(dbPath);

router.post("/", (req, res) => {
  const { customerName, billDate, total, items } = req.body;

  if (!customerName || !billDate || !items || !items.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.serialize(() => {
    // Check stock
    const insufficientStock = items.find((item) => {
      if (item.type === "product") {
        // Use synchronous get (wrapped)
        const stmt = db.prepare("SELECT stock FROM items WHERE id = ?");
        let stock;
        stmt.get([item.id], (err, row) => {
          if (row) stock = row.stock;
        });
        stmt.finalize();

        return stock < item.qty;
      }
      return false;
    });

    if (insufficientStock) {
      return res.status(400).json({
        error: `Insufficient stock for ${insufficientStock.name}`,
      });
    }

    // Insert transaction
    db.run(
      "INSERT INTO transactions (customer_name, bill_date, total_amount) VALUES (?, ?, ?)",
      [customerName, billDate, total],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const transactionId = this.lastID;

        // Insert transaction items
        const insertStmt = db.prepare(
          "INSERT INTO transaction_items (transaction_id, item_id, quantity, price) VALUES (?, ?, ?, ?)"
        );

        items.forEach((item) => {
          insertStmt.run(transactionId, item.id, item.qty, item.price);

          // Deduct stock if product
          if (item.type === "product") {
            db.run("UPDATE items SET stock = stock - ? WHERE id = ?", [
              item.qty,
              item.id,
            ]);
          }
        });

        insertStmt.finalize();

        return res.status(201).json({ transactionId });
      }
    );
  });
});

module.exports = router;
