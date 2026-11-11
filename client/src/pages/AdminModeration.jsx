import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FeedbackBanner from '../components/FeedbackBanner';
import { Shield, Trash2, ExternalLink, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminModeration() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        navigate('/');
        return;
      }
      loadModerationData();
    }
  }, [isAdmin, authLoading]);

  async function loadModerationData() {
    try {
      setLoading(true);
      const res = await api.getAdminModeration();
      if (res && res.success && res.data) {
        setPosts(res.data.posts || []);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load moderation data.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemovePost(postId, title) {
    if (!window.confirm(`Are you sure you want to remove the post "${title}" as admin?`)) {
      return;
    }
    try {
      await api.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      setComments(comments.filter(c => c.postId !== postId));
      setFeedback({ type: 'success', message: `Post "${title}" removed successfully.` });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove post.' });
    }
  }

  async function handleRemoveComment(commentId) {
    if (!window.confirm('Are you sure you want to delete this comment as admin?')) {
      return;
    }
    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      setFeedback({ type: 'success', message: 'Comment removed successfully.' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to remove comment.' });
    }
  }

  if (loading || authLoading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-muted)' }}>Loading moderation panel...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)'
          }}>
            <Shield size={22} />
          </span>
          <div>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--color-dark)' }}>Admin Moderation Panel</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Manage community content and remove inappropriate posts or comments.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('posts')}
            className={`btn btn-sm ${activeTab === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileText size={15} />
            <span>Articles ({posts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`btn btn-sm ${activeTab === 'comments' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <MessageSquare size={15} />
            <span>Comments ({comments.length})</span>
          </button>
        </div>
      </div>

      {feedback.message && (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Moderation Tables */}
      {activeTab === 'posts' ? (
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Title</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Author</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Created</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontWeight: 600 }}>
                    <Link to={`/posts/${post.slug || post.id}`} style={{ color: 'var(--color-dark)' }}>
                      {post.title}
                    </Link>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-muted)' }}>
                    {post.authorName} ({post.authorEmail})
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span className={`badge ${post.status === 'draft' ? 'badge-draft' : 'badge-published'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-muted)' }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        to={`/posts/${post.slug || post.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => handleRemovePost(post.id, post.title)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        title="Remove Post"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No posts available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)', color: 'var(--color-dark)' }}>
                <th style={{ padding: '0.9rem 1.25rem' }}>Comment Content</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Author</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Article</th>
                <th style={{ padding: '0.9rem 1.25rem' }}>Date</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map(comment => (
                <tr key={comment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.9rem 1.25rem', maxWidth: '380px' }}>
                    <p style={{ margin: 0, wordBreak: 'break-word' }}>{comment.content}</p>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                    {comment.authorName}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', whiteSpace: 'nowrap' }}>
                    <Link to={`/posts/${comment.postId}`} style={{ color: 'var(--color-primary)' }}>
                      {comment.postTitle || `Post #${comment.postId}`}
                    </Link>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleRemoveComment(comment.id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      title="Delete Comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No comments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

