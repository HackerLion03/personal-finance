import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import BankFidget from "./components/BankFidget";
import Subscriptions from "./components/Subscriptions";
import Profile from "./components/Profile";
import "./App.css";

// 初始化数据库
const db = new Dexie("FinanceDB");
db.version(1).stores({
  transactions: "++id, date, amount, category, description, bankId, accountId, accountType, isRecurring",
  banks: "++id, name, color, icon",
  accounts: "++id, bankId, name, type, balance, color",
  subscriptions: "++id, name, amount, frequency, nextDue, category, isActive, description",
  userProfile: "++id, name, email, avatar, currency"
});

// 默认数据
const defaultBanks = [
  { name: "Capital One", color: "#004977", icon: "🏦" },
  { name: "Chase", color: "#117ACA", icon: "💳" },
  { name: "Bank of America", color: "#004B87", icon: "🏛️" },
];

const defaultAccounts = [
  { bankId: 1, name: "Main Checking", type: "checking", balance: 5000, color: "#28a745" },
  { bankId: 1, name: "Savings Account", type: "savings", balance: 15000, color: "#17a2b8" },
  { bankId: 2, name: "Freedom Credit", type: "credit", balance: -2000, color: "#dc3545" },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== 初始化数据 =====
  useEffect(() => {
    const initData = async () => {
      try {
        const bankCount = await db.banks.count();
        if (bankCount === 0) {
          await db.banks.bulkAdd(defaultBanks);
          await db.accounts.bulkAdd(defaultAccounts);
          
          await db.subscriptions.bulkAdd([
            {
              name: "Netflix",
              amount: 15.99,
              frequency: "monthly",
              nextDue: new Date(2026, 7, 15),
              category: "Entertainment",
              isActive: true,
              description: "Streaming service"
            },
            {
              name: "Spotify",
              amount: 9.99,
              frequency: "monthly",
              nextDue: new Date(2026, 7, 10),
              category: "Entertainment",
              isActive: true,
              description: "Music streaming"
            }
          ]);
          
          await db.userProfile.add({
            name: "User",
            email: "",
            currency: "USD",
            avatar: "",
            createdAt: new Date()
          });
        }

        const allBanks = await db.banks.toArray();
        const allAccounts = await db.accounts.toArray();
        const allTransactions = await db.transactions.toArray();
        const allSubscriptions = await db.subscriptions.toArray();
        const profile = await db.userProfile.toArray();
        
        setBanks(allBanks);
        setAccounts(allAccounts);
        setTransactions(allTransactions);
        setSubscriptions(allSubscriptions);
        setUserProfile(profile[0] || null);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setLoading(false);
      }
    };

    initData();
  }, []);

  // ===== CRUD Functions =====

  // 获取某个银行的账户
  const getAccountsByBank = (bankId) => {
    return accounts.filter(a => a.bankId === bankId);
  };

  // 添加交易
  const addTransaction = async (transaction) => {
    try {
      const id = await db.transactions.add(transaction);
      const newTransaction = { ...transaction, id };
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // 删除交易
  const deleteTransaction = async (id) => {
    try {
      await db.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // 修改银行颜色
  const changeBankColor = async (bankId, newColor) => {
    try {
      await db.banks.update(bankId, { color: newColor });
      setBanks(prev => prev.map(b => 
        b.id === bankId ? { ...b, color: newColor } : b
      ));
    } catch (error) {
      console.error("Error updating bank color:", error);
    }
  };

  // 删除银行
  const deleteBank = async (bankId) => {
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
      console.error("Error deleting bank:", error);
    }
  };

  // ✅ 添加账户（包括 Bank 和 Debt 账户）
  const addAccount = async (account) => {
    try {
      const id = await db.accounts.add(account);
      setAccounts(prev => [...prev, { ...account, id }]);
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // 删除账户
  const deleteAccount = async (accountId) => {
    try {
      await db.transactions.where('accountId').equals(accountId).delete();
      await db.accounts.delete(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setTransactions(prev => prev.filter(t => t.accountId !== accountId));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // ✅ 添加新银行
  const addNewBank = async () => {
    const name = prompt("Enter bank name:");
    if (name) {
      const newBank = {
        name,
        color: "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        icon: "🏦"
      };
      try {
        const id = await db.banks.add(newBank);
        setBanks(prev => [...prev, { ...newBank, id }]);
      } catch (error) {
        console.error("Error adding bank:", error);
      }
    }
  };

  // ✅ 添加债务账户
  const addDebtAccount = async () => {
    const name = prompt("Enter debt account name (e.g., Student Loan, Mortgage):");
    if (name) {
      const bankName = prompt("Which bank does this debt belong to? (or type 'Other' if not listed)");
      let bankId;
      
      // 查找或创建银行
      const existingBank = banks.find(b => b.name.toLowerCase() === bankName.toLowerCase());
      if (existingBank) {
        bankId = existingBank.id;
      } else {
        // 创建新银行
        const newBank = {
          name: bankName,
          color: "#dc3545",
          icon: "💰"
        };
        const id = await db.banks.add(newBank);
        setBanks(prev => [...prev, { ...newBank, id }]);
        bankId = id;
      }

      const amount = parseFloat(prompt("Enter the debt amount:"));
      if (!isNaN(amount)) {
        const newAccount = {
          bankId: bankId,
          name: name,
          type: 'loan', // 或 'credit'
          balance: -Math.abs(amount), // 负数表示欠款
          color: "#dc3545"
        };
        await addAccount(newAccount);
      }
    }
  };

  // 订阅管理
  const addSubscription = async (subscription) => {
    try {
      const id = await db.subscriptions.add(subscription);
      setSubscriptions(prev => [...prev, { ...subscription, id }]);
    } catch (error) {
      console.error("Error adding subscription:", error);
    }
  };

  const deleteSubscription = async (id) => {
    try {
      await db.subscriptions.delete(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  const toggleSubscription = async (id) => {
    try {
      const sub = subscriptions.find(s => s.id === id);
      await db.subscriptions.update(id, { isActive: !sub.isActive });
      setSubscriptions(prev => prev.map(s => 
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ));
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  // 更新个人资料
  const updateProfile = async (profileData) => {
    try {
      if (userProfile) {
        await db.userProfile.update(userProfile.id, profileData);
        setUserProfile({ ...userProfile, ...profileData });
      } else {
        const id = await db.userProfile.add(profileData);
        setUserProfile({ ...profileData, id });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // ===== 渲染不同页面 =====
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions}
            accounts={accounts}
            subscriptions={subscriptions}
            userProfile={userProfile}
          />
        );
      case 'banks':
        return (
          <div className="bank-page">
            <div className="bank-page-header">
              <h1>🏦 Banks & Accounts</h1>
              <div className="bank-actions-header">
                <button className="add-bank-btn" onClick={addNewBank}>
                  + Add Bank
                </button>
                <button className="add-debt-btn" onClick={addDebtAccount}>
                  + Add Debt Account
                </button>
              </div>
            </div>
            <div className="bank-fidgets-container">
              {banks.map(bank => (
                <BankFidget
                  key={bank.id}
                  bank={bank}
                  accounts={getAccountsByBank(bank.id)}
                  transactions={transactions}
                  onAddTransaction={addTransaction}
                  onDeleteTransaction={deleteTransaction}
                  onColorChange={changeBankColor}
                  onDeleteBank={deleteBank}
                  onAddAccount={addAccount}
                  onDeleteAccount={deleteAccount}
                />
              ))}
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <Subscriptions 
            subscriptions={subscriptions}
            onAddSubscription={addSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleSubscription={toggleSubscription}
          />
        );
      case 'profile':
        return (
          <Profile 
            userProfile={userProfile}
            onUpdateProfile={updateProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="app-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;