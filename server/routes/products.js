// products.js
const express = require('express');
const router = express.Router();

const { db } = require('../db/init'); // import shared db

// GET all products
router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, price, stock, 'product' AS type FROM products
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new product
router.post("/", (req, res) => {
  const { name, price, stock } = req.body;
  // coerce to numbers (optional)
  const priceNum = price !== undefined ? Number(price) : 0;
  const stockNum = stock !== undefined ? Number(stock) : 0;

  db.run(
    `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
    [name, priceNum, stockNum],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      // return full created row (fetch it)
      db.get(`SELECT id, name, price, stock FROM products WHERE id = ?`, [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      });
    }
  );
});

// Full replace (existing)
router.put("/:id", (req, res) => {
  const { name, price, stock } = req.body;
  const priceNum = price !== undefined ? Number(price) : null;
  const stockNum = stock !== undefined ? Number(stock) : null;

  db.run(
    `UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?`,
    [name, priceNum, stockNum, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      db.get(`SELECT id, name, price, stock FROM products WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes, product: row });
      });
    }
  );
});

// Partial update (PATCH) — added to support your frontend
router.patch("/:id", (req, res) => {
  const { name, price, stock } = req.body;

  // build dynamic SET clause
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    values.push(Number(price));
  }
  if (stock !== undefined) {
    fields.push("stock = ?");
    values.push(Number(stock));
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  const sql = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  values.push(req.params.id);

  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Product not found" });

    // return the updated row
    db.get(`SELECT id, name, price, stock FROM products WHERE id = ?`, [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes, product: row });
    });
  });
});

// Delete product
router.delete("/:id", (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
