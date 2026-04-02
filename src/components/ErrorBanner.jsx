import React from 'react';

/**
 * Banner de error dismissable.
 * @param {string} message - Mensaje de error a mostrar
 * @param {function} onClose - Callback para cerrar el banner
 */
export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div style={{
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      color: '#b91c1c',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      fontSize: '0.9rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span>⚠️ {message}</span>
      <button
        onClick={onClose}
        style={{ background: 'none', color: '#b91c1c', fontWeight: 700, flexShrink: 0 }}
        aria-label="Cerrar error"
      >
        ✕
      </button>
    </div>
  );
}
