# FinTrack — Personal Finance Dashboard

**Track income and expenses, visualize spending patterns, and manage budgets — all in one clean dashboard.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%E2%96%B6%20Visit-black?style=for-the-badge&logo=vercel)](https://fintrack-dashboard-bci9j1sg2-ramana-badetis-projects.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite)](https://sqlite.org)
[![Recharts](https://img.shields.io/badge/Recharts-2-22B5BF?style=flat-square)](https://recharts.org)

> **🚀 Live Demo →** https://fintrack-dashboard-bci9j1sg2-ramana-badetis-projects.vercel.app
>
> Demo credentials: `demo@fintrack.com` / `demo123`

---

## Overview

Most people don't know where their money goes until it's gone. FinTrack gives you a real-time view of your financial picture — category breakdowns, monthly trends, and income vs expense comparisons — so you can make smarter decisions backed by real data.

---

## Features

- **Interactive Charts** — Pie chart (spending by category), bar chart (monthly income vs expenses), line chart (balance trend) — all powered by Recharts
- **Transaction Management** — Add, filter, and delete income/expense transactions with categories, descriptions, and dates
- **Budget Tracking** — Set monthly spending limits per category
- **Month/Year Filtering** — Drill into any period instantly
- **JWT Authentication** — Secure login/register with bcrypt password hashing, 7-day token expiry
- **Demo Account** — Pre-seeded with 6 months of realistic data, no signup needed
- **Responsive UI** — Sidebar layout on desktop, stacked nav on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express 4 |
| Auth | JWT + bcryptjs |
| Database | SQLite (`sqlite` / `sqlite3`) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Architecture

```
React + Recharts (Vite)
        │
        │  REST API  +  Authorization: Bearer <JWT>
        ▼
Express Server (Render)
        │
        ▼
   SQLite Database
   ├── users
   ├── transactions
   └── budgets
```

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Login, returns JWT |
| `GET` | `/api/transactions` | ✓ | List transactions (filterable) |
| `POST` | `/api/transactions` | ✓ | Add transaction |
| `DELETE` | `/api/transactions/:id` | ✓ | Delete transaction |
| `GET` | `/api/stats/summary` | ✓ | Totals + chart data |
| `GET` | `/api/stats/budgets` | ✓ | Budget vs spent for current month |

---

## Local Setup

```bash
git clone https://github.com/Ramanabadeti/fintrack-dashboard.git
cd fintrack-dashboard

npm install
cp .env.example .env        # add JWT_SECRET
node initDb.js              # creates DB + seeds demo account

cd client && npm install && cd ..

node server.js              # API  → http://localhost:5002
cd client && npm run dev    # UI   → http://localhost:5173
```

---

## Author

**Raman Abadeti** — Full-Stack Developer
[GitHub](https://github.com/Ramanabadeti) · [Live Demo](https://fintrack-dashboard-bci9j1sg2-ramana-badetis-projects.vercel.app)
