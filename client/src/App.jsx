import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import TransactionList from './components/TransactionList.jsx';
import AddTransaction from './components/AddTransaction.jsx';

function AppShell() {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📊</span>
          <span className="brand-name">FinTrack</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeView === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveView('transactions')}
          >
            <span className="nav-icon">📋</span>
            <span>Transactions</span>
          </button>
          <button
            className={`nav-item ${activeView === 'add' ? 'active' : ''}`}
            onClick={() => setActiveView('add')}
          >
            <span className="nav-icon">➕</span>
            <span>Add Transaction</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Log out">
            ↩
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1 className="page-title">
            {activeView === 'dashboard' && 'Dashboard'}
            {activeView === 'transactions' && 'Transactions'}
            {activeView === 'add' && 'Add Transaction'}
          </h1>
          <div className="header-meta">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <div className="content-body">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'transactions' && <TransactionList />}
          {activeView === 'add' && (
            <AddTransaction onSuccess={() => setActiveView('transactions')} />
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
