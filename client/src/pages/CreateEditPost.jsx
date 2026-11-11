import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FeedbackBanner from '../components/FeedbackBanner';
import { ArrowLeft, Save, FileText, Image as ImageIcon, Send, Sparkles } from 'lucide-react';

export default function CreateEditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: isEditing ? `/edit/${id}` : '/write' } } });
      return;
    }

    if (isEditing) {
      loadPostForEdit();
    }
  }, [id, isAuthenticated]);

  async function loadPostForEdit() {
    try {
      setLoadingInitial(true);
      const res = await api.getPost(id);
      if (res && res.success && res.data && res.data.post) {
        const post = res.data.post;

        // Verify authorization
        if (post.authorId !== user.id && !isAdmin) {
          alert('You are not authorized to edit this article.');
          navigate('/');
          return;
        }

        setTitle(post.title || '');
        setContent(post.content || '');
        setCoverImageUrl(post.coverImageUrl || '');
        setStatus(post.status || 'published');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load post for editing.');
    } finally {
      setLoadingInitial(false);
    }
  }

  async function handleSubmit(e, targetStatus = status) {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a title for your article.');
      return;
    }

    if (!content.trim()) {
      setErrorMessage('Please write some content for your article.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        status: targetStatus
      };

      let resultPost;
      if (isEditing) {
        const res = await api.updatePost(id, payload);
        resultPost = res.data.post;
      } else {
        const res = await api.createPost(payload);
        resultPost = res.data.post;
      }

      navigate(`/posts/${resultPost.slug || resultPost.id}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInitial) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--color-muted)' }}>Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      {/* Top back action */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Cancel & Return</span>
        </button>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--color-dark)' }}>
              {isEditing ? 'Edit Article' : 'Write a New Article'}
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Craft clear ideas and engage your audience.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
            >
              <option value="published">Published</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <FeedbackBanner
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={(e) => handleSubmit(e, status)}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">
              Article Title *
            </label>
            <input
              id="post-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Architecture of High-Reliability Systems"
              className="form-input"
              style={{ fontSize: '1.15rem', fontWeight: 600 }}
            />
          </div>

          {/* Cover image URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-cover">
              Cover Image URL <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>(Optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="post-cover"
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
              <ImageIcon size={16} style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)'
              }} />
            </div>
            {coverImageUrl && (
              <div style={{ marginTop: '0.5rem', maxHeight: '140px', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  style={{ width: '100%', maxHeight: '140px', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="post-content">
                Article Content *
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                Supports Markdown & paragraph linebreaks
              </span>
            </div>
            <textarea
              id="post-content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article here. Share your methodology, findings, insights, or code..."
              className="form-textarea"
              style={{ minHeight: '320px', fontSize: '1rem', lineHeight: '1.6' }}
            />
          </div>

          {/* Actions button bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, 'draft')}
                className="btn btn-secondary"
              >
                <Save size={16} />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, 'published')}
                className="btn btn-primary"
              >
                <Send size={16} />
                <span>{submitting ? 'Saving...' : (status === 'draft' ? 'Publish Now' : (isEditing ? 'Update Post' : 'Publish Article'))}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

