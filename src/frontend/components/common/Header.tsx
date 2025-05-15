import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">
        Recruiter Platform
      </div>
      <div className="header-right">
        <div className="notifications">
          <span className="notification-icon">🔔</span>
        </div>
        <div className="user-profile">
          <span className="user-avatar">👤</span>
          <span className="user-name">Recruiter Name</span>
        </div>
      </div>
    </header>
  );
};
