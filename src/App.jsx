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

  // ------------------ 补充缺失的数据库 Handler ------------------

  const addTransaction = async (txn) => {
    try {
      const id = await db.transactions.add(txn);
      setTransactions(prev => [...prev, { ...txn, id }]);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await db.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const changeBankColor = async (bankId, color) => {
    try {
      await db.banks.update(bankId, { color });
      setBanks(prev => prev.map(b => b.id === bankId ? { ...b, color } : b));
    } catch (error) {
      console.error("Error updating bank color:", error);
    }
  };

  const deleteBank = async (bankId) => {
    try {
      await db.banks.delete(bankId);
      // 同时清理绑定的账户
      const relatedAccounts = accounts.filter(a => a.bankId === bankId);
      for (let acc of relatedAccounts) {
        await db.accounts.delete(acc.id);
      }
      setBanks(prev => prev.filter(b => b.id !== bankId));
      setAccounts(prev => prev.filter(a => a.bankId !== bankId));
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  const addAccount = async (account) => {
    try {
      const id = await db.accounts.add(account);
      setAccounts(prev => [...prev, { ...account, id }]);
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await db.accounts.delete(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // ------------------ 订阅与 Profile 逻辑 ------------------

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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