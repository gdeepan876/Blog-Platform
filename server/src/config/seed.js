const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('Seeding database...');

  // Clean existing data for clean seed
  db.exec('DELETE FROM comments;');
  db.exec('DELETE FROM posts;');
  db.exec('DELETE FROM users;');

  const adminHash = await bcrypt.hash('Admin@123', 10);
  const authorHash = await bcrypt.hash('Author@123', 10);
  const readerHash = await bcrypt.hash('Reader@123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, passwordHash, role)
    VALUES (?, ?, ?, ?)
  `);

  insertUser.run('Admin Moderator', 'admin@example.com', adminHash, 'admin');
  insertUser.run('Jane Doe', 'jane@example.com', authorHash, 'user');
  insertUser.run('John Smith', 'john@example.com', readerHash, 'user');

  const users = db.prepare('SELECT id, email FROM users').all();
  const admin = users.find(u => u.email === 'admin@example.com');
  const jane = users.find(u => u.email === 'jane@example.com');
  const john = users.find(u => u.email === 'john@example.com');

  const insertPost = db.prepare(`
    INSERT INTO posts (authorId, title, slug, content, coverImageUrl, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    jane.id,
    'Building Scalable Web Applications with Modern Architecture',
    'building-scalable-web-applications',
    `When developing web applications at scale, simplicity and modularity must be prioritized from day one.

### Core Principles
1. **Decoupled Architecture**: Maintain a clean boundary between presentation layers and backend services.
2. **Explicit Contracts**: Keep REST API schemas predictable with consistent envelope responses.
3. **Database Integrity**: Leverage relational constraints, foreign keys, and indexes for reliable queries.

Writing software is ultimately about human communication—between team members, maintainers, and end users. By choosing dependable building blocks like Node.js, SQLite/PostgreSQL, and React, teams can deliver performant experiences without unnecessary complexity.`,
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'published',
    new Date(Date.now() - 86400000 * 2).toISOString()
  );

  insertPost.run(
    jane.id,
    'The Art of Readable Code and Minimalist Design',
    'art-of-readable-code-and-minimalist-design',
    `Good design is as little design as possible. In both software engineering and user experience, elegance emerges when everything superfluous has been removed.

### Why Calm Interfaces Win
Today's web is often overwhelmed with flashing banners, oversized hero banners, and bloated animations that distract from the message. A clean editorial layout with a deep navy palette, a focused blue accent, and comfortable reading line length (around 680 to 760 pixels) allows readers to absorb ideas without fatigue.

Take time to refine your typography, give elements generous breathing room, and let content take center stage.`,
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    'published',
    new Date(Date.now() - 86400000).toISOString()
  );

  insertPost.run(
    admin.id,
    'Welcome to the Platform: Principles and Moderation Guidelines',
    'welcome-to-the-platform',
    `Welcome to our new community publishing platform! Our mission is to make it effortless for people to publish thoughtful articles and engage in constructive discussions.

### Community Values
- **Respectful Discourse**: Comments should add perspective and foster productive conversation.
- **Content Quality**: Clear writing and constructive feedback are warmly encouraged.
- **Safety First**: Spam, harassment, and unauthorized content will be promptly moderated by administrators.

Feel free to browse published articles, create an account, publish your insights, and leave your thoughts in the comments below!`,
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    'published',
    new Date().toISOString()
  );

  insertPost.run(
    jane.id,
    'Draft: Upcoming Innovations in Frontend Engineering',
    'draft-upcoming-innovations-frontend',
    `This is a private draft detailing emerging frontend trends including server components, native web standards, and hybrid rendering strategies. Only visible to author and admin.`,
    null,
    'draft',
    new Date().toISOString()
  );

  const posts = db.prepare('SELECT id, slug FROM posts').all();
  const post1 = posts.find(p => p.slug === 'building-scalable-web-applications');
  const post2 = posts.find(p => p.slug === 'art-of-readable-code-and-minimalist-design');

  const insertComment = db.prepare(`
    INSERT INTO comments (postId, authorId, content, createdAt)
    VALUES (?, ?, ?, ?)
  `);

  if (post1) {
    insertComment.run(
      post1.id,
      john.id,
      'Great article! The point about relational integrity and explicit API response envelopes resonated with me.',
      new Date(Date.now() - 3600000 * 20).toISOString()
    );
    insertComment.run(
      post1.id,
      jane.id,
      'Thanks John! Having predictable JSON envelopes really speeds up frontend integration and error handling.',
      new Date(Date.now() - 3600000 * 18).toISOString()
    );
  }

  if (post2) {
    insertComment.run(
      post2.id,
      john.id,
      'I really appreciate the calm editorial design of this blog. It is so easy on the eyes.',
      new Date(Date.now() - 3600000 * 10).toISOString()
    );
  }

  console.log('Database seeded successfully!');
  console.log('Demo Credentials:');
  console.log('  Admin:  admin@example.com / Admin@123');
  console.log('  Author: jane@example.com  / Author@123');
  console.log('  Reader: john@example.com  / Reader@123');
}

if (require.main === module) {
  seed();
}

module.exports = seed;

