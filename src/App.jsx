import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import BankFidget from "./components/BankFidget";
import "./App.css";

// 初始化数据库
const db = new Dexie("FinanceDB");
db.version(2).stores({
  transactions: "++id, date, amount, category, description, bank, accountType",
  banks: "++id, name, color, icon"
});

// 默认银行
const defaultBanks = [
  { name: "Capital One", color: "#004977", icon: "🏦" },
  { name: "Chase", color: "#117ACA", icon: "💳" },
  { name: "Bank of America", color: "#004B87", icon: "🏛️" },
  { name: "Wells Fargo", color: "#D41A1A", icon: "🏧" },
  { name: "Citibank", color: "#003F6C", icon: "💎" },
];

function App() {
  const [transactions, setTransactions] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      try {
        // 检查是否有银行数据
        const bankCount = await db.banks.count();
        if (bankCount === 0) {
          // 添加默认银行
          await db.banks.bulkAdd(defaultBanks);
        }

        // 加载所有数据
        const allBanks = await db.banks.toArray();
        const allTransactions = await db.transactions.toArray();
        
        setBanks(allBanks);
        setTransactions(allTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing data:", error);
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 获取某个银行的所有交易
  const getTransactionsByBank = (bankName) => {
    return transactions.filter(t => t.bank === bankName);
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

  // 添加新银行
  const addNewBank = async () => {
    const name = prompt("Enter bank name:");
    if (name) {
      const newBank = {
        name,
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
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
            transactions={getTransactionsByBank(bank.name)}
            onAddTransaction={addTransaction}
            onDeleteTransaction={deleteTransaction}
            onColorChange={changeBankColor}
          />
        ))}
      </div>
    </div>
  );
}

export default App;