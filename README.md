# Blog Platform with Comments

A full-stack, content-first blogging platform built according to the Product Requirements Document (PRD v1.0). Features a clean editorial user experience, secure authentication, rich post publication and drafts, interactive discussions with nested authorization checks, and an administrative moderation suite.

---

## 🌟 Highlights & Features

- **Clean Editorial Design**: Designed with a calm light theme (`#F8FAFC`), deep navy typography (`#14213D`), and focused blue accents (`#2563EB`). Built for comfortable line lengths (680–760px) and pure readability.
- **Role-Based Access Control**:
  - **Guest**: Browse published posts, search articles, view post details and comments, register/log in.
  - **Author / Registered User**: Create posts, save drafts, publish, edit/delete own posts, comment, edit/delete own comments.
  - **Admin**: Full moderation powers to remove inappropriate posts and comments across the entire platform.
- **Backend Authorization Enforcement**: Every sensitive mutation is strictly checked server-side (401 for unauthorized, 403 for forbidden actions).
- **Search & Pagination**: Live keyword search across post titles and contents with clean empty states and pagination controls.
- **Discussion System**: Authenticated comments with real-time UI updates, inline editing, and deletion protections.
- **Fast Local Execution**: Zero-config persistent relational database powered by Node.js native `node:sqlite` (compatible with PostgreSQL schema specifications).

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite 6 | Fast HMR, responsive components, accessible focus states |
| **Routing** | React Router v6 | Single-page application navigation with protected routes |
| **Icons** | Lucide React | Minimalist editorial iconography |
| **Backend** | Node.js + Express | RESTful API, structured JSON envelopes, centralized error handling |
| **Database** | SQLite (`node:sqlite`) | Relational integrity, foreign keys with cascading deletes, indexes |
| **Authentication** | JWT + HttpOnly Cookies | Secure token sessions with fallback Bearer header support |
| **Security** | bcryptjs, rate limiting | Salted password hashing, brute-force throttling on auth and comments |

---

## 📁 Project Structure

```text
Blog-Platform/
├── client/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, PostCard, Pagination, FeedbackBanner
│   │   ├── context/            # AuthContext (state, login, register, logout)
│   │   ├── pages/              # Home, Login, Register, PostDetail, CreateEditPost, Profile, AdminModeration
│   │   ├── services/           # api.js helper functions
│   │   └── styles/             # tokens.css, index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express REST backend
│   ├── data/                   # SQLite database storage (blog.db)
│   ├── src/
│   │   ├── config/             # Database connection (db.js) and seeder (seed.js)
│   │   ├── controllers/        # authController, postController, commentController
│   │   ├── middleware/         # auth, rateLimiter, errorHandler
│   │   ├── models/             # UserModel, PostModel, CommentModel
│   │   ├── routes/             # REST route endpoints
│   │   └── server.js           # Express app entrypoint
│   ├── test/                   # Acceptance criteria test suite (api.test.js)
│   ├── .env.example
│   └── package.json
│
├── postman_collection.json     # Postman collection with all REST endpoints
├── package.json                # Root monorepo script runner
└── README.md                   # Documentation and guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ or v24+
- **npm** v9+

### 2. Setup the Backend

```bash
cd server
npm install
npm run seed     # Seeds demo accounts and sample articles
npm run dev      # Starts Express server on http://localhost:8000
```

### 3. Setup the Frontend

In a second terminal window:

```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### 4. Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)**.

---

## 🔑 Pre-seeded Demo Credentials

For quick evaluation and testing, the database includes pre-configured accounts (also selectable via one-click buttons on the Login page):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin@123` | Full moderation access (`/admin`), edit/delete any content |
| **Author** | `jane@example.com` | `Author@123` | Author of sample posts, draft authoring, commenting |
| **Reader** | `john@example.com` | `Reader@123` | Active commenter, reader profile |

---

## 🧪 Automated Testing & Acceptance Criteria

An automated acceptance test suite verifies all requirements from Section 8 of the PRD:

| Criteria ID | Acceptance Test | Status |
| :--- | :--- | :--- |
| **AC-01** | Register with valid details (password hashed) | ✅ Passed |
| **AC-02** | Register with existing email (409 Conflict duplicate message) | ✅ Passed |
| **AC-03** | Log in with valid / invalid credentials (401 on invalid) | ✅ Passed |
| **AC-04** | Publish a post (appears in public feed) | ✅ Passed |
| **AC-05** | Edit/delete another user's post rejected with 403 Forbidden | ✅ Passed |
| **AC-06** | Add comment while logged in (appears under post) | ✅ Passed |
| **AC-07** | Comment while logged out rejected with 401 Unauthorized | ✅ Passed |
| **AC-08** | Edit/delete another user's comment rejected unless admin | ✅ Passed |
| **AC-09** | Search and paginate posts (query filtering & pagination) | ✅ Passed |
| **AC-10** | Mobile responsive layouts (no horizontal overflow) | ✅ Passed |
| **AC-11** | Backend/database unavailable (friendly UI error + retry) | ✅ Passed |

To run the test suite:

```bash
cd server
npm test
```

---

## 📡 REST API Reference

All responses conform to the standard PRD envelope convention:
- Success: `{ "success": true, "data": { ... } }`
- Error: `{ "success": false, "message": "..." }`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | Public |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & set JWT session | Public |
| `POST` | `/api/auth/logout` | Clear session cookie | Authenticated |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Authenticated |
| `GET` | `/api/posts` | List published posts with pagination & search | Public |
| `GET` | `/api/posts/:id` | Fetch post by ID/slug and its comments | Public |
| `POST` | `/api/posts` | Create new post (published or draft) | Authenticated |
| `PUT` | `/api/posts/:id` | Update post details or status | Owner / Admin |
| `DELETE` | `/api/posts/:id` | Remove post and cascade comments | Owner / Admin |
| `POST` | `/api/posts/:id/comments` | Add comment to post | Authenticated |
| `PUT` | `/api/comments/:id` | Edit comment content | Comment Author / Admin |
| `DELETE` | `/api/comments/:id` | Delete comment | Comment Author / Admin |
| `GET` | `/api/users/:id/posts` | List an author's articles | Public |
| `GET` | `/api/admin/moderation` | Moderation overview of posts and comments | Admin |

A complete **Postman Collection** is provided in [`postman_collection.json`](./postman_collection.json). You can import it into Postman directly.

---

## 📄 License

This project is licensed under the MIT License.
