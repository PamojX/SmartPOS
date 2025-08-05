const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../pos.db");
const db = new sqlite3.Database(dbPath);
db.serialize();

router.post("/", async (req, res) => {
  const { customerName, billDate, total, items } = req.body;
   console.log("Received transaction data:", req.body);

  if (!customerName || !billDate || !items || !items.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Helper to run SQL with Promise
  function getAsync(sql, params) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  function runAsync(sql, params) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  try {
    // Check stock for each product item
    for (const item of items) {
      if (item.type === "product") {
        const row = await getAsync(
          "SELECT stock FROM products WHERE id = ?",
          [item.id]
        );

        if (!row) {
          return res.status(400).json({ error: `Product ID ${item.id} not found` });
        }

        if (row.stock < item.qty) {
          return res.status(400).json({
            error: `Insufficient stock for ${item.name}. Available: ${row.stock}`,
          });
        }
      }
    }

    // Insert transaction
    const transactionType = items[0].type;

    const insertTransaction = await runAsync(
      "INSERT INTO transactions (customer_name, date, total , type) VALUES (?, ?, ?, ?)",
      [customerName, billDate, total , transactionType]
    );

    const transactionId = insertTransaction.lastID;

    // Insert transaction items & update stock
    for (const item of items) {
      await runAsync(
        "INSERT INTO transaction_items (transaction_id, item_id, name, quantity, price) VALUES (?, ?, ?, ?, ?)",
        [transactionId, item.id, item.name, item.qty, item.price]
      );
      
      if (item.type === "product") {
        await runAsync(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.qty, item.id]
        );
      }
    }

    res.status(201).json({ transactionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
