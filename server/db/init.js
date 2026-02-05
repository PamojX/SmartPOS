const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../pos.db'); // absolute path to pos.db
const db = new sqlite3.Database(dbPath);


function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    nic TEXT NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL,
    address TEXT NOT NULL
);
`);
  db.run(`
CREATE TABLE IF NOT EXISTS pending_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT,
lastName TEXT,
  nic TEXT,
  
  role TEXT,
  otp TEXT
)
`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL,
      stock INTEGER DEFAULT 0
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    stock INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS job_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT NOT NULL,
  jobType TEXT NOT NULL,
  qty INTEGER NOT NULL,
  dueDate TEXT NOT NULL,
  status TEXT CHECK(status IN ('Pending','Ready')) DEFAULT 'Pending'
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
}

module.exports = {
  initDB,
  db, // optional, if other files need direct access
};
