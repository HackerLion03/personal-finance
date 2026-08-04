import React, { useState } from 'react';
import './Subscriptions.css';

function Subscriptions({ subscriptions, onAddSubscription, onDeleteSubscription, onToggleSubscription }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    nextDue: '',
    category: '',
    description: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddSubscription({
      ...newSub,
      amount: parseFloat(newSub.amount)
    });
    setNewSub({
      name: '',
      amount: '',
      frequency: 'monthly',
      nextDue: '',
      category: '',
      description: '',
      isActive: true
    });
    setShowAddForm(false);
  };

  const totalMonthly = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => {
      let monthlyAmount = s.amount;
      if (s.frequency === 'yearly') monthlyAmount = s.amount / 12;
      if (s.frequency === 'weekly') monthlyAmount = s.amount * 4.33;
      return sum + monthlyAmount;
    }, 0);

  const totalYearly = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => {
      let yearlyAmount = s.amount;
      if (s.frequency === 'monthly') yearlyAmount = s.amount * 12;
      if (s.frequency === 'weekly') yearlyAmount = s.amount * 52;
      return sum + yearlyAmount;
    }, 0);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <div>
          <h1>📅 Subscriptions & Bills</h1>
          <p className="subtitle">Manage your recurring payments</p>
        </div>
        <button className="add-sub-btn" onClick={() => setShowAddForm(true)}>
          + Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="subscription-summary">
        <div className="summary-item">
          <span className="summary-label">Monthly Total</span>
          <span className="summary-value">${totalMonthly.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Yearly Total</span>
          <span className="summary-value">${totalYearly.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Active Subscriptions</span>
          <span className="summary-value">{subscriptions.filter(s => s.isActive).length}</span>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Add New Subscription</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Subscription Name"
                value={newSub.name}
                onChange={(e) => setNewSub({...newSub, name: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newSub.amount}
                onChange={(e) => setNewSub({...newSub, amount: e.target.value})}
                required
                step="0.01"
              />
              <select
                value={newSub.frequency}
                onChange={(e) => setNewSub({...newSub, frequency: e.target.value})}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                type="date"
                placeholder="Next Due Date"
                value={newSub.nextDue}
                onChange={(e) => setNewSub({...newSub, nextDue: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Category (e.g., Entertainment, Utilities)"
                value={newSub.category}
                onChange={(e) => setNewSub({...newSub, category: e.target.value})}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newSub.description}
                onChange={(e) => setNewSub({...newSub, description: e.target.value})}
              />
              <div className="modal-actions">
                <button type="submit">Add</button>
                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="subscriptions-list">
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No subscriptions yet</p>
            <p className="empty-sub">Add your first subscription to track recurring payments</p>
          </div>
        ) : (
          subscriptions.map(sub => (
            <div key={sub.id} className={`sub-item ${!sub.isActive ? 'inactive' : ''}`}>
              <div className="sub-info">
                <div className="sub-name">
                  <span className="sub-icon">
                    {sub.isActive ? '✅' : '⏸️'}
                  </span>
                  <span className="sub-title">{sub.name}</span>
                  {sub.category && (
                    <span className="sub-category">{sub.category}</span>
                  )}
                </div>
                <div className="sub-details">
                  <span className="sub-amount">${sub.amount.toFixed(2)}</span>
                  <span className="sub-frequency">/{sub.frequency}</span>
                  <span className="sub-date">Next: {formatDate(sub.nextDue)}</span>
                  {sub.description && (
                    <span className="sub-description">{sub.description}</span>
                  )}
                </div>
              </div>
              <div className="sub-actions">
                <button 
                  className={`toggle-btn ${sub.isActive ? 'active' : 'inactive'}`}
                  onClick={() => onToggleSubscription(sub.id)}
                >
                  {sub.isActive ? 'Pause' : 'Resume'}
                </button>
                <button 
                  className="delete-sub-btn"
                  onClick={() => {
                    if (window.confirm(`Delete "${sub.name}"?`)) {
                      onDeleteSubscription(sub.id);
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Subscriptions;