import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ transactions, accounts, subscriptions, userProfile }) {
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [upcomingBills, setUpcomingBills] = useState([]);

  useEffect(() => {
    calculateFinances();
    getUpcomingBills();
  }, [transactions, accounts, subscriptions]);

  const calculateFinances = () => {
    // ✅ Total Savings - 只计算非债务账户 (checking, savings, investment)
    // 排除 credit 和 loan 类型
    const savingsAccounts = accounts.filter(acc => 
      acc.type !== 'credit' && acc.type !== 'loan'
    );
    
    const savings = savingsAccounts.reduce((sum, acc) => {
      const accountTransactions = transactions.filter(t => t.accountId === acc.id);
      const transactionTotal = accountTransactions.reduce((s, t) => s + (t.amount || 0), 0);
      const currentBalance = (acc.balance || 0) + transactionTotal;
      return sum + currentBalance;
    }, 0);
    setTotalSavings(savings);

    // ✅ Total Debt - 只计算债务账户 (credit, loan)
    const debtAccounts = accounts.filter(acc => 
      acc.type === 'credit' || acc.type === 'loan'
    );
    
    const debt = debtAccounts.reduce((sum, acc) => {
      const accountTransactions = transactions.filter(t => t.accountId === acc.id);
      const transactionTotal = accountTransactions.reduce((s, t) => s + (t.amount || 0), 0);
      const currentBalance = (acc.balance || 0) + transactionTotal;
      return sum + Math.abs(currentBalance);
    }, 0);
    setTotalDebt(debt);

    // 本月收入和支出
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTxns = transactions.filter(t => 
      new Date(t.date) >= monthStart
    );

    const income = monthlyTxns
      .filter(t => t.category === 'Income' || t.category === 'Salary' || t.category === '收入')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = monthlyTxns
      .filter(t => t.category !== 'Income' && t.category !== 'Salary' && t.category !== '收入')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

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
      </div>

      {/* Monthly Overview */}
      <div className="monthly-overview">
        <div className="overview-card income">
          <span className="overview-label">Monthly Income</span>
          <span className="overview-value">${monthlyIncome.toFixed(2)}</span>
        </div>
        <div className="overview-card expenses">
          <span className="overview-label">Monthly Expenses</span>
          <span className="overview-value">${monthlyExpenses.toFixed(2)}</span>
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
      </div>
    </div>
  );
}

export default Dashboard;