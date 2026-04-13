import { getDb } from './db.js';
import bcrypt from 'bcryptjs';

async function initDb() {
  const db = await getDb();

  console.log('Creating tables...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      monthly_limit REAL NOT NULL CHECK(monthly_limit > 0),
      month TEXT NOT NULL,
      year TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, category, month, year),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('Tables created successfully.');

  // Check if demo user already exists
  const existing = await db.get('SELECT id FROM users WHERE email = ?', ['demo@fintrack.com']);
  if (existing) {
    console.log('Demo user already exists. Skipping seed.');
    process.exit(0);
  }

  // Seed demo user
  const passwordHash = await bcrypt.hash('demo123', 12);
  const result = await db.run(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    ['demo', 'demo@fintrack.com', passwordHash]
  );
  const userId = result.lastID;
  console.log(`Demo user created with id=${userId}`);

  // Seed realistic transactions for the past 6 months
  const today = new Date();
  const transactions = [];

  for (let m = 5; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');

    // Income
    transactions.push({
      user_id: userId,
      type: 'income',
      amount: 5500 + Math.round(Math.random() * 500),
      category: 'Salary',
      description: 'Monthly salary',
      date: `${year}-${month}-01`,
    });

    if (Math.random() > 0.4) {
      transactions.push({
        user_id: userId,
        type: 'income',
        amount: Math.round((200 + Math.random() * 800) * 100) / 100,
        category: 'Freelance',
        description: 'Freelance project payment',
        date: `${year}-${month}-${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
      });
    }

    // Expenses
    const expenseTemplates = [
      { category: 'Housing', description: 'Rent payment', amount: () => 1800 },
      { category: 'Food', description: 'Groceries', amount: () => Math.round((60 + Math.random() * 80) * 100) / 100 },
      { category: 'Food', description: 'Dining out', amount: () => Math.round((25 + Math.random() * 60) * 100) / 100 },
      { category: 'Food', description: 'Coffee shop', amount: () => Math.round((10 + Math.random() * 20) * 100) / 100 },
      { category: 'Transport', description: 'Monthly transit pass', amount: () => 120 },
      { category: 'Transport', description: 'Uber / ride share', amount: () => Math.round((12 + Math.random() * 30) * 100) / 100 },
      { category: 'Utilities', description: 'Electricity bill', amount: () => Math.round((80 + Math.random() * 40) * 100) / 100 },
      { category: 'Utilities', description: 'Internet service', amount: () => 60 },
      { category: 'Entertainment', description: 'Streaming services', amount: () => 35 },
      { category: 'Entertainment', description: 'Movie / events', amount: () => Math.round((20 + Math.random() * 60) * 100) / 100 },
      { category: 'Healthcare', description: 'Pharmacy', amount: () => Math.round((15 + Math.random() * 50) * 100) / 100 },
      { category: 'Shopping', description: 'Online shopping', amount: () => Math.round((30 + Math.random() * 120) * 100) / 100 },
    ];

    expenseTemplates.forEach((tmpl, i) => {
      const day = String(Math.min(28, (i * 2) + 1 + Math.floor(Math.random() * 3))).padStart(2, '0');
      transactions.push({
        user_id: userId,
        type: 'expense',
        amount: tmpl.amount(),
        category: tmpl.category,
        description: tmpl.description,
        date: `${year}-${month}-${day}`,
      });
    });
  }

  const stmt = await db.prepare(
    'INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const t of transactions) {
    await stmt.run(t.user_id, t.type, t.amount, t.category, t.description, t.date);
  }
  await stmt.finalize();

  console.log(`Seeded ${transactions.length} transactions.`);

  // Seed budgets for current month
  const curMonth = String(today.getMonth() + 1).padStart(2, '0');
  const curYear = String(today.getFullYear());
  const budgets = [
    { category: 'Food', monthly_limit: 500 },
    { category: 'Housing', monthly_limit: 2000 },
    { category: 'Transport', monthly_limit: 200 },
    { category: 'Entertainment', monthly_limit: 150 },
    { category: 'Shopping', monthly_limit: 300 },
    { category: 'Utilities', monthly_limit: 180 },
    { category: 'Healthcare', monthly_limit: 100 },
  ];

  for (const b of budgets) {
    await db.run(
      'INSERT OR IGNORE INTO budgets (user_id, category, monthly_limit, month, year) VALUES (?, ?, ?, ?, ?)',
      [userId, b.category, b.monthly_limit, curMonth, curYear]
    );
  }

  console.log('Budgets seeded.');
  console.log('\nDemo credentials:');
  console.log('  Email:    demo@fintrack.com');
  console.log('  Password: demo123');
  console.log('\nDatabase initialised successfully!');
  process.exit(0);
}

initDb().catch((err) => {
  console.error('Error initialising database:', err);
  process.exit(1);
});
