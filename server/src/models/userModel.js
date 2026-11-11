const db = require('../config/db');

class UserModel {
  static sanitize(user) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user || null;
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const user = stmt.get(email.trim());
    return user || null;
  }

  static create({ name, email, passwordHash, role = 'user' }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, passwordHash, role)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), email.trim().toLowerCase(), passwordHash, role);
    return this.findById(result.lastInsertRowid);
  }

  static count() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const res = stmt.get();
    return res ? res.count : 0;
  }

  static getAll() {
    const stmt = db.prepare('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
    return stmt.all();
  }
}

module.exports = UserModel;

