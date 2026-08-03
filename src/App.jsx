import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import './App.css';

const db = new Dexie('MoneyDB');
db.version(1).stores({
  accounts: '++id',
  transactions: '++id, accountId, date',
});

function App() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [screen, setScreen] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.accounts.toArray().then(setAccounts);
    db.transactions.orderBy('date').reverse().limit(50).toArray().then(setTransactions);
    setLoading(false);
  }, []);

  const reload = async () => {
    setAccounts(await db.accounts.toArray());
    setTransactions(await db.transactions.orderBy('date').reverse().limit(50).toArray());
  };

  if (loading) return <div className="load">Loading...</div>;

  if (screen === 'accounts') return <AccountsScreen accounts={accounts} reload={reload} goHome={() => setScreen('home')} />;
  if (screen === 'add') return <AddScreen accounts={accounts} reload={reload} goHome={() => setScreen('home')} />;
  if (screen === 'history') return <HistoryScreen accounts={accounts} transactions={transactions} reload={reload} goHome={() => setScreen('home')} />;

  return <HomeScreen
    accounts={accounts}
    transactions={transactions}
    reload={reload}
    goAccounts={() => setScreen('accounts')}
    goAdd={() => setScreen('add')}
    goHistory={() => setScreen('history')}
  />;
}

// ==================== 首页 ====================
function HomeScreen({ accounts, transactions, reload, goAccounts, goAdd, goHistory }) {
  const total = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const f = (n) => '$' + Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const deleteTxn = async (id) => {
    const t = transactions.find(x => x.id === id);
    if (t) {
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) await db.accounts.update(acc.id, { balance: (acc.balance || 0) - t.amount });
      await db.transactions.delete(id);
      reload();
    }
  };

  return (
    <div className="home">
      <h1>💰 我的财务</h1>
      <div className="total-card">
        <div className="total-label">净资产</div>
        <div className={`total-value ${total >= 0 ? 'g' : 'r'}`}>{f(total)}</div>
      </div>

      <div className="btns">
        <button onClick={goAdd} className="btn-blue">📝 记账</button>
        <button onClick={goAccounts} className="btn-green">🏦 账户</button>
        <button onClick={goHistory} className="btn-purple">📋 记录</button>
      </div>

      <h3>我的账户</h3>
      {accounts.length === 0 ? (
        <div className="empty" onClick={goAccounts}>+ 添加账户</div>
      ) : (
        accounts.map(a => (
          <div key={a.id} className={`acc-row ${a.type || 'bank'}`}>
            <span className="acc-emoji">{a.icon || '💰'}</span>
            <div className="acc-mid"><b>{a.name}</b><span className="acc-type">{typeName(a.type)}</span></div>
            <div className={`acc-num ${(a.balance || 0) >= 0 ? 'g' : 'r'}`}>{f(a.balance)}</div>
          </div>
        ))
      )}

      <h3>最近交易</h3>
      {transactions.slice(0, 10).map(t => {
        const a = accounts.find(x => x.id === t.accountId);
        return (
          <div key={t.id} className="txn-row">
            <span className="txn-emoji">{t.amount > 0 ? '📥' : '📤'}</span>
            <div className="txn-mid"><div>{t.description}</div><div className="txn-sub">{a?.icon} {a?.name} · {t.date}</div></div>
            <div className="txn-right">
              <span className={`txn-amt ${t.amount >= 0 ? 'g' : 'r'}`}>{t.amount >= 0 ? '+' : '-'}{f(t.amount)}</span>
              <button className="del" onClick={() => deleteTxn(t.id)}>🗑️</button>
            </div>
          </div>
        );
      })}

      <div className="nav">
        <button className="nav-active">🏠 首页</button>
        <button onClick={goAdd}>➕ 记账</button>
        <button onClick={goAccounts}>🏦 账户</button>
        <button onClick={goHistory}>📋 记录</button>
      </div>
    </div>
  );
}

// ==================== 账户管理 ====================
function AccountsScreen({ accounts, reload, goHome }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [icon, setIcon] = useState('');

  const openAdd = () => { setEditId(null); setName(''); setType('bank'); setBalance(''); setCreditLimit(''); setIcon(''); setShowForm(true); };
  const openEdit = (a) => { setEditId(a.id); setName(a.name); setType(a.type || 'bank'); setBalance(String(a.balance || 0)); setCreditLimit(String(a.creditLimit || '')); setIcon(a.icon || ''); setShowForm(true); };

  const save = async () => {
    if (!name.trim()) return alert('请输入名称');
    const data = { name, type, balance: parseFloat(balance) || 0, creditLimit: type === 'credit' ? (parseFloat(creditLimit) || 0) : null, icon: icon || '💰' };
    if (editId) await db.accounts.update(editId, data);
    else await db.accounts.add(data);
    setShowForm(false);
    reload();
  };

  const del = async (id) => { if (confirm('删除这个账户？')) { await db.accounts.delete(id); reload(); } };
  const updateBalance = async (id, val) => { await db.accounts.update(id, { balance: parseFloat(val) }); reload(); };

  const f = (n) => '$' + Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <div className="page">
      <div className="top"><button onClick={goHome}>← 返回</button><h2>账户管理</h2><button onClick={openAdd}>+ 添加</button></div>

      {showForm && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal">
            <h3>{editId ? '编辑' : '添加'}账户</h3>
            <label>名称</label><input value={name} onChange={e => setName(e.target.value)} placeholder="如：Chase Checking" />
            <label>类型</label><select value={type} onChange={e => setType(e.target.value)}>
              <option value="bank">🏦 银行</option><option value="credit">💳 信用卡</option><option value="cash">💵 现金</option><option value="debt">📋 债务</option><option value="invest">📈 投资</option>
            </select>
            <label>图标</label><input value={icon} onChange={e => setIcon(e.target.value)} placeholder="💰" />
            <label>余额</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} />
            {type === 'credit' && <><label>额度</label><input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} /></>}
            <div className="modal-btns"><button onClick={() => setShowForm(false)} className="btn-gray">取消</button><button onClick={save} className="btn-blue">保存</button></div>
          </div>
        </div>
      )}

      <div className="content">
        {accounts.length === 0 ? <div className="empty">还没有账户，点击 + 添加</div> : accounts.map(a => (
          <div key={a.id} className={`acc-card ${a.type || 'bank'}`}>
            <div className="acc-card-top"><span className="acc-card-icon">{a.icon || '💰'}</span><div><b>{a.name}</b><div className="acc-type">{typeName(a.type)}</div></div><div className={`acc-card-bal ${(a.balance || 0) >= 0 ? 'g' : 'r'}`}>{f(a.balance)}</div></div>
            {a.type === 'credit' && a.creditLimit ? <div className="credit-bar"><div className="credit-fill" style={{ width: Math.min(Math.abs(a.balance) / a.creditLimit * 100, 100) + '%' }}></div></div> : null}
            {a.type === 'cash' ? <div className="quick"><input placeholder="更新余额" id={`c${a.id}`} /><button onClick={() => { const el = document.getElementById(`c${a.id}`); if (el.value) { updateBalance(a.id, el.value); el.value = ''; } }}>更新</button></div> : null}
            <div className="acc-card-acts"><button onClick={() => openEdit(a)}>✏️</button><button onClick={() => del(a.id)} className="r">🗑️</button></div>
          </div>
        ))}
      </div>

      <div className="nav"><button onClick={goHome}>🏠</button><button>➕</button><button className="nav-active">🏦</button><button>📋</button></div>
    </div>
  );
}

// ==================== 记账 ====================
function AddScreen({ accounts, reload, goHome }) {
  const [accountId, setAccountId] = useState('');
  const [type, setType] = useState('expense');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('其他');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const cats = ['餐饮', '购物', '交通', '娱乐', '住房', '收入', '工资', '还款', '其他'];

  const submit = async () => {
    if (!accountId || !desc || !amount) return alert('请填写完整');
    const amt = parseFloat(amount);
    let final = type === 'expense' ? -Math.abs(amt) : Math.abs(amt);
    const acc = accounts.find(a => a.id === Number(accountId));
    if (acc) await db.accounts.update(acc.id, { balance: (acc.balance || 0) + final });
    await db.transactions.add({ accountId: Number(accountId), description: desc, amount: final, category, date, createdAt: new Date().toISOString() });
    reload();
    setDesc(''); setAmount('');
    alert('✅ 记账成功！');
  };

  return (
    <div className="page">
      <div className="top"><button onClick={goHome}>← 返回</button><h2>记账</h2><div></div></div>
      <div className="content">
        <label>账户</label><select value={accountId} onChange={e => setAccountId(e.target.value)}><option value="">选择</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}</select>
        <label>类型</label><div className="type-btns"><button className={type === 'expense' ? 'active r' : ''} onClick={() => setType('expense')}>📤 支出</button><button className={type === 'income' ? 'active g' : ''} onClick={() => setType('income')}>📥 收入</button></div>
        <label>金额</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
        <label>描述</label><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="如：超市" />
        <label>分类</label><select value={category} onChange={e => setCategory(e.target.value)}>{cats.map(c => <option key={c}>{c}</option>)}</select>
        <label>日期</label><input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn-submit" onClick={submit}>✅ 确认记账</button>
      </div>
      <div className="nav"><button onClick={goHome}>🏠</button><button className="nav-active">➕</button><button>🏦</button><button>📋</button></div>
    </div>
  );
}

// ==================== 记录 ====================
function HistoryScreen({ accounts, transactions, reload, goHome }) {
  const [search, setSearch] = useState('');
  const filtered = transactions.filter(t => search ? t.description.toLowerCase().includes(search.toLowerCase()) : true);
  const f = (n) => '$' + Math.abs(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const del = async (id) => {
    const t = transactions.find(x => x.id === id);
    if (t) {
      const acc = accounts.find(a => a.id === t.accountId);
      if (acc) await db.accounts.update(acc.id, { balance: (acc.balance || 0) - t.amount });
      await db.transactions.delete(id);
      reload();
    }
  };

  return (
    <div className="page">
      <div className="top"><button onClick={goHome}>← 返回</button><h2>记录</h2><div></div></div>
      <div className="content">
        <input className="search" placeholder="🔍 搜索..." value={search} onChange={e => setSearch(e.target.value)} />
        {filtered.map(t => {
          const a = accounts.find(x => x.id === t.accountId);
          return (
            <div key={t.id} className="txn-row">
              <span className="txn-emoji">{t.amount > 0 ? '📥' : '📤'}</span>
              <div className="txn-mid"><div>{t.description}</div><div className="txn-sub">{a?.icon} {a?.name} · {t.date} · {t.category}</div></div>
              <div className="txn-right"><span className={`txn-amt ${t.amount >= 0 ? 'g' : 'r'}`}>{t.amount >= 0 ? '+' : '-'}{f(t.amount)}</span><button className="del" onClick={() => del(t.id)}>🗑️</button></div>
            </div>
          );
        })}
      </div>
      <div className="nav"><button onClick={goHome}>🏠</button><button>➕</button><button>🏦</button><button className="nav-active">📋</button></div>
    </div>
  );
}

function typeName(t) {
  const m = { bank: '银行', credit: '信用卡', cash: '现金', debt: '债务', invest: '投资' };
  return m[t] || '其他';
}

export default App;