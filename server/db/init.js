const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pos.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    stock INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    total REAL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER,
    item_id INTEGER,
    name TEXT,
    qty INTEGER,
    price REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reload_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT,
    number TEXT,
    amount REAL,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
