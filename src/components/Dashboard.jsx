import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ transactions, accounts, subscriptions, userProfile }) {
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState([]);

  useEffect(() => {
    calculateFinances();
    getUpcomingBills();
  }, [transactions, accounts, subscriptions]);

  const calculateFinances = () => {
    // 计算总存款（所有账户余额之和）
    const savings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    setTotalSavings(savings);

    // 计算欠款（Credit Card 和 Loan 类型的账户）
    const debt = accounts
      .filter(acc => acc.type === 'credit' || acc.type === 'loan')
      .reduce((sum, acc) => sum + acc.balance, 0);
    setTotalDebt(debt);

    // 净资产
    setNetWorth(savings - debt);

    // 本月收入和支出
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTxns = transactions.filter(t => 
      new Date(t.date) >= monthStart && t.amount > 0
    );

    const income = monthlyTxns
      .filter(t => t.category === 'Income' || t.category === 'Salary')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthlyTxns
      .filter(t => t.category !== 'Income' && t.category !== 'Salary')
      .reduce((sum, t) => sum + t.amount, 0);

    setMonthlyIncome(income);
    setMonthlyExpenses(expenses);
  };

  const getUpcomingBills = () => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    const upcoming = subscriptions
      .filter(sub => sub.isActive)
      .map(sub => {
        const nextDue = new Date(sub.nextDue);
        return { ...sub, nextDue };
      })
      .filter(sub => sub.nextDue >= now && sub.nextDue <= sevenDaysLater)
      .sort((a, b) => a.nextDue - b.nextDue);

    setUpcomingBills(upcoming.slice(0, 5));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        {userProfile && (
          <div className="user-greeting">
            <span>Welcome back, {userProfile.name || 'User'}!</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-savings">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Savings</span>
            <span className="card-value">${totalSavings.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-card total-debt">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <span className="card-label">Total Debt</span>
            <span className="card-value">${totalDebt.toFixed(2)}</span>
          </div>
        </div>
        <div className="summary-card net-worth">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <span className="card-label">Net Worth</span>
            <span className="card-value" style={{ color: netWorth >= 0 ? '#28a745' : '#dc3545' }}>
              ${netWorth.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className="monthly-overview">
        <div className="overview-card income">
          <span className="overview-label">Monthly Income</span>
          <span className="overview-value">${monthlyIncome.toFixed(2)}</span>
          <div className="overview-trend positive">↑ +2.5%</div>
        </div>
        <div className="overview-card expenses">
          <span className="overview-label">Monthly Expenses</span>
          <span className="overview-value">${monthlyExpenses.toFixed(2)}</span>
          <div className="overview-trend negative">↓ -1.2%</div>
        </div>
        <div className="overview-card savings-rate">
          <span className="overview-label">Savings Rate</span>
          <span className="overview-value">
            {monthlyIncome > 0 
              ? `${((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1)}%`
              : '0%'
            }
          </span>
          <div className="savings-bar">
            <div 
              className="savings-bar-fill"
              style={{ 
                width: `${Math.min(((monthlyIncome - monthlyExpenses) / monthlyIncome * 100), 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="upcoming-bills">
        <div className="section-header">
          <h2>📅 Upcoming Bills & Subscriptions</h2>
          <span className="bill-count">{upcomingBills.length} upcoming</span>
        </div>
        {upcomingBills.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <p>No upcoming bills in the next 7 days</p>
          </div>
        ) : (
          <div className="bills-list">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="bill-item">
                <div className="bill-info">
                  <span className="bill-name">{bill.name}</span>
                  <span className="bill-description">{bill.description}</span>
                </div>
                <div className="bill-details">
                  <span className="bill-amount">${bill.amount.toFixed(2)}</span>
                  <span className="bill-frequency">{bill.frequency}</span>
                  <span className="bill-date">Due {formatDate(bill.nextDue)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">Total Accounts</span>
          <span className="stat-value">{accounts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Subscriptions</span>
          <span className="stat-value">
            {subscriptions.filter(s => s.isActive).length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">{transactions.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Monthly Average</span>
          <span className="stat-value">
            ${transactions.length > 0 
              ? (transactions.reduce((sum, t) => sum + t.amount, 0) / 12).toFixed(2)
              : '0.00'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;