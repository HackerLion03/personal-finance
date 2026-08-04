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
db.version(4).stores({
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

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        // 检查是否有银行数据
        const bankCount = await db.banks.count();
        if (bankCount === 0) {
          await db.banks.bulkAdd(defaultBanks);
          await db.accounts.bulkAdd(defaultAccounts);
          
          // 添加示例订阅
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
          
          // 创建用户资料
          await db.userProfile.add({
            name: "User",
            email: "",
            currency: "USD",
            avatar: "",
            createdAt: new Date()
          });
        }

        // 加载所有数据
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

  // ... 所有 CRUD 函数保持不变 ...

  // 添加这些新的函数
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

  // ... 其他函数 (getAccountsByBank, addTransaction, deleteTransaction, changeBankColor, deleteBank, addAccount, deleteAccount, addNewBank) ...

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // 渲染不同的页面
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
          <div className="bank-fidgets-container">
            {banks.map(bank => (
              <BankFidget
                key={bank.id}
                bank={bank}
                accounts={accounts.filter(a => a.bankId === bank.id)}
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