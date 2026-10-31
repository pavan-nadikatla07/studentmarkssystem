import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onDismiss }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`alert alert-${type}`}>
      {icons[type]}
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
