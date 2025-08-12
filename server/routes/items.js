// const express = require("express");
// const router = express.Router();
// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");

// const dbPath = path.resolve(__dirname, "../db/database.sqlite");
// const db = new sqlite3.Database(dbPath);

// router.get("/", (req, res) => {
//   db.all("SELECT * FROM items", [], (err, rows) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(rows);
//   });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();

const { db } = require('../db/init');  // import shared db

router.get('/', (req, res) => {
  const sql = `
<<<<<<< HEAD
    SELECT id, name, price, NULL as stock, 'service' AS type FROM services
    UNION ALL
=======
    --SELECT id, name, price, NULL as stock, 'service' AS type FROM services
    --UNION ALL
>>>>>>> dbb4d101db9bed31d43ef54457ce81f9671aa022
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

// Update only stock for a product
router.patch('/:id', (req, res) => {
  const { stock } = req.body;
  if (typeof stock === 'undefined') {
    return res.status(400).json({ error: 'Stock value is required' });
  }
  db.run(
    'UPDATE products SET stock = ? WHERE id = ?',
    [stock, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

module.exports = router;
