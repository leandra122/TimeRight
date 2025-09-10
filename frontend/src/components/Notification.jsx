import { useState, useEffect } from 'react';

const Notification = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' },
    error: { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' },
    warning: { backgroundColor: '#fff3cd', color: '#856404', borderColor: '#ffeaa7' },
    info: { backgroundColor: '#d1ecf1', color: '#0c5460', borderColor: '#bee5eb' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: '400px',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease-in-out',
        ...typeStyles[type]
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            marginLeft: '1rem',
            color: 'inherit'
          }}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;