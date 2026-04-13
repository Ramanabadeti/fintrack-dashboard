import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value" style={{ color }}>${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/summary', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStats).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="dashboard-loading"><div className="spinner" /><span>Loading your data…</span></div>;
  if (!stats) return <div className="dashboard-error">Failed to load dashboard data.</div>;

  const balance = stats.totalIncome - stats.totalExpenses;
  const expenseByCategory = (stats.byCategory || []).filter(c => c.type === 'expense').map((c, i) => ({ name: c.category, value: Number(c.total), fill: COLORS[i % COLORS.length] }));
  const monthlyTrend = (stats.monthlyTrend || []).slice(-6);

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <StatCard label="Total Income" value={stats.totalIncome} color="#10b981" icon="💰" />
        <StatCard label="Total Expenses" value={stats.totalExpenses} color="#ef4444" icon="💸" />
        <StatCard label="Net Balance" value={balance} color={balance >= 0 ? '#3b82f6' : '#ef4444'} icon={balance >= 0 ? '📈' : '📉'} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Expenses by Category</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseByCategory.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">No expense data yet</div>}
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Monthly Income vs Expenses</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">No trend data yet</div>}
        </div>

        <div className="chart-card chart-full">
          <h3 className="chart-title">Balance Trend</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTrend.map(m => ({ ...m, balance: m.income - m.expenses }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} />
                <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Balance" />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">Add transactions to see your balance trend</div>}
        </div>
      </div>
    </div>
  );
}
