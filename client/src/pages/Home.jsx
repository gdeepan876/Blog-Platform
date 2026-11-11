import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import FeedbackBanner from '../components/FeedbackBanner';
import { Search, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, totalPosts: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(initialSearch);

  useEffect(() => {
    const querySearch = searchParams.get('search') || '';
    const queryPage = parseInt(searchParams.get('page') || '1', 10);
    setSearchInput(querySearch);
    fetchPosts(queryPage, querySearch);
  }, [searchParams]);

  async function fetchPosts(page = 1, search = '') {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPosts({ page, limit: 6, search });
      if (res && res.success && res.data) {
        setPosts(res.data.posts || []);
        setPagination(res.data.pagination || { page, limit: 6, totalPosts: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) {
      params.set('search', searchInput.trim());
    }
    params.set('page', '1');
    setSearchParams(params);
  }

  function handleClearSearch() {
    setSearchInput('');
    setSearchParams({});
  }

  function handlePageChange(newPage) {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeSearch = searchParams.get('search');

  return (
    <div className="container">
      {/* Editorial Header Banner */}
      <section style={{
        paddingTop: '2rem',
        paddingBottom: '2.5rem',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ maxWidth: '760px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Sparkles size={16} />
            <span>Curated Insights & Discourse</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            letterSpacing: '-0.03em',
            marginBottom: '0.85rem',
            color: 'var(--color-dark)'
          }}>
            Where ideas find clarity and readers converse.
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--color-muted)',
            lineHeight: '1.6',
            maxWidth: '640px'
          }}>
            A clean, editorial platform crafted for thoughtful articles and authentic discussions. No oversized distractions—just pure ideas.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '1.75rem', maxWidth: '580px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles by title or keyword..."
                className="form-input"
                style={{
                  paddingLeft: '2.5rem',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Search
            </button>
            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn btn-secondary"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Clear
              </button>
            )}
          </form>

          {activeSearch && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Showing results for: <strong>"{activeSearch}"</strong> ({pagination.totalPosts} {pagination.totalPosts === 1 ? 'post' : 'posts'} found)
            </p>
          )}
        </div>
      </section>

      {/* Error state with retry (AC-11) */}
      {error && (
        <FeedbackBanner
          type="error"
          message={error}
          onRetry={() => fetchPosts(pagination.page, activeSearch || '')}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>Loading articles...</p>
        </div>
      ) : posts.length === 0 ? (
        /* Useful empty state (FR-09) */
        <div className="empty-state">
          <BookOpen size={48} style={{ color: 'var(--color-muted)', strokeWidth: 1.5 }} />
          <h2 className="empty-state-title">
            {activeSearch ? 'No articles match your query' : 'No articles published yet'}
          </h2>
          <p className="empty-state-desc">
            {activeSearch
              ? `We couldn't find any articles matching "${activeSearch}". Try another search term or browse all articles.`
              : 'Be the first author to publish an article and share your perspective with the community.'}
          </p>
          {activeSearch ? (
            <button onClick={handleClearSearch} className="btn btn-secondary">
              View All Articles
            </button>
          ) : (
            <Link to="/write" className="btn btn-primary">
              Write a Post
            </Link>
          )}
        </div>
      ) : (
        /* Feed grid */
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
            alignItems: 'stretch'
          }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination controls (AC-09) */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

