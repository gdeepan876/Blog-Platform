import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Calendar, User, ArrowRight } from 'lucide-react';

export default function PostCard({ post, showStatus = false, onEdit, onDelete, canManage = false }) {
  // Format date cleanly
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  // Generate clean excerpt from content
  const excerpt = post.content
    ? post.content.replace(/#+\s/g, '').replace(/[*_`]/g, '').slice(0, 160) + (post.content.length > 160 ? '...' : '')
    : '';

  return (
    <article className="card post-card" style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      overflow: 'hidden',
      transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
      border: '1px solid var(--color-border)',
      height: '100%'
    }}>
      {post.coverImageUrl && (
        <Link to={`/posts/${post.slug || post.id}`} style={{ overflow: 'hidden', display: 'block', maxHeight: '200px' }}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            loading="lazy"
            style={{
              width: '100%',
              height: '190px',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              // Hide image if broken link
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>
      )}

      <div style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '0.75rem'
      }}>
        {/* Meta tags & status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--color-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={14} />
            <span style={{ fontWeight: 500, color: 'var(--color-dark)' }}>{post.authorName || 'Author'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.25rem',
          lineHeight: '1.35',
          marginTop: '0.25rem'
        }}>
          <Link
            to={`/posts/${post.slug || post.id}`}
            style={{
              color: 'var(--color-dark)',
              textDecoration: 'none'
            }}
            className="post-card-title-link"
          >
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p style={{
          color: 'var(--color-muted)',
          fontSize: '0.9375rem',
          lineHeight: '1.55',
          flex: 1
        }}>
          {excerpt}
        </p>

        {/* Card footer: Comments count, Read more, Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: 'auto',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--color-muted)'
            }}>
              <MessageSquare size={14} />
              <span>{post.commentCount || 0}</span>
            </span>

            {showStatus && (
              <span className={`badge ${post.status === 'draft' ? 'badge-draft' : 'badge-published'}`}>
                {post.status}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {canManage && (
              <>
                <button
                  onClick={() => onEdit && onEdit(post)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(post.id)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Delete
                </button>
              </>
            )}

            <Link
              to={`/posts/${post.slug || post.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                textDecoration: 'none'
              }}
            >
              <span>Read</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .post-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .post-card-title-link:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </article>
  );
}

