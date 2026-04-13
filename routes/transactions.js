import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const VALID_TYPES = ['income', 'expense'];
const EXPENSE_CATEGORIES = ['Food', 'Housing', 'Transport', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];

function validateTransaction(type, amount, category, date) {
  if (!VALID_TYPES.includes(type)) return 'Type must be income or expense';
  if (!amount || isNaN(amount) || Number(amount) <= 0) return 'Amount must be a positive number';
  const validCats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  if (!validCats.includes(category)) return `Invalid category for ${type}`;
  if (!date || isNaN(Date.parse(date))) return 'Valid date is required';
  return null;
}

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { month, year } = req.query;

    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (month && year) {
      sql += ' AND strftime(\'%m\', date) = ? AND strftime(\'%Y\', date) = ?';
      params.push(String(month).padStart(2, '0'), String(year));
    } else if (year) {
      sql += ' AND strftime(\'%Y\', date) = ?';
      params.push(String(year));
    }

    sql += ' ORDER BY date DESC, id DESC';

    const rows = await db.all(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const error = validateTransaction(type, amount, category, date);
    if (error) return res.status(400).json({ error });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, type, Number(amount), category, description || '', date]
    );

    const created = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const tx = await db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const type = req.body.type ?? tx.type;
    const amount = req.body.amount ?? tx.amount;
    const category = req.body.category ?? tx.category;
    const description = req.body.description ?? tx.description;
    const date = req.body.date ?? tx.date;

    const error = validateTransaction(type, amount, category, date);
    if (error) return res.status(400).json({ error });

    await db.run(
      'UPDATE transactions SET type = ?, amount = ?, category = ?, description = ?, date = ? WHERE id = ?',
      [type, Number(amount), category, description, date, req.params.id]
    );

    const updated = await db.get('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const tx = await db.get('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.user.id,
    ]);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    await db.run('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
