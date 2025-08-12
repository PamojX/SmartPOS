const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../../pos.db");
const db = new sqlite3.Database(dbPath);
db.serialize();

// Helpers (unchanged)
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this); // 'this.lastID'
    });
  });
}

router.post("/", async (req, res) => {
  // 1) Extract all fields from request body, including new ones
  const {
    invoiceNumber,
    customerName,
    billDate,
    total,
    paymentMethod,
    discount = 0,
    amountPaid = 0,
    changeDue = 0,
    items,
  } = req.body;

  console.log("Received transaction data:", req.body);

  // 2) Validate required fields, including new ones
  if (!invoiceNumber || !customerName || !billDate || !items || !items.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 3) Pre-transaction validation: check stock availability for products
    for (const item of items) {
      if (item.type === "product") {
        const row = await getAsync("SELECT stock FROM products WHERE id = ?", [item.id]);
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

    // 4) Begin transaction
    await runAsync("BEGIN IMMEDIATE TRANSACTION");

    try {
      // 5) Insert transaction with all new columns included
      const transactionType = items[0].type;

      const insertTransaction = await runAsync(
        `INSERT INTO transactions 
        (invoice_number, customer_name,payment_method, date, total, discount, amount_paid, change_due, type) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNumber, customerName, paymentMethod, billDate, total, discount, amountPaid, changeDue, transactionType]
      );

      const transactionId = insertTransaction.lastID;

      // 6) Insert transaction items and update stock if product
      for (const item of items) {
        await runAsync(
          "INSERT INTO transaction_items (transaction_id, item_id, name, quantity, price) VALUES (?, ?, ?, ?, ?)",
          [transactionId, item.id, item.name, item.qty, item.price]
        );

        if (item.type === "product") {
          await runAsync("UPDATE products SET stock = stock - ? WHERE id = ?", [item.qty, item.id]);
        }
      }

      // 7) Commit transaction
      await runAsync("COMMIT");
      return res.status(201).json({ transactionId });
    } catch (txErr) {
      console.error("Transaction error, rolling back:", txErr);
      try {
        await runAsync("ROLLBACK");
      } catch (rbErr) {
        console.error("Rollback failed:", rbErr);
      }
      return res.status(500).json({ error: "Transaction failed", detail: txErr.message });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
});

module.exports = router;
