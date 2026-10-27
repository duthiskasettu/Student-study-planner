const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'study_planner.db');
const db = new sqlite3.Database(DB_PATH);

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      assignmentName TEXT NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT DEFAULT 'Pending'
    )
  `);
});

// Mimic mysql2's promise API: db.query(sql, params) -> [rowsOrResult]
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const isSelect = /^\s*select/i.test(sql);
    if (isSelect) {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows]);
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
      });
    }
  });
}

module.exports = { query, _raw: db };
