import React, { useState } from 'react';
import './BankFidget.css';

function BankFidget({ 
  bank, 
  accounts = [], 
  transactions = [], 
  onAddTransaction, 
  onDeleteTransaction, 
  onColorChange,
  onDeleteBank,
  onAddAccount,
  onDeleteAccount 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('checking');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddTransaction) {
      onAddTransaction({
        bankId: bank.id,
        accountId: parseInt(selectedAccount),
        amount: parseFloat(amount),
        category,
        description,
        date: new Date()
      });
    }
    setAmount('');
    setCategory('');
    setDescription('');
    setSelectedAccount('');
    setIsAdding(false);
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (newAccountName.trim() && onAddAccount) {
      onAddAccount({
        bankId: bank.id,
        name: newAccountName,
        type: newAccountType,
        balance: parseFloat(newAccountBalance) || 0,
        color: '#28a745'
      });
      setNewAccountName('');
      setNewAccountType('checking');
      setNewAccountBalance('');
      setShowAddAccount(false);
    }
  };

  const accountTypes = {
    checking: '💳 Checking',
    savings: '🏦 Savings',
    credit: '💳 Credit Card',
    investment: '📈 Investment',
    loan: '💰 Loan'
  };

  const getAccountBalance = (account) => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const transactionTotal = accountTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return (account.balance || 0) + transactionTotal;
  };

  return (
    <div 
      className="bank-fidget" 
      style={{ 
        borderColor: bank.color,
        '--bank-color': bank.color 
      }}
    >
      {/* Header */}
      <div className="bank-header" style={{ backgroundColor: bank.color }}>
        <div className="bank-title">
          <span className="bank-icon">{bank.icon || '🏦'}</span>
          <h2>{bank.name}</h2>
        </div>
        <div className="bank-actions">
          <button 
            className="color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change color"
          >
            🎨
          </button>
          <button 
            className="delete-bank-btn"
            onClick={() => {
              if (window.confirm(`Delete ${bank.name} and all its accounts?`)) {
                onDeleteBank && onDeleteBank(bank.id);
              }
            }}
            title="Delete bank"
          >
            🗑️
          </button>
          <span className="bank-balance">${totalBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && (
        <div className="color-picker">
          <input
            type="color"
            value={bank.color}
            onChange={(e) => onColorChange && onColorChange(bank.id, e.target.value)}
          />
          <button onClick={() => setShowColorPicker(false)}>✓</button>
        </div>
      )}

      {/* Accounts Section */}
      <div className="accounts-section">
        <div className="accounts-header">
          <h3>Accounts</h3>
          <button 
            className="add-account-btn"
            onClick={() => setShowAddAccount(!showAddAccount)}
          >
            + Add Account
          </button>
        </div>

        {showAddAccount && (
          <form className="add-account-form" onSubmit={handleAddAccount}>
            <input
              type="text"
              placeholder="Account name (e.g., Main Checking)"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              required
            />
            <select
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value)}
            >
              <option value="checking">💳 Checking</option>
              <option value="savings">🏦 Savings</option>
              <option value="credit">💳 Credit Card</option>
              <option value="investment">📈 Investment</option>
              <option value="loan">💰 Loan</option>
            </select>
            <input
              type="number"
              placeholder="Initial balance (optional)"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              step="0.01"
            />
            <div className="form-actions">
              <button type="submit">Add Account</button>
              <button type="button" onClick={() => setShowAddAccount(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div className="accounts-list">
          {accounts.length === 0 ? (
            <p className="empty-message">No accounts yet</p>
          ) : (
            accounts.map(account => {
              const currentBalance = getAccountBalance(account);
              const accountTransactions = transactions.filter(t => t.accountId === account.id);
              
              return (
                <div key={account.id} className="account-item">
                  <div className="account-info">
                    <span className="account-type">{accountTypes[account.type] || account.type}</span>
                    <span className="account-name">{account.name}</span>
                    <span className="account-balance">${currentBalance.toFixed(2)}</span>
                    {accountTransactions.length > 0 && (
                      <span className="transaction-count">({accountTransactions.length} txns)</span>
                    )}
                  </div>
                  <button 
                    className="delete-account-btn"
                    onClick={() => {
                      if (window.confirm(`Delete account "${account.name}"?`)) {
                        onDeleteAccount && onDeleteAccount(account.id);
                      }
                    }}
                    title="Delete account"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toggle Transactions Button */}
      <button 
        className="toggle-transactions-btn"
        onClick={() => setShowTransactions(!showTransactions)}
      >
        {showTransactions ? '▼ Hide Transactions' : '▶ Show Transactions'}
        <span className="transaction-count-badge">
          {transactions.length}
        </span>
      </button>

      {/* Transactions List */}
      {showTransactions && (
        <>
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p className="empty-message">No transactions yet</p>
            ) : (
              transactions.map(t => {
                const account = accounts.find(a => a.id === t.accountId);
                return (
                  <div key={t.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-category">{t.category}</span>
                      <span className="transaction-desc">{t.description}</span>
                      <span className="transaction-account">
                        {account ? account.name : 'Unknown'}
                      </span>
                      <span className="transaction-date">
                        {new Date(t.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="transaction-amount">
                      <span>${(t.amount || 0).toFixed(2)}</span>
                      <button 
                        className="delete-btn"
                        onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Transaction */}
          {isAdding ? (
            <form className="add-transaction-form" onSubmit={handleSubmit}>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                required
              >
                <option value="">Select Account</option>
                {accounts.map(acc => {
                  const balance = getAccountBalance(acc);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${balance.toFixed(2)})
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
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
              disabled={accounts.length === 0}
            >
              + Add Transaction
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default BankFidget;