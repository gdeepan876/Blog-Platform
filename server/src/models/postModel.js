const db = require('../config/db');

class PostModel {
  static generateSlug(title) {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    return `${baseSlug || 'post'}-${uniqueSuffix}`;
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT 
        p.*,
        u.name as authorName,
        u.email as authorEmail
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.id = ?
    `);
    return stmt.get(id) || null;
  }

  static findBySlug(slug) {
    const stmt = db.prepare(`
      SELECT 
        p.*,
        u.name as authorName,
        u.email as authorEmail
      FROM posts p
      JOIN users u ON p.authorId = u.id
      WHERE p.slug = ?
    `);
    return stmt.get(slug) || null;
  }

  static create({ authorId, title, content, coverImageUrl = null, status = 'published' }) {
    const slug = this.generateSlug(title);
    const stmt = db.prepare(`
      INSERT INTO posts (authorId, title, slug, content, coverImageUrl, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(authorId, title.trim(), slug, content.trim(), coverImageUrl || null, status);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, { title, content, coverImageUrl, status }) {
    const existing = this.findById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newContent = content !== undefined ? content.trim() : existing.content;
    const newCover = coverImageUrl !== undefined ? coverImageUrl : existing.coverImageUrl;
    const newStatus = status !== undefined ? status : existing.status;

    const stmt = db.prepare(`
      UPDATE posts
      SET title = ?, content = ?, coverImageUrl = ?, status = ?, updatedAt = datetime('now')
      WHERE id = ?
    `);
    stmt.run(newTitle, newContent, newCover, newStatus, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static list({ page = 1, limit = 10, search = '', status = 'published', authorId = null }) {
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (authorId) {
      conditions.push('p.authorId = ?');
      params.push(authorId);
    }

    if (search && search.trim()) {
      conditions.push('(p.title LIKE ? OR p.content LIKE ?)');
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.*,
        u.name as authorName,
        u.email as authorEmail,
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) as commentCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ${whereClause}
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      ${whereClause}
    `;

    const totalRecord = db.prepare(countQuery).get(...params);
    const total = totalRecord ? totalRecord.total : 0;
    const posts = db.prepare(query).all(...params, Number(limit), Number(offset));

    return {
      posts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  static listAllForAdmin() {
    const stmt = db.prepare(`
      SELECT 
        p.*,
        u.name as authorName,
        u.email as authorEmail,
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) as commentCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      ORDER BY p.createdAt DESC
    `);
    return stmt.all();
  }
}

module.exports = PostModel;

