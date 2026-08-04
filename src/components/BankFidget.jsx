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
  const [expandedAccounts, setExpandedAccounts] = useState({});

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

  // ✅ 只保留这一个 totalBalance
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
    <div className="bank-fidget">
      <div className="bank-header" style={{borderColor: bank.color}}>
        <h3>{bank.name}</h3>
        <div className="bank-balance">Total: ${totalBalance.toFixed(2)}</div>
      </div>

      <div className="accounts">
        {accounts.map(acc => (
          <div key={acc.id} className="account">
            <div className="account-summary" onClick={() => toggleAccount(acc.id)}>
              <span className="account-name">{acc.name} ({accountTypes[acc.type] || acc.type})</span>
              <span className="account-balance">${getAccountBalance(acc).toFixed(2)}</span>
            </div>
            {expandedAccounts[acc.id] && (
              <div className="account-details">
                <ul>
                  {getAccountTransactions(acc.id).map(tx => (
                    <li key={tx.id}>
                      {tx.date ? new Date(tx.date).toLocaleDateString() : ''} {tx.description} {tx.category} ${tx.amount}
                      <button onClick={() => onDeleteTransaction && onDeleteTransaction(tx.id)}>Delete</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={() => setIsAdding(v => !v)}>{isAdding ? 'Cancel' : 'Add Transaction'}</button>
        <button onClick={() => setShowAddAccount(v => !v)}>{showAddAccount ? 'Cancel' : 'Add Account'}</button>
      </div>

      {isAdding && (
        <form className="transaction-form" onSubmit={handleSubmit}>
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
            <option value="">Select account</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" />
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
          <button type="submit">Add</button>
        </form>
      )}

      {showAddAccount && (
        <form className="add-account-form" onSubmit={handleAddAccount}>
          <input value={newAccountName} onChange={e => setNewAccountName(e.target.value)} placeholder="Account name" />
          <select value={newAccountType} onChange={e => setNewAccountType(e.target.value)}>
            {Object.keys(accountTypes).map(k => <option key={k} value={k}>{accountTypes[k]}</option>)}
          </select>
          <input value={newAccountBalance} onChange={e => setNewAccountBalance(e.target.value)} placeholder="Starting balance" />
          <button type="submit">Create</button>
        </form>
      )}
    </div>
  );
}

export default BankFidget;