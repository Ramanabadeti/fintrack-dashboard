# FinTrack — Personal Finance Dashboard

**Track income and expenses, visualize spending patterns, and set category budgets — all in one clean dashboard.** Built with React, Recharts, and a secure JWT-authenticated Node.js API.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=flat-square)](https://recharts.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite)](https://sqlite.org)

---

## What It Does

Most people don't know where their money goes until it's gone. FinTrack gives you a live view of your financial picture — category breakdowns, monthly trends, and income vs expense comparisons — so you can make better decisions with real data.

---

## Screenshots

> _Add screenshots — dashboard with charts, transactions table, add transaction form_

---

## Features

- **Dashboard** — Pie chart (by category), bar chart (monthly income vs expenses), line chart (balance trend)
- **Transaction Tracking** — Add income and expenses with category, description, and date
- **Filters** — Filter transactions by month and year
- **Secure Auth** — JWT-based login/register, bcrypt password hashing
- **Demo Account** — Try instantly without registering

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express 4 |
| Auth | JWT + bcryptjs |
| Database | SQLite |

---

## Architecture

```
React + Recharts (Vite, port 5173)
      │  REST API + JWT header
      ▼
Express (port 5002)
      │  SQL
      ▼
SQLite (fintrack.db)
```

---

## Demo Credentials

```
Email:    demo@fintrack.com
Password: demo123
```

---

## Setup & Installation

```bash
git clone https://github.com/Ramanabadeti/fintrack-dashboard.git
cd fintrack-dashboard

# Backend
npm install
cp .env.example .env   # set JWT_SECRET
node initDb.js

# Frontend
cd client && npm install && cd ..
```

**Run:**
```bash
node server.js          # http://localhost:5002
cd client && npm run dev  # http://localhost:5173
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/transactions` | List transactions (filterable) |
| `POST` | `/api/transactions` | Add transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
| `GET` | `/api/stats/summary` | Dashboard data (totals, charts) |

---

## Author

**Raman Abadeti** — Full-Stack Developer | [GitHub](https://github.com/Ramanabadeti)
