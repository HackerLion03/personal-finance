import React from 'react';
import './Navigation.css';

function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'banks', icon: '🏦', label: 'Banks' },
    { id: 'subscriptions', icon: '📅', label: 'Subscriptions' },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">💰</span>
          <span className="logo-text">Finance</span>
        </div>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;