
const db = require("../db/init");

const JobOrder = {
  createTable: () => {
    db.run(
      `CREATE TABLE IF NOT EXISTS job_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer TEXT,
        jobType TEXT,
        qty INTEGER,
        dueDate TEXT,
        status TEXT
      )`
    );
  },

  getAll: (callback) => {
    db.all("SELECT * FROM job_orders", [], callback);
  },

  create: (data, callback) => {
    const { customer, jobType, qty, dueDate, status } = data;
    db.run(
      `INSERT INTO job_orders (customer, jobType, qty, dueDate, status)
       VALUES (?, ?, ?, ?, ?)`,
      [customer, jobType, qty, dueDate, status],
      callback
    );
  },

  updateStatus: (id, status, callback) => {
    db.run(
      `UPDATE job_orders SET status = ? WHERE id = ?`,
      [status, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.run(`DELETE FROM job_orders WHERE id = ?`, [id], callback);
  },
};

module.exports = JobOrder;
