import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import './TransactionList.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function TransactionList() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => { fetchTransactions(); }, [month, year]);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set('month', month);
      if (year) params.set('year', year);
      const res = await fetch(`/api/transactions?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setTransactions(data);
      setPage(1);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    await fetch(`/api/transactions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setTransactions(t => t.filter(x => x.id !== id));
  }

  const paginated = transactions.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(transactions.length / PER_PAGE);
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="transaction-list">
      <div className="list-filters">
        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">All months</option>
          {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="list-count">{transactions.length} transactions</span>
      </div>

      {loading ? (
        <div className="list-loading"><div className="spinner" /> Loading…</div>
      ) : transactions.length === 0 ? (
        <div className="list-empty">No transactions found. Add one to get started.</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="tx-table">
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Type</th><th>Amount</th><th></th></tr></thead>
              <tbody>
                {paginated.map(tx => (
                  <tr key={tx.id}>
                    <td className="tx-date">{new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span className="tx-category">{tx.category}</span></td>
                    <td className="tx-desc">{tx.description || '—'}</td>
                    <td><span className={`tx-type ${tx.type}`}>{tx.type}</span></td>
                    <td className={`tx-amount ${tx.type}`}>{tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toFixed(2)}</td>
                    <td><button className="btn-del" onClick={() => deleteTransaction(tx.id)} title="Delete">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
