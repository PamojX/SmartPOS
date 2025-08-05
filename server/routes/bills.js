const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../pos.db');
const db = new sqlite3.Database(dbPath);

// POST /api/bills - Create a new bill
router.post('/', (req, res) => {
  const { customerName, items, totalAmount, date } = req.body;

  if (!customerName || !items || !totalAmount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO bills (customer_name, items, total_amount, date) VALUES (?, ?, ?, ?)',
    [customerName, JSON.stringify(items), totalAmount, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: 'Bill created successfully',
        billId: this.lastID,
      });
    }
  );
});

// GET /api/bills - Get all bills
router.get('/', (req, res) => {
  db.all('SELECT * FROM bills', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Parse items JSON
    const bills = rows.map(bill => ({
      ...bill,
      items: JSON.parse(bill.items),
    }));

    res.json(bills);
  });
});

module.exports = router;
