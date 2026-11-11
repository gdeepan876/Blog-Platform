import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostDetail from './pages/PostDetail';
import CreateEditPost from './pages/CreateEditPost';
import Profile from './pages/Profile';
import AdminModeration from './pages/AdminModeration';

function NotFound() {
  return (
    <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--color-dark)', marginBottom: '1rem' }}>404</h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/write" element={<CreateEditPost />} />
            <Route path="/edit/:id" element={<CreateEditPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:id/posts" element={<Profile />} />
            <Route path="/admin" element={<AdminModeration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

