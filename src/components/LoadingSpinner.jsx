const LoadingSpinner = ({ size = 'medium', text = 'Carregando...' }) => {
  const sizeClasses = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div
        style={{
          width: sizeClasses[size],
          height: sizeClasses[size],
          border: '3px solid #f3f3f3',
          borderTop: '3px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{ marginTop: '1rem', color: 'var(--text-color)' }}>{text}</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;