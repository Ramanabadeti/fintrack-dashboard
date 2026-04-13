import express from 'express';
import { getDb } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// GET /api/stats/summary
router.get('/summary', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.id;

    // Overall totals
    const totals = await db.all(
      `SELECT type, ROUND(SUM(amount), 2) as total
       FROM transactions WHERE user_id = ?
       GROUP BY type`,
      [userId]
    );

    let totalIncome = 0;
    let totalExpenses = 0;
    totals.forEach((row) => {
      if (row.type === 'income') totalIncome = row.total;
      if (row.type === 'expense') totalExpenses = row.total;
    });

    // By category
    const byCategory = await db.all(
      `SELECT category, type, ROUND(SUM(amount), 2) as total
       FROM transactions WHERE user_id = ?
       GROUP BY category, type
       ORDER BY total DESC`,
      [userId]
    );

    // Monthly trend — last 12 months
    const monthlyRaw = await db.all(
      `SELECT
         strftime('%Y-%m', date) as month,
         type,
         ROUND(SUM(amount), 2) as total
       FROM transactions
       WHERE user_id = ?
         AND date >= date('now', '-12 months')
       GROUP BY month, type
       ORDER BY month ASC`,
      [userId]
    );

    // Build a unified monthly trend array
    const monthMap = {};
    monthlyRaw.forEach(({ month, type, total }) => {
      if (!monthMap[month]) monthMap[month] = { month, income: 0, expenses: 0 };
      if (type === 'income') monthMap[month].income = total;
      if (type === 'expense') monthMap[month].expenses = total;
    });
    const monthlyTrend = Object.values(monthMap);

    res.json({
      totalIncome,
      totalExpenses,
      balance: Math.round((totalIncome - totalExpenses) * 100) / 100,
      byCategory,
      monthlyTrend,
    });
  } catch (err) {
    console.error('Stats summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/budgets
router.get('/budgets', async (req, res) => {
  try {
    const db = await getDb();
    const userId = req.user.id;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());

    const budgets = await db.all(
      `SELECT b.id, b.category, b.monthly_limit, b.month, b.year,
              ROUND(COALESCE(SUM(t.amount), 0), 2) as spent
       FROM budgets b
       LEFT JOIN transactions t
         ON t.user_id = b.user_id
         AND t.category = b.category
         AND t.type = 'expense'
         AND strftime('%m', t.date) = b.month
         AND strftime('%Y', t.date) = b.year
       WHERE b.user_id = ? AND b.month = ? AND b.year = ?
       GROUP BY b.id`,
      [userId, month, year]
    );

    res.json(budgets);
  } catch (err) {
    console.error('Budgets get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/stats/budgets
router.post('/budgets', async (req, res) => {
  try {
    const { category, monthly_limit, month, year } = req.body;

    if (!category || !monthly_limit || !month || !year) {
      return res.status(400).json({ error: 'category, monthly_limit, month, and year are required' });
    }
    if (isNaN(monthly_limit) || Number(monthly_limit) <= 0) {
      return res.status(400).json({ error: 'monthly_limit must be a positive number' });
    }

    const db = await getDb();
    await db.run(
      `INSERT INTO budgets (user_id, category, monthly_limit, month, year)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, category, month, year)
       DO UPDATE SET monthly_limit = excluded.monthly_limit`,
      [req.user.id, category, Number(monthly_limit), String(month).padStart(2, '0'), String(year)]
    );

    const budget = await db.get(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?',
      [req.user.id, category, String(month).padStart(2, '0'), String(year)]
    );

    res.status(201).json(budget);
  } catch (err) {
    console.error('Budgets post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
