const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const path = require('node:path');

// Unique database for this test run to prevent file lock issues on Windows
const testDbName = `./data/test_blog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.db`;
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = testDbName;

const app = require('../src/server');
const UserModel = require('../src/models/userModel');

let server;
let baseUrl;

function request(method, reqPath, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

test('API Test Suite - Verification of PRD Acceptance Criteria', async (t) => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let adminToken;
  let createdPostId;
  let createdCommentId;

  await t.test('Health check: GET /api/health', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.status, 'healthy');
  });

  await t.test('AC-01: Register with valid details (password hashed)', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Alice Admin',
      email: 'alice@example.com',
      password: 'Password123'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, 'alice@example.com');
    assert.strictEqual(res.body.data.user.role, 'admin'); // first user is admin
    assert.strictEqual(res.body.data.user.passwordHash, undefined); // password not returned

    // Check DB raw password is not plain text
    const rawUser = UserModel.findByEmail('alice@example.com');
    assert.ok(rawUser.passwordHash.startsWith('$2'));

    adminToken = res.body.data.token;
  });

  await t.test('AC-02: Register with an existing email returns 409 Conflict', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'Duplicate Alice',
      email: 'alice@example.com',
      password: 'Password123'
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  await t.test('Register User 1 and User 2', async () => {
    const res1 = await request('POST', '/api/auth/register', {
      name: 'Bob Author',
      email: 'bob@example.com',
      password: 'Password123'
    });
    assert.strictEqual(res1.status, 201);
    user1Token = res1.body.data.token;
    user1Id = res1.body.data.user.id;

    const res2 = await request('POST', '/api/auth/register', {
      name: 'Charlie Reader',
      email: 'charlie@example.com',
      password: 'Password123'
    });
    assert.strictEqual(res2.status, 201);
    user2Token = res2.body.data.token;
    user2Id = res2.body.data.user.id;
  });

  await t.test('AC-03: Log in with valid and invalid credentials', async () => {
    // Invalid password
    const badRes = await request('POST', '/api/auth/login', {
      email: 'bob@example.com',
      password: 'WrongPassword'
    });
    assert.strictEqual(badRes.status, 401);
    assert.strictEqual(badRes.body.success, false);

    // Valid login
    const goodRes = await request('POST', '/api/auth/login', {
      email: 'bob@example.com',
      password: 'Password123'
    });
    assert.strictEqual(goodRes.status, 200);
    assert.strictEqual(goodRes.body.success, true);
    assert.strictEqual(goodRes.body.data.user.email, 'bob@example.com');
  });

  await t.test('AC-04: Publish a post and verify it appears in feed', async () => {
    const res = await request(
      'POST',
      '/api/posts',
      {
        title: 'Modern Architecture Patterns',
        content: 'Explaining clean decoupled architectures and relational integrity.',
        coverImageUrl: 'https://images.unsplash.com/photo-1',
        status: 'published'
      },
      user1Token
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.post.title, 'Modern Architecture Patterns');
    createdPostId = res.body.data.post.id;

    // Check feed
    const feedRes = await request('GET', '/api/posts');
    assert.strictEqual(feedRes.status, 200);
    assert.strictEqual(feedRes.body.success, true);
    const found = feedRes.body.data.posts.find((p) => p.id === createdPostId);
    assert.ok(found);
  });

  await t.test('AC-05: Edit/delete another user\'s post rejected with 403', async () => {
    // User 2 attempts to edit User 1's post
    const editRes = await request(
      'PUT',
      `/api/posts/${createdPostId}`,
      { title: 'Hacked Title' },
      user2Token
    );
    assert.strictEqual(editRes.status, 403);
    assert.strictEqual(editRes.body.success, false);

    // User 2 attempts to delete User 1's post
    const delRes = await request('DELETE', `/api/posts/${createdPostId}`, null, user2Token);
    assert.strictEqual(delRes.status, 403);
    assert.strictEqual(delRes.body.success, false);

    // Owner (User 1) can edit
    const ownerEdit = await request(
      'PUT',
      `/api/posts/${createdPostId}`,
      { title: 'Updated Architecture Patterns' },
      user1Token
    );
    assert.strictEqual(ownerEdit.status, 200);
    assert.strictEqual(ownerEdit.body.data.post.title, 'Updated Architecture Patterns');
  });

  await t.test('AC-06: Add a comment while logged in', async () => {
    const res = await request(
      'POST',
      `/api/posts/${createdPostId}/comments`,
      { content: 'Super insightful read, Bob!' },
      user2Token
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.comment.content, 'Super insightful read, Bob!');
    createdCommentId = res.body.data.comment.id;

    // Check post details includes comment
    const detailRes = await request('GET', `/api/posts/${createdPostId}`);
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.data.comments.length, 1);
    assert.strictEqual(detailRes.body.data.comments[0].content, 'Super insightful read, Bob!');
  });

  await t.test('AC-07: Comment while logged out returns 401', async () => {
    const res = await request('POST', `/api/posts/${createdPostId}/comments`, {
      content: 'Anonymous comment'
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  await t.test('AC-08: Edit/delete another user\'s comment rejected unless admin', async () => {
    // User 1 tries to delete User 2's comment -> 403
    const forbiddenRes = await request(
      'DELETE',
      `/api/comments/${createdCommentId}`,
      null,
      user1Token
    );
    assert.strictEqual(forbiddenRes.status, 403);

    // Admin can delete comment -> 200
    const adminDelRes = await request(
      'DELETE',
      `/api/comments/${createdCommentId}`,
      null,
      adminToken
    );
    assert.strictEqual(adminDelRes.status, 200);
    assert.strictEqual(adminDelRes.body.success, true);
  });

  await t.test('AC-09: Search and paginate posts', async () => {
    // Add additional post
    await request(
      'POST',
      '/api/posts',
      {
        title: 'Deep Dive into CSS Grid',
        content: 'Responsive web layouts without extra wrapper elements.',
        status: 'published'
      },
      user1Token
    );

    // Search for "Grid"
    const searchRes = await request('GET', '/api/posts?search=Grid');
    assert.strictEqual(searchRes.status, 200);
    assert.strictEqual(searchRes.body.data.posts.length, 1);
    assert.strictEqual(searchRes.body.data.posts[0].title, 'Deep Dive into CSS Grid');

    // Search with no results
    const emptyRes = await request('GET', '/api/posts?search=nonexistentqueryxyz');
    assert.strictEqual(emptyRes.status, 200);
    assert.strictEqual(emptyRes.body.data.posts.length, 0);

    // Pagination
    const pageRes = await request('GET', '/api/posts?limit=1&page=1');
    assert.strictEqual(pageRes.status, 200);
    assert.strictEqual(pageRes.body.data.posts.length, 1);
    assert.strictEqual(pageRes.body.data.pagination.page, 1);
    assert.strictEqual(pageRes.body.data.pagination.limit, 1);
    assert.ok(pageRes.body.data.pagination.totalPages >= 2);
  });
});
