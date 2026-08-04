import React, { useState } from 'react';
import './BankFidget.css';

function BankFidget({ bank, transactions, onAddTransaction, onDeleteTransaction, onColorChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTransaction({
      bank: bank.name,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date()
    });
    setAmount('');
    setCategory('');
    setDescription('');
    setIsAdding(false);
  };

  return (
    <div className="bank-fidget" style={{ borderColor: bank.color }}>
      <div className="bank-header" style={{ backgroundColor: bank.color }}>
        <div className="bank-title">
          <span className="bank-icon">{bank.icon || '🏦'}</span>
          <h2>{bank.name}</h2>
        </div>
        <div className="bank-actions">
          <button 
            className="color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            🎨
          </button>
          <span className="bank-balance">${totalBalance.toFixed(2)}</span>
        </div>
      </div>

      {showColorPicker && (
        <div className="color-picker">
          <input
            type="color"
            value={bank.color}
            onChange={(e) => onColorChange(bank.id, e.target.value)}
          />
          <button onClick={() => setShowColorPicker(false)}>✓</button>
        </div>
      )}

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <p className="empty-message">No transactions yet</p>
        ) : (
          transactions.map(t => (
            <div key={t.id} className="transaction-item">
              <div className="transaction-info">
                <span className="transaction-category">{t.category}</span>
                <span className="transaction-desc">{t.description}</span>
                <span className="transaction-date">
                  {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
              <div className="transaction-amount">
                <span>${t.amount.toFixed(2)}</span>
                <button 
                  className="delete-btn"
                  onClick={() => onDeleteTransaction(t.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form className="add-transaction-form" onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit">Add</button>
            <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button 
          className="add-transaction-btn"
          onClick={() => setIsAdding(true)}
        >
          + Add Transaction
        </button>
      )}
    </div>
  );
}

export default BankFidget;