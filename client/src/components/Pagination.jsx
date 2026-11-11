import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav 
      aria-label="Pagination Navigation" 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        marginTop: '2.5rem'
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn btn-secondary btn-sm"
        aria-label="Previous page"
        style={{ padding: '0.4rem 0.6rem' }}
      >
        <ChevronLeft size={16} />
        <span style={{ display: 'none' }} className="page-nav-text">Prev</span>
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              minWidth: '36px',
              height: '36px',
              padding: '0'
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn btn-secondary btn-sm"
        aria-label="Next page"
        style={{ padding: '0.4rem 0.6rem' }}
      >
        <span style={{ display: 'none' }} className="page-nav-text">Next</span>
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

