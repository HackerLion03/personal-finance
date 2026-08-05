import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import "./App.css";

// ========== 初始化数据库 ==========
const db = new Dexie("FinanceDB");
db.version(1).stores({
  transactions: "++id, date, amount, type, category, description, bankId, accountId, isRecurring",
  banks: "++id, name, color, icon",
  accounts: "++id, bankId, name, type, balance, color",
  subscriptions: "++id, name, amount, frequency, nextDue, category, isActive, description",
  userProfile: "++id, name, email, avatar, currency, language"
});

// ========== 默认数据（你的真实账户） ==========
const defaultBanks = [
  { name: "Capital One", color: "#004977", icon: "🏦" },
  { name: "Citizen Bank", color: "#117ACA", icon: "🏛️" },
  { name: "PayPal", color: "#004B87", icon: "🅿️" },
  { name: "学生贷款", color: "#dc3545", icon: "🎓" },
  { name: "现金", color: "#28a745", icon: "💵" },
];

const defaultAccounts = [
  { bankId: 1, name: "Capital One 主卡", type: "credit", balance: -500, color: "#dc3545" },
  { bankId: 1, name: "Capital One 副卡", type: "credit", balance: -200, color: "#dc3545" },
  { bankId: 2, name: "Citizen Checking", type: "checking", balance: 2500, color: "#28a745" },
  { bankId: 3, name: "PayPal 余额", type: "checking", balance: 300, color: "#17a2b8" },
  { bankId: 4, name: "联邦学生贷款", type: "loan", balance: -15000, color: "#dc3545" },
  { bankId: 5, name: "钱包现金", type: "cash", balance: 150, color: "#28a745" },
];

// ========== 中英文翻译 ==========
const zh = {
  dashboard: "仪表盘",
  banks: "银行账户",
  subscriptions: "订阅管理",
  profile: "个人设置",
  totalAssets: "总资产",
  totalDebt: "总负债",
  netWorth: "净资产",
  income: "收入",
  expense: "支出",
  addTransaction: "添加交易",
  addBank: "添加银行",
  addAccount: "添加账户",
  addDebt: "添加债务",
  amount: "金额",
  description: "描述",
  category: "分类",
  date: "日期",
  type: "类型",
  save: "保存",
  cancel: "取消",
  delete: "删除",
  edit: "编辑",
  search: "搜索",
  all: "全部",
  food: "餐饮",
  shopping: "购物",
  transport: "交通",
  entertainment: "娱乐",
  housing: "住房",
  salary: "工资",
  investment: "投资",
  other: "其他",
  repayment: "还款",
  bank: "银行",
  credit: "信用卡",
  cash: "现金",
  debt: "债务",
  balance: "余额",
  creditLimit: "信用额度",
  color: "颜色",
  icon: "图标",
  name: "名称",
  email: "邮箱",
  currency: "货币",
  language: "语言",
  loading: "加载中...",
  noData: "暂无数据",
  confirmDelete: "确定要删除吗？",
  success: "操作成功",
  error: "操作失败",
  monthly: "每月",
  yearly: "每年",
  weekly: "每周",
  active: "活跃",
  inactive: "已暂停",
  recentTransactions: "最近交易",
  accountOverview: "账户概览",
  netWorthOverview: "净资产总览",
  addNewBank: "添加新银行",
  addNewAccount: "添加新账户",
  switchToEnglish: "切换到 English",
  switchToChinese: "切换为 中文",
  selectAccount: "选择账户",
  selectBank: "请选择银行",
  enterBankName: "请输入银行名称",
  enterAccountName: "如：储蓄账户",
  enterDescription: "如：超市购物",
  subscriptionComingSoon: "订阅功能开发中...",
};

const en = {
  dashboard: "Dashboard",
  banks: "Banks",
  subscriptions: "Subscriptions",
  profile: "Profile",
  totalAssets: "Total Assets",
  totalDebt: "Total Debt",
  netWorth: "Net Worth",
  income: "Income",
  expense: "Expense",
  addTransaction: "Add Transaction",
  addBank: "Add Bank",
  addAccount: "Add Account",
  addDebt: "Add Debt",
  amount: "Amount",
  description: "Description",
  category: "Category",
  date: "Date",
  type: "Type",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  search: "Search",
  all: "All",
  food: "Food",
  shopping: "Shopping",
  transport: "Transport",
  entertainment: "Entertainment",
  housing: "Housing",
  salary: "Salary",
  investment: "Investment",
  other: "Other",
  repayment: "Repayment",
  bank: "Bank",
  credit: "Credit Card",
  cash: "Cash",
  debt: "Debt",
  balance: "Balance",
  creditLimit: "Credit Limit",
  color: "Color",
  icon: "Icon",
  name: "Name",
  email: "Email",
  currency: "Currency",
  language: "Language",
  loading: "Loading...",
  noData: "No Data",
  confirmDelete: "Are you sure you want to delete?",
  success: "Success",
  error: "Error",
  monthly: "Monthly",
  yearly: "Yearly",
  weekly: "Weekly",
  active: "Active",
  inactive: "Inactive",
  recentTransactions: "Recent Transactions",
  accountOverview: "Account Overview",
  netWorthOverview: "Net Worth Overview",
  addNewBank: "Add New Bank",
  addNewAccount: "Add New Account",
  switchToEnglish: "Switch to English",
  switchToChinese: "切换为 中文",
  selectAccount: "Select Account",
  selectBank: "Select Bank",
  enterBankName: "Enter Bank Name",
  enterAccountName: "e.g. Savings Account",
  enterDescription: "e.g. Grocery",
  subscriptionComingSoon: "Subscription feature coming soon...",
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('zh');
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const t = language === 'zh' ? zh : en;

  // ========== 初始化数据 ==========
  useEffect(() => {
    const initData = async () => {
      try {
        const bankCount = await db.banks.count();
        if (bankCount === 0) {
          await db.banks.bulkAdd(defaultBanks);
          await db.accounts.bulkAdd(defaultAccounts);
          await db.userProfile.add({
            name: "用户",
            email: "",
            currency: "USD",
            avatar: "",
            language: "zh",
            createdAt: new Date()
          });
        }

        const allBanks = await db.banks.toArray();
        const allAccounts = await db.accounts.toArray();
        const allTransactions = await db.transactions.orderBy('date').reverse().toArray();
        const allSubscriptions = await db.subscriptions.toArray();
        const profile = await db.userProfile.toArray();
        
        setBanks(allBanks);
        setAccounts(allAccounts);
        setTransactions(allTransactions);
        setSubscriptions(allSubscriptions);
        setUserProfile(profile[0] || null);
        setLanguage(profile[0]?.language || 'zh');
        setLoading(false);
      } catch (error) {
        console.error("初始化失败:", error);
        setLoading(false);
      }
    };
    initData();
  }, []);

  // ========== 获取账户所属银行 ==========
  const getAccountsByBank = (bankId) => accounts.filter(a => a.bankId === bankId);

  // ========== 添加交易 ==========
  const addTransaction = async (transaction) => {
    try {
      const { accountId, amount, type } = transaction;
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      let balanceChange = 0;
      if (type === 'income') {
        balanceChange = Math.abs(amount);
      } else if (type === 'expense') {
        balanceChange = -Math.abs(amount);
      } else if (type === 'repayment') {
        balanceChange = Math.abs(amount);
      }

      const newBalance = (account.balance || 0) + balanceChange;
      await db.accounts.update(accountId, { balance: newBalance });

      const txnData = {
        ...transaction,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        date: transaction.date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      const id = await db.transactions.add(txnData);
      
      setTransactions(prev => [{ ...txnData, id }, ...prev]);
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: newBalance } : a));
      setShowAddTxn(false);
    } catch (error) {
      console.error("添加交易失败:", error);
    }
  };

  // ========== 删除交易 ==========
  const deleteTransaction = async (id) => {
    try {
      const txn = transactions.find(t => t.id === id);
      if (!txn) return;

      const account = accounts.find(a => a.id === txn.accountId);
      if (account) {
        const newBalance = (account.balance || 0) - txn.amount;
        await db.accounts.update(account.id, { balance: newBalance });
        setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, balance: newBalance } : a));
      }

      await db.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("删除交易失败:", error);
    }
  };

  // ========== 添加账户 ==========
  const addAccount = async (account) => {
    try {
      const id = await db.accounts.add(account);
      setAccounts(prev => [...prev, { ...account, id }]);
      setShowAddAccount(false);
    } catch (error) {
      console.error("添加账户失败:", error);
    }
  };

  // ========== 删除账户 ==========
  const deleteAccount = async (accountId) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await db.transactions.where('accountId').equals(accountId).delete();
      await db.accounts.delete(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setTransactions(prev => prev.filter(t => t.accountId !== accountId));
    } catch (error) {
      console.error("删除账户失败:", error);
    }
  };

  // ========== 添加银行 ==========
  const addBank = async (bank) => {
    try {
      const id = await db.banks.add(bank);
      setBanks(prev => [...prev, { ...bank, id }]);
    } catch (error) {
      console.error("添加银行失败:", error);
    }
  };

  // ========== 删除银行 ==========
  const deleteBank = async (bankId) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      const bankAccounts = accounts.filter(a => a.bankId === bankId);
      const accountIds = bankAccounts.map(a => a.id);
      await db.transactions.where('accountId').anyOf(accountIds).delete();
      await db.accounts.where('bankId').equals(bankId).delete();
      await db.banks.delete(bankId);
      setBanks(prev => prev.filter(b => b.id !== bankId));
      setAccounts(prev => prev.filter(a => a.bankId !== bankId));
      setTransactions(prev => prev.filter(t => !accountIds.includes(t.accountId)));
    } catch (error) {
      console.error("删除银行失败:", error);
    }
  };

  // ========== 切换语言 ==========
  const toggleLanguage = async () => {
    const newLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    if (userProfile) {
      await db.userProfile.update(userProfile.id, { language: newLang });
      setUserProfile({ ...userProfile, language: newLang });
    }
  };

  // ========== 计算统计数据 ==========
  const totalAssets = accounts
    .filter(a => (a.balance || 0) > 0)
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  
  const totalDebt = accounts
    .filter(a => (a.balance || 0) < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance || 0), 0);
  
  const netWorth = totalAssets - totalDebt;

  const fmt = (n) => {
    const abs = Math.abs(n || 0);
    return '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  if (loading) {
    return <div className="loading-screen">⏳ {t.loading}</div>;
  }

  // ========== 渲染 ==========
  return (
    <div className="App">
      {/* 顶部导航 */}
      <nav className="top-nav">
        <div className="nav-title">💰 {language === 'zh' ? '我的财务总管' : 'My Finance'}</div>
        <div className="nav-actions">
          <button onClick={toggleLanguage} className="lang-btn">
            {language === 'zh' ? '🌐 EN' : '🌐 中文'}
          </button>
          <button onClick={() => setShowAddTxn(true)} className="add-txn-btn">
            + {t.addTransaction}
          </button>
        </div>
      </nav>

      {/* 净资产卡片 */}
      <div className="net-worth-card">
        <div className="nw-row">
          <div className="nw-item green">
            <div className="nw-label">{t.totalAssets}</div>
            <div className="nw-value">{fmt(totalAssets)}</div>
          </div>
          <div className="nw-item red">
            <div className="nw-label">{t.totalDebt}</div>
            <div className="nw-value">{fmt(totalDebt)}</div>
          </div>
          <div className={`nw-item ${netWorth >= 0 ? 'green' : 'red'}`}>
            <div className="nw-label">{t.netWorth}</div>
            <div className="nw-value">{fmt(netWorth)}</div>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="tabs">
        {['dashboard', 'banks', 'subscriptions', 'profile'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' ? '📊' : tab === 'banks' ? '🏦' : tab === 'subscriptions' ? '📅' : '⚙️'}
            {' '}{t[tab]}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="section">
              <h4>🏦 {t.accountOverview}</h4>
              {accounts.length === 0 ? (
                <div className="empty-hint">{t.noData}</div>
              ) : (
                accounts.map(acc => {
                  const bank = banks.find(b => b.id === acc.bankId);
                  return (
                    <div key={acc.id} className="acc-row" style={{ borderLeft: `4px solid ${acc.color || '#ccc'}` }}>
                      <span className="acc-row-icon">{bank?.icon || '💰'}</span>
                      <div className="acc-row-info">
                        <div className="acc-row-name">{acc.name}</div>
                        <div className="acc-row-bank">{bank?.name}</div>
                      </div>
                      <div className={`acc-row-balance ${(acc.balance || 0) >= 0 ? 'green' : 'red'}`}>
                        {fmt(acc.balance)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="section">
              <h4>📋 {t.recentTransactions}</h4>
              {transactions.length === 0 ? (
                <div className="empty-hint">{t.noData}</div>
              ) : (
                transactions.slice(0, 20).map(txn => {
                  const acc = accounts.find(a => a.id === txn.accountId);
                  const bank = banks.find(b => b.id === acc?.bankId);
                  return (
                    <div key={txn.id} className="txn-row">
                      <span className="txn-icon">
                        {txn.type === 'income' ? '📥' : txn.type === 'repayment' ? '💰' : '📤'}
                      </span>
                      <div className="txn-info">
                        <div className="txn-desc">{txn.description}</div>
                        <div className="txn-meta">
                          {bank?.icon} {acc?.name} · {txn.date} · {txn.category}
                        </div>
                      </div>
                      <div className="txn-right">
                        <span className={`txn-amount ${(txn.amount || 0) >= 0 ? 'green' : 'red'}`}>
                          {(txn.amount || 0) >= 0 ? '+' : '-'}{fmt(txn.amount)}
                        </span>
                        <button className="btn-delete" onClick={() => deleteTransaction(txn.id)}>🗑️</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'banks' && (
          <div className="banks-page">
            <div className="section-header">
              <h3>🏦 {t.banks}</h3>
              <div className="header-btns">
                <button onClick={() => {
                  const name = prompt(t.enterBankName);
                  if (name) addBank({ name, color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), icon: '🏦' });
                }} className="btn-sm btn-blue">+ {t.addBank}</button>
                <button onClick={() => setShowAddAccount(true)} className="btn-sm btn-green">+ {t.addAccount}</button>
              </div>
            </div>

            {banks.map(bank => {
              const bankAccounts = getAccountsByBank(bank.id);
              return (
                <div key={bank.id} className="bank-card" style={{ borderTop: `4px solid ${bank.color}` }}>
                  <div className="bank-header">
                    <span>{bank.icon} {bank.name}</span>
                    <button onClick={() => deleteBank(bank.id)} className="btn-delete">🗑️</button>
                  </div>
                  {bankAccounts.length === 0 ? (
                    <div className="empty-hint" style={{padding: 20, color: '#999'}}>{t.noData}</div>
                  ) : (
                    bankAccounts.map(acc => (
                      <div key={acc.id} className="acc-sub-row">
                        <span>{acc.name}</span>
                        <span className={(acc.balance || 0) >= 0 ? 'green' : 'red'}>{fmt(acc.balance)}</span>
                        <button onClick={() => deleteAccount(acc.id)} className="btn-delete">🗑️</button>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="subscriptions-page">
            <h3>📅 {t.subscriptions}</h3>
            <p style={{color:'#999', textAlign:'center', padding:40}}>
              {t.subscriptionComingSoon}
            </p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-page">
            <h3>⚙️ {t.profile}</h3>
            <div className="profile-card">
              <div className="setting-row">
                <span>{t.language}</span>
                <button onClick={toggleLanguage} className="btn-sm btn-blue">
                  {language === 'zh' ? t.switchToEnglish : t.switchToChinese}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddTxn && (
        <AddTransactionModal
          accounts={accounts}
          banks={banks}
          t={t}
          language={language}
          onSave={addTransaction}
          onClose={() => setShowAddTxn(false)}
        />
      )}

      {showAddAccount && (
        <AddAccountModal
          banks={banks}
          t={t}
          language={language}
          onSave={addAccount}
          onClose={() => setShowAddAccount(false)}
        />
      )}
    </div>
  );
}

// ========== 添加交易弹窗 ==========
function AddTransactionModal({ accounts, banks, t, language, onSave, onClose }) {
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('其他');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = language === 'zh'
    ? ['餐饮', '购物', '交通', '娱乐', '住房', '工资', '投资', '还款', '其他']
    : ['Food', 'Shopping', 'Transport', 'Entertainment', 'Housing', 'Salary', 'Investment', 'Repayment', 'Other'];

  const handleSubmit = () => {
    if (!accountId || !amount || !description) {
      alert(language === 'zh' ? '请填写完整信息' : 'Please fill all fields');
      return;
    }
    onSave({
      accountId: Number(accountId),
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{t.addTransaction}</h3>
        
        <label>{t.type}</label>
        <div className="type-btns">
          <button className={type === 'expense' ? 'active red' : ''} onClick={() => setType('expense')}>
            📤 {t.expense}
          </button>
          <button className={type === 'income' ? 'active green' : ''} onClick={() => setType('income')}>
            📥 {t.income}
          </button>
          <button className={type === 'repayment' ? 'active blue' : ''} onClick={() => setType('repayment')}>
            💰 {t.repayment}
          </button>
        </div>

        <label>{t.selectAccount}</label>
        <select value={accountId} onChange={e => setAccountId(e.target.value)}>
          <option value="">{t.selectAccount}</option>
          {accounts.map(acc => {
            const bank = banks.find(b => b.id === acc.bankId);
            return <option key={acc.id} value={acc.id}>{bank?.icon} {acc.name} ({fmt(acc.balance)})</option>;
          })}
        </select>

        <label>{t.amount}</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" />

        <label>{t.description}</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t.enterDescription} />

        <label>{t.category}</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>{t.date}</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        <div className="modal-btns">
          <button onClick={onClose} className="btn-gray">{t.cancel}</button>
          <button onClick={handleSubmit} className="btn-blue">{t.save}</button>
        </div>
      </div>
    </div>
  );
}

// ========== 添加账户弹窗 ==========
function AddAccountModal({ banks, t, language, onSave, onClose }) {
  const [bankId, setBankId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const handleSubmit = () => {
    if (!bankId || !name) {
      alert(language === 'zh' ? '请填写完整信息' : 'Please fill all fields');
      return;
    }
    const isCredit = type === 'credit';
    onSave({
      bankId: Number(bankId),
      name,
      type,
      balance: isCredit ? -(parseFloat(balance) || 0) : (parseFloat(balance) || 0),
      creditLimit: isCredit ? (parseFloat(creditLimit) || 0) : null,
      color: isCredit ? '#dc3545' : '#28a745',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{t.addAccount}</h3>
        
        <label>{t.bank}</label>
        <select value={bankId} onChange={e => setBankId(e.target.value)}>
          <option value="">{t.selectBank}</option>
          {banks.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
        </select>

        <label>{t.name}</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.enterAccountName} />

        <label>{t.type}</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="checking">{language === 'zh' ? '支票账户' : 'Checking'}</option>
          <option value="savings">{language === 'zh' ? '储蓄账户' : 'Savings'}</option>
          <option value="credit">{t.credit}</option>
          <option value="cash">{t.cash}</option>
          <option value="loan">{t.debt}</option>
        </select>

        <label>{t.balance}</label>
        <input type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="0.00" step="0.01" />

        {type === 'credit' && (
          <>
            <label>{t.creditLimit}</label>
            <input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} placeholder="5000" step="0.01" />
          </>
        )}

        <div className="modal-btns">
          <button onClick={onClose} className="btn-gray">{t.cancel}</button>
          <button onClick={handleSubmit} className="btn-blue">{t.save}</button>
        </div>
      </div>
    </div>
  );
}

// 工具函数
function fmt(n) {
  return '$' + Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default App;