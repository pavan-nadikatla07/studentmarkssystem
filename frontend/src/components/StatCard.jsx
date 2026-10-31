import React from 'react';

const StatCard = ({ icon: Icon, color = 'blue', label, value, subtext }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
