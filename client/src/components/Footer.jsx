import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      paddingTop: '2.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)'
          }}>
            <BookOpen size={16} />
          </span>
          <span style={{ fontWeight: 700, color: 'var(--color-dark)' }}>Blog Platform</span>
          <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            • Editorial content-first publishing
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--color-muted)'
        }}>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
          <Link to="/write" style={{ color: 'inherit' }}>Write</Link>
          <a href="#top" style={{ color: 'inherit' }}>Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}

