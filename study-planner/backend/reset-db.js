const db = require('./database/db');
db.query('DROP TABLE IF EXISTS assignments')
  .then(() => db.query('CREATE TABLE assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, subject TEXT, assignmentName TEXT, deadline TEXT, priority TEXT DEFAULT "Medium", status TEXT DEFAULT "Pending")'))
  .then(() => console.log('✅ Database reset with new features!'))
  .catch(console.error);
