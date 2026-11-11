const db = require('../config/db');

class CommentModel {
  static findById(id) {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        u.name as authorName,
        u.email as authorEmail
      FROM comments c
      JOIN users u ON c.authorId = u.id
      WHERE c.id = ?
    `);
    return stmt.get(id) || null;
  }

  static findByPostId(postId) {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        u.name as authorName,
        u.email as authorEmail
      FROM comments c
      JOIN users u ON c.authorId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt ASC
    `);
    return stmt.all(postId);
  }

  static create({ postId, authorId, content }) {
    const stmt = db.prepare(`
      INSERT INTO comments (postId, authorId, content)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(postId, authorId, content.trim());
    return this.findById(result.lastInsertRowid);
  }

  static update(id, content) {
    const stmt = db.prepare(`
      UPDATE comments
      SET content = ?, updatedAt = datetime('now')
      WHERE id = ?
    `);
    stmt.run(content.trim(), id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static listAllForAdmin() {
    const stmt = db.prepare(`
      SELECT 
        c.*,
        u.name as authorName,
        p.title as postTitle,
        p.id as postId
      FROM comments c
      JOIN users u ON c.authorId = u.id
      JOIN posts p ON c.postId = p.id
      ORDER BY c.createdAt DESC
    `);
    return stmt.all();
  }
}

module.exports = CommentModel;

