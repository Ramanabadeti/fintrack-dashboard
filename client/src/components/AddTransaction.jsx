import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './AddTransaction.css';

const EXPENSE_CATS = ['Food','Housing','Transport','Healthcare','Entertainment','Shopping','Utilities','Other'];
const INCOME_CATS = ['Salary','Freelance','Investment','Other'];

export default function AddTransaction({ onSuccess }) {
  const { token } = useAuth();
  const [type, setType] = useState('expense');
  const [form, setForm] = useState({ amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATS : INCOME_CATS;

  function handleTypeChange(t) {
    setType(t);
    setForm(f => ({ ...f, category: t === 'expense' ? 'Food' : 'Salary' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, type, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add transaction');
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSuccess?.(); }, 1200);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  return (
    <div className="add-transaction">
      <div className="add-card">
        <h2 className="add-title">New Transaction</h2>
        <div className="type-toggle">
          <button className={`toggle-btn ${type === 'expense' ? 'active expense' : ''}`} onClick={() => handleTypeChange('expense')}>💸 Expense</button>
          <button className={`toggle-btn ${type === 'income' ? 'active income' : ''}`} onClick={() => handleTypeChange('income')}>💰 Income</button>
        </div>
        <form onSubmit={handleSubmit} className="add-form">
          <div className="form-row">
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Grocery run at Whole Foods" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">✓ Transaction added!</div>}
          <button type="submit" className={`btn-add ${type}`} disabled={loading}>
            {loading ? 'Saving…' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
