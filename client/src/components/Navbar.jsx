import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  PenSquare, 
  User, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X,
  Search
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        gap: '1rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          color: 'var(--color-dark)',
          fontWeight: 700,
          fontSize: '1.25rem',
          letterSpacing: '-0.02em'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)'
          }}>
            <BookOpen size={20} />
          </span>
          <span>Blog Platform</span>
        </Link>

        {/* Search form in navbar (desktop) */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'none',
          alignItems: 'center',
          position: 'relative',
          maxWidth: '320px',
          width: '100%',
          marginLeft: '1rem'
        }} className="desktop-search">
          <Search size={16} style={{
            position: 'absolute',
            left: '0.75rem',
            color: 'var(--color-muted)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.8rem 0.45rem 2.2rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
              fontSize: '0.875rem'
            }}
          />
        </form>

        {/* Desktop Nav Items */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '1rem'
        }} className="desktop-nav">
          <Link to="/" className="btn btn-outline btn-sm" style={{ border: 'none', color: 'var(--color-text)' }}>
            Feed
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/write" className="btn btn-primary btn-sm">
                <PenSquare size={16} />
                <span>Write</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm" style={{ color: 'var(--color-primary)' }}>
                  <ShieldAlert size={16} />
                  <span>Admin</span>
                </Link>
              )}

              <Link to="/profile" className="btn btn-secondary btn-sm">
                <User size={16} />
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-sm mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          style={{ display: 'none' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }} className="mobile-dropdown">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Search size={16} />
            </button>
          </form>

          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0', color: 'var(--color-dark)', fontWeight: 600 }}
          >
            Feed
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to="/write" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <PenSquare size={16} />
                <span>Write a Post</span>
              </Link>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  <ShieldAlert size={16} />
                  <span>Admin Moderation</span>
                </Link>
              )}

              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <User size={16} />
                <span>My Profile & Posts</span>
              </Link>

              <button 
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <LogOut size={16} />
                <span>Sign Out ({user?.email})</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .desktop-search { display: flex !important; }
          .desktop-nav { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-menu-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}

