import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FeedbackBanner from '../components/FeedbackBanner';
import { 
  Calendar, 
  User, 
  Clock, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  ArrowLeft,
  Send,
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState({ type: '', message: '' });

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    fetchPostAndComments();
  }, [id]);

  async function fetchPostAndComments() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPost(id);
      if (res && res.success && res.data) {
        setPost(res.data.post);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err.message || 'Article not found or server is unreachable.');
    } finally {
      setLoading(false);
    }
  }

  // Post Actions (Author or Admin)
  const isPostOwner = user && post && user.id === post.authorId;
  const canManagePost = isPostOwner || isAdmin;

  async function handleDeletePost() {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deletePost(post.id);
      navigate('/', { replace: true });
    } catch (err) {
      alert(err.message || 'Failed to delete post.');
    }
  }

  // Comment Actions
  async function handleAddComment(e) {
    e.preventDefault();
    setCommentFeedback({ type: '', message: '' });

    if (!commentText.trim()) {
      setCommentFeedback({ type: 'error', message: 'Comment cannot be blank.' });
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await api.addComment(post.id, commentText.trim());
      if (res && res.success && res.data) {
        // Append newly created comment
        setComments([...comments, res.data.comment]);
        setCommentText('');
        setCommentFeedback({ type: 'success', message: 'Comment posted successfully.' });
        setTimeout(() => setCommentFeedback({ type: '', message: '' }), 4000);
      }
    } catch (err) {
      setCommentFeedback({ type: 'error', message: err.message || 'Failed to submit comment.' });
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleSaveEditComment(commentId) {
    if (!editingCommentText.trim()) return;

    try {
      const res = await api.editComment(commentId, editingCommentText.trim());
      if (res && res.success && res.data) {
        setComments(comments.map(c => c.id === commentId ? res.data.comment : c));
        setEditingCommentId(null);
        setEditingCommentText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to edit comment.');
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await api.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Failed to delete comment.');
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-muted)' }}>Loading article...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ maxWidth: '640px', paddingTop: '3rem' }}>
        <FeedbackBanner
          type="error"
          message={error || 'The requested article could not be loaded.'}
          onRetry={fetchPostAndComments}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Return to Feed</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate estimated reading time
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="container">
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-muted)',
            fontWeight: 500,
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
      </div>

      <article className="article-container">
        {/* Article Header */}
        <header style={{ marginBottom: '2rem' }}>
          {post.status === 'draft' && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-draft">Draft (Unpublished)</span>
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            lineHeight: '1.2',
            letterSpacing: '-0.025em',
            marginBottom: '1.25rem',
            color: 'var(--color-dark)'
          }}>
            {post.title}
          </h1>

          {/* Author & Meta bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '0.9rem',
            color: 'var(--color-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <Link 
                to={`/users/${post.authorId}/posts`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--color-dark)',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={16} />
                </span>
                <span>{post.authorName}</span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} />
                <span>{formattedDate}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={15} />
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Author / Admin Edit & Delete buttons */}
            {canManagePost && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to={`/edit/${post.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="btn btn-danger btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div style={{
            marginBottom: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            maxHeight: '440px',
            border: '1px solid var(--color-border)'
          }}>
            <img
              src={post.coverImageUrl}
              alt={post.title}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover'
              }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Article Body */}
        <div className="article-prose" style={{
          whiteSpace: 'pre-line',
          marginBottom: '3.5rem'
        }}>
          {post.content}
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '3rem 0' }} />

        {/* Comments Section */}
        <section id="comments-section" style={{ marginTop: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-dark)'
            }}>
              <MessageSquare size={22} style={{ color: 'var(--color-primary)' }} />
              <span>Discussion ({comments.length})</span>
            </h2>
          </div>

          {/* Comment Feedback Alert */}
          {commentFeedback.message && (
            <FeedbackBanner
              type={commentFeedback.type}
              message={commentFeedback.message}
              onClose={() => setCommentFeedback({ type: '', message: '' })}
            />
          )}

          {/* Add Comment Form or Login Prompt */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} style={{
              marginBottom: '2.5rem',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                color: 'var(--color-dark)',
                fontWeight: 600
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span>Comment as {user.name}</span>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your constructive perspective or feedback..."
                className="form-textarea"
                style={{
                  minHeight: '90px',
                  marginBottom: '0.75rem'
                }}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Send size={14} />
                  <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              textAlign: 'center',
              marginBottom: '2.5rem'
            }}>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                Sign in to join the conversation and leave a comment.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <Link to="/login" state={{ from: { pathname: `/posts/${id}` } }} className="btn btn-primary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Create Account
                </Link>
              </div>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'var(--color-muted)',
              fontSize: '0.95rem'
            }}>
              No comments on this article yet. Be the first to start the discussion!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((comment) => {
                const isAuthor = user && user.id === comment.authorId;
                const canModerate = isAuthor || isAdmin;
                const isEditing = editingCommentId === comment.id;

                const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div
                    key={comment.id}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      backgroundColor: 'var(--color-surface)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: '#f1f5f9',
                          color: 'var(--color-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {(comment.authorName || 'U').charAt(0).toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--color-dark)' }}>
                          {comment.authorName}
                        </span>
                        {comment.authorId === post.authorId && (
                          <span className="badge badge-admin" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                            Author
                          </span>
                        )}
                        <span style={{ color: 'var(--color-muted)' }}>• {commentDate}</span>
                      </div>

                      {canModerate && !isEditing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {isAuthor && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentText(comment.content);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div style={{ marginTop: '0.5rem' }}>
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="form-textarea"
                          style={{ minHeight: '70px', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingCommentText('');
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditComment(comment.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p style={{
                        fontSize: '0.95rem',
                        lineHeight: '1.55',
                        color: 'var(--color-text)',
                        marginTop: '0.25rem',
                        whiteSpace: 'pre-line'
                      }}>
                        {comment.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}

