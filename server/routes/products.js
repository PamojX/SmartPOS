
const express = require('express');
const router = express.Router();

const { db } = require('../db/init');  // import shared db


// UNION ALL SELECT id, name, price, stock, 'product' AS type FROM products
//SELECT id, name, price, NULL as stock, 'service' AS type FROM services

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
  db.run(
    `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
    [name, price, stock],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Update product
router.put("/:id", (req, res) => {
  const { name, price, stock } = req.body;
  db.run(
    `UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?`,
    [name, price, stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

// Delete product
router.delete("/:id", (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
