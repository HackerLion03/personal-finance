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
  // 每个账户独立控制展开/收起
  const [expandedAccounts, setExpandedAccounts] = useState({});

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddTransaction && selectedAccount) {
      onAddTransaction({
        bankId: bank.id,
        accountId: parseInt(selectedAccount),
        amount: parseFloat(amount),
        category,
        description,
        date: new Date()
      });
      setAmount('');
      setCategory('');
      setDescription('');
      setSelectedAccount('');
      setIsAdding(false);
    }
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

  // 获取账户的交易
  const getAccountTransactions = (accountId) => {
    return transactions.filter(t => t.accountId === accountId);
  };

  // 计算账户余额（初始余额 + 交易）
  const getAccountBalance = (account) => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const transactionTotal = accountTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return (account.balance || 0) + transactionTotal;
  };

  // ✅ 修正：总余额 = 所有账户的当前余额之和
  const totalBalance = accounts.reduce((sum, acc) => sum + getAccountBalance(acc), 0);

  // 切换账户展开/收起
  const toggleAccount = (accountId) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const accountTypesEmoji = {
    checking: '💳',
    savings: '🏦',
    credit: '💳',
    investment: '📈',
    loan: '💰'
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
              const accountTransactions = getAccountTransactions(account.id);
              const isExpanded = expandedAccounts[account.id] || false;
              
              return (
                <div key={account.id} className="account-wrapper">
                  {/* Account Item - Click to expand */}
                  <div 
                    className="account-item"
                    onClick={() => toggleAccount(account.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="account-info">
                      <span className="account-type">
                        {accountTypesEmoji[account.type] || '💳'} {accountTypes[account.type] || account.type}
                      </span>
                      <span className="account-name">{account.name}</span>
                      <span className="account-balance">${currentBalance.toFixed(2)}</span>
                      {accountTransactions.length > 0 && (
                        <span className="transaction-count">({accountTransactions.length} txns)</span>
                      )}
                      <span className="expand-icon">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>
                    <button 
                      className="delete-account-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete account "${account.name}"?`)) {
                          onDeleteAccount && onDeleteAccount(account.id);
                        }
                      }}
                      title="Delete account"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Account Transactions - Only show if expanded */}
                  {isExpanded && (
                    <div className="account-transactions">
                      {accountTransactions.length === 0 ? (
                        <p className="empty-message">No transactions for this account</p>
                      ) : (
                        accountTransactions.map(t => (
                          <div key={t.id} className="transaction-item">
                            <div className="transaction-info">
                              <span className="transaction-category">{t.category}</span>
                              <span className="transaction-desc">{t.description || 'No description'}</span>
                              <span className="transaction-date">
                                {new Date(t.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="transaction-amount">
                              <span>${(t.amount || 0).toFixed(2)}</span>
                              <button 
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTransaction && onDeleteTransaction(t.id);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Transaction - Global */}
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
    </div>
  );
}

export default BankFidget;