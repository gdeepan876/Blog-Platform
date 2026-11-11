import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import FeedbackBanner from '../components/FeedbackBanner';
import { User, Mail, Calendar, PenSquare, Shield, FileText } from 'lucide-react';

export default function Profile() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  // If paramId is present, we are viewing that specific author; otherwise viewing current logged-in user
  const targetUserId = paramId ? parseInt(paramId, 10) : currentUser?.id;
  const isSelf = currentUser && currentUser.id === targetUserId;

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!paramId && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (targetUserId) {
      loadProfileAndPosts();
    }
  }, [targetUserId, paramId, isAuthenticated]);

  async function loadProfileAndPosts() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getUserPosts(targetUserId);
      if (res && res.success && res.data) {
        setAuthor(res.data.author);
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
    }
  }

  function handleEditPost(post) {
    navigate(`/edit/${post.id}`);
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-muted)' }}>Loading author profile...</p>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: '3rem' }}>
        <FeedbackBanner
          type="error"
          message={error || 'Author profile not found.'}
          onRetry={loadProfileAndPosts}
        />
      </div>
    );
  }

  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'all') return true;
    return post.status === filterStatus;
  });

  return (
    <div className="container">
      {/* Profile Header Card */}
      <div className="card" style={{
        marginBottom: '2.5rem',
        padding: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700
          }}>
            {author.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: 'var(--color-dark)' }}>{author.name}</h1>
              {author.role === 'admin' && (
                <span className="badge badge-admin">
                  <Shield size={12} style={{ marginRight: '0.2rem' }} />
                  Admin
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.35rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={14} />
                {author.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} />
                Joined {new Date(author.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {isSelf && (
          <Link to="/write" className="btn btn-primary">
            <PenSquare size={16} />
            <span>Write New Article</span>
          </Link>
        )}
      </div>

      {/* Filter and stats row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.75rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--color-dark)' }}>
          {isSelf ? 'My Articles' : `${author.name}'s Articles`} ({filteredPosts.length})
        </h2>

        {isSelf && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setFilterStatus('all')}
              className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({posts.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`btn btn-sm ${filterStatus === 'published' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Published ({posts.filter(p => p.status === 'published').length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`btn btn-sm ${filterStatus === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Drafts ({posts.filter(p => p.status === 'draft').length})
            </button>
          </div>
        )}
      </div>

      {/* Posts Grid or Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="empty-state">
          <FileText size={44} style={{ color: 'var(--color-muted)' }} />
          <h3 className="empty-state-title">No articles found</h3>
          <p className="empty-state-desc">
            {isSelf
              ? (filterStatus === 'draft' ? 'You have no saved drafts.' : "You haven't written any articles yet.")
              : 'This author has not published any articles yet.'}
          </p>
          {isSelf && (
            <Link to="/write" className="btn btn-primary">
              Write Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              showStatus={isSelf}
              canManage={isSelf || currentUser?.role === 'admin'}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

