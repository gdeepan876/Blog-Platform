import React from 'react';
import { AlertCircle, CheckCircle2, Info, RefreshCw } from 'lucide-react';

export default function FeedbackBanner({ type = 'error', message, onRetry, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`alert ${isError ? 'alert-error' : isSuccess ? 'alert-success' : 'alert-info'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {isError && <AlertCircle size={20} />}
        {isSuccess && <CheckCircle2 size={20} />}
        {!isError && !isSuccess && <Info size={20} />}
        <span>{message}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.8rem',
              backgroundColor: 'rgba(255,255,255,0.85)'
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: '0.2rem',
              fontSize: '1.1rem',
              lineHeight: 1
            }}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

