const express = require('express');
const router = express.Router();

const { db } = require('../db/init');  // import shared db

router.get('/', (req, res) => {
  const sql = `
    SELECT id, name, price, NULL as stock, 'service' AS type FROM services
    UNION ALL
    SELECT id, name, price, stock, 'product' AS type FROM products
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
