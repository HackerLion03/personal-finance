import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import BankFidget from "./components/BankFidget";
import "./App.css";

// 初始化数据库
const db = new Dexie("FinanceDB");
db.version(3).stores({
  transactions: "++id, date, amount, category, description, bankId, accountId, accountType",
  banks: "++id, name, color, icon",
  accounts: "++id, bankId, name, type, balance, color"
});

// 默认数据
const defaultBanks = [
  { name: "Capital One", color: "#004977", icon: "🏦" },
  { name: "Chase", color: "#117ACA", icon: "💳" },
  { name: "Bank of America", color: "#004B87", icon: "🏛️" },
];

const defaultAccounts = [
  { bankId: 1, name: "Main Checking", type: "checking", balance: 0, color: "#28a745" },
  { bankId: 1, name: "Savings Account", type: "savings", balance: 0, color: "#17a2b8" },
  { bankId: 2, name: "Freedom Credit", type: "credit", balance: 0, color: "#dc3545" },
];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [accounts, setAccounts] = useState([]);
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
        }

        // 加载所有数据
        const allBanks = await db.banks.toArray();
        const allAccounts = await db.accounts.toArray();
        const allTransactions = await db.transactions.toArray();
        
        setBanks(allBanks);
        setAccounts(allAccounts);
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 获取某个银行的账户
  const getAccountsByBank = (bankId) => {
    return accounts.filter(a => a.bankId === bankId);
  };

  // 获取某个账户的交易
  const getTransactionsByAccount = (accountId) => {
    return transactions.filter(t => t.accountId === accountId);
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

  // 删除银行（同时删除该银行下的所有账户和交易）
  const deleteBank = async (bankId) => {
    try {
      // 获取该银行的所有账户
      const bankAccounts = accounts.filter(a => a.bankId === bankId);
      const accountIds = bankAccounts.map(a => a.id);
      
      // 删除该银行的所有交易
      await db.transactions.where('accountId').anyOf(accountIds).delete();
      
      // 删除该银行的所有账户
      await db.accounts.where('bankId').equals(bankId).delete();
      
      // 删除银行
      await db.banks.delete(bankId);
      
      // 更新状态
      setBanks(prev => prev.filter(b => b.id !== bankId));
      setAccounts(prev => prev.filter(a => a.bankId !== bankId));
      setTransactions(prev => prev.filter(t => !accountIds.includes(t.accountId)));
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  // 添加账户
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
      // 删除该账户的所有交易
      await db.transactions.where('accountId').equals(accountId).delete();
      
      // 删除账户
      await db.accounts.delete(accountId);
      
      // 更新状态
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setTransactions(prev => prev.filter(t => t.accountId !== accountId));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  // 添加新银行
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>💰 Personal Finance</h1>
        <button className="add-bank-btn" onClick={addNewBank}>
          + Add Bank
        </button>
      </header>

      <div className="bank-fidgets-container">
        {banks.map(bank => (
          <BankFidget
            key={bank.id}
            bank={bank}
            accounts={getAccountsByBank(bank.id)}
            transactions={transactions.filter(t => 
              accounts.some(a => a.id === t.accountId && a.bankId === bank.id)
            )}
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
}

export default App;