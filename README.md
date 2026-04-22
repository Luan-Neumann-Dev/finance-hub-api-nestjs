# FinanceHub API

> A RESTful API for personal finance management — track income, expenses, installments, and savings goals with full JWT authentication and multi-type reporting.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-UNLICENSED-gray.svg?style=for-the-badge)](LICENSE)

**🔗 Related repository: [FinanceHub Web (frontend)](https://github.com/Luan-Neumann-Dev/finance-hub-web)**

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [What I Learned](#-what-i-learned)
- [Roadmap](#-roadmap)

## 🎯 About The Project

FinanceHub API is the backend service powering a complete personal finance dashboard. It provides a secure, structured RESTful interface for managing all aspects of a user's financial life: income streams with recurrence rules, categorized expenses, installment-based purchases, and virtual piggy banks for savings goals.

The API is built with NestJS following a modular architecture, where every financial domain (auth, incomes, expenses, piggy banks, reports) lives in its own isolated module. Communication with the PostgreSQL database is handled exclusively through Prisma ORM, with full type safety across every query.

One of the main challenges in building this API was designing the reporting engine. Reports need to aggregate data across different income recurrence types (one-time, weekly, monthly, annual), date ranges, and categories — all while keeping response times acceptable. This was solved by using parallel `Promise.all` queries and Prisma's `groupBy` and `aggregate` capabilities, avoiding N+1 patterns throughout.

### Why I Built This

This project was built to solidify backend skills in NestJS and Prisma, and to practice designing a modular API that can serve a rich frontend without leaking business logic to the client. The domain (personal finance) was chosen for its complexity: recurring incomes, installment tracking, and multi-dimensional reporting all require careful data modeling and query design.

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** — Register, login, and profile endpoints with bcrypt password hashing and global JWT guard (routes opt-in to public access via decorator)
- 💰 **Income Management** — Create and manage income sources with recurrence types: `none`, `weekly`, `monthly`, and `annual`, plus configurable receive date
- 💸 **Expense Tracking** — Full CRUD for expenses with date, category, and optional installment group linking
- 📦 **Installment System** — Group installment purchases and track each installment individually across months
- 🐷 **Piggy Banks** — Virtual savings accounts with deposit/withdrawal transaction history and goal descriptions
- 📊 **Advanced Reports** — Monthly summary, period-range report, annual month-by-month breakdown, and month-over-month comparison

### Technical Features
- Global exception filter for consistent error response format
- Rate limiting via `@nestjs/throttler`
- Global `ValidationPipe` with whitelist, forbidNonWhitelisted, and auto-transform
- CORS configured per environment variable
- Automatic default category seeding on user registration
- Graceful shutdown hooks

## 🛠️ Tech Stack

**Runtime & Framework:**
- Node.js / TypeScript 5
- NestJS 11 — modular framework, dependency injection, guards, filters, pipes

**Database:**
- PostgreSQL — relational database
- Prisma 7 — ORM, migrations, schema management, Prisma Studio
- `@prisma/adapter-pg` — native pg adapter

**Authentication & Security:**
- `@nestjs/jwt` — JWT token signing and verification
- `bcryptjs` — password hashing with configurable salt rounds
- `class-validator` / `class-transformer` — DTO validation

**Development Tools:**
- Jest — unit and e2e testing
- ESLint + Prettier
- Nest CLI

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 14 running locally or via Docker

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finance-hub-api.git
cd finance-hub-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

4. **Configure `.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_hub"
JWT_SECRET="your-super-secret-key"
CORS_ORIGIN="http://localhost:3000"
PORT=3333
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

6. **Generate Prisma client**
```bash
npm run prisma:generate
```

7. **Start the development server**
```bash
npm run start:dev
```

8. **Access the API**
```
http://localhost:3333/api
```

### Useful Scripts

```bash
npm run prisma:studio     # Open Prisma Studio (visual DB browser)
npm run test              # Run unit tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage report
```

## 📁 Project Structure

```
finance-hub-api/
├── prisma/
│   ├── schema.prisma            # Database schema and models
│   └── migrations/              # Migration history
│
├── src/
│   ├── common/
│   │   ├── decorators/          # @CurrentUser, @Public
│   │   ├── filters/             # AllExceptionsFilter
│   │   └── guards/              # JwtAuthGuard (global)
│   │
│   ├── prisma/                  # PrismaModule and PrismaService
│   │
│   ├── modules/
│   │   ├── auth/                # Register, login, profile
│   │   ├── categories/          # Expense categories CRUD
│   │   ├── incomes/             # Income sources with recurrence
│   │   ├── expenses/            # Expense entries CRUD
│   │   ├── installments/        # Installment tracking
│   │   ├── piggy-banks/         # Savings accounts CRUD
│   │   ├── piggy-transactions/  # Deposit/withdrawal history
│   │   └── reports/             # Monthly, period, annual, comparison
│   │
│   ├── app.module.ts
│   └── main.ts
│
└── test/
    └── app.e2e-spec.ts
```

## 🗄️ Database Schema

### Models

#### `User`
```
id, email (unique), passwordHash, fullName, createdAt, updatedAt
→ has many: Income, Expense, ExpenseCategory, PiggyBank, InstallmentGroup
```

#### `Income`
```
id, userId, name, amount, recurrence (none|weekly|monthly|annual), receiveDate, createdAt
```

#### `ExpenseCategory`
```
id, userId, name, color, icon, createdAt
```

#### `Expense`
```
id, userId, categoryId?, installmentGroupId?, installmentNumber?, amount, description, date
```

#### `InstallmentGroup`
```
id, userId, categoryId?, description, totalAmount, installments (count), createdAt
→ has many: Expense (one per installment)
```

#### `PiggyBank`
```
id, userId, name, goal (text), bank, balance, createdAt
→ has many: PiggyTransaction
```

#### `PiggyTransaction`
```
id, piggyBankId, userId, type (deposit|withdrawal), amount, description, date
```

### Relationships

```
User (1) ──→ (N) Income
User (1) ──→ (N) Expense
User (1) ──→ (N) ExpenseCategory
User (1) ──→ (N) PiggyBank
PiggyBank (1) ──→ (N) PiggyTransaction
InstallmentGroup (1) ──→ (N) Expense
```

## 📚 API Documentation

### Authentication

All routes are protected by a global `JwtAuthGuard`. Routes marked with `@Public()` are exempt.

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile          # requires JWT
```

**Login response:**
```json
{
  "user": { "id": 1, "email": "user@example.com", "fullName": "John Doe" },
  "token": "eyJhbGci..."
}
```

### Endpoints Overview

| Domain | Method | Endpoint | Description |
|---|---|---|---|
| Auth | POST | `/api/auth/register` | Create account |
| Auth | POST | `/api/auth/login` | Get JWT token |
| Auth | GET | `/api/auth/profile` | Current user |
| Incomes | GET/POST | `/api/incomes` | List / create |
| Incomes | GET/PATCH/DELETE | `/api/incomes/:id` | Detail / update / delete |
| Expenses | GET/POST | `/api/expenses` | List / create |
| Expenses | GET/PATCH/DELETE | `/api/expenses/:id` | Detail / update / delete |
| Categories | GET/POST | `/api/categories` | List / create |
| Categories | PATCH/DELETE | `/api/categories/:id` | Update / delete |
| Installments | GET/POST | `/api/installments` | List groups / create group |
| Installments | PATCH | `/api/installments/:id` | Update installment |
| Piggy Banks | GET/POST | `/api/piggy-banks` | List / create |
| Piggy Banks | GET/PATCH/DELETE | `/api/piggy-banks/:id` | Detail / update / delete |
| Piggy Transactions | POST | `/api/piggy-transactions` | Deposit or withdraw |
| Reports | GET | `/api/reports/monthly` | Current month summary |
| Reports | GET | `/api/reports/period` | Date range report |
| Reports | GET | `/api/reports/annual/:year` | Full year by month |
| Reports | GET | `/api/reports/comparison` | Current vs previous month |

### Example Request

```bash
curl -X GET http://localhost:3333/api/reports/monthly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

```json
{
  "totalIncomes": 5000.00,
  "totalExpenses": 2340.50,
  "balance": 2659.50,
  "totalSavings": 1200.00,
  "expensesByCategory": [
    {
      "categoryName": "Alimentação",
      "total": 850.00,
      "percentage": 36.3,
      "count": 12
    }
  ]
}
```

## 💡 Challenges & Solutions

### Recurring Income Aggregation
**Problem:** Incomes have different recurrence types (`weekly`, `monthly`, `annual`, `none`). Reports needed to calculate how much income was effectively earned in any given period, normalizing all types into a comparable monthly figure.

**Solution:** Recurring incomes are fetched separately from one-time incomes and reduced with a switch statement that applies the appropriate multiplier per recurrence type. For period reports, the month count is calculated and applied proportionally to annual and weekly incomes.

### Installment Tracking
**Problem:** Tracking installment purchases required linking individual expense records back to their parent group while preserving the flexibility to query expenses normally.

**Solution:** Introduced `InstallmentGroup` as a parent model. When an installment purchase is created, the API generates N individual `Expense` records (one per installment), each linked via `installmentGroupId` and `installmentNumber`. This keeps the expense model uniform while enabling grouped views on the frontend.

## 📚 What I Learned

**Technical Skills:**
- NestJS module architecture, custom decorators (`@CurrentUser`, `@Public`), and global guards/filters/pipes
- Prisma ORM: complex `groupBy`, `aggregate`, parallel queries with `Promise.all`, and raw SQL when needed
- Designing data models that support flexible querying without over-fetching
- JWT authentication flow with bcrypt and guard-level route protection

**Best Practices:**
- Separating DTOs with class-validator for input safety at the controller boundary
- Using `whitelist: true` in ValidationPipe to silently strip unknown fields
- Seeding sensible defaults (expense categories) on user registration to improve first-run UX

## 🗺️ Roadmap

- [ ] Swagger/OpenAPI documentation endpoint
- [ ] Budget goals per category with alert thresholds
- [ ] Export reports as CSV or PDF
- [ ] Refresh token support
- [ ] Unit tests for services

## 📄 License

UNLICENSED — personal project.

## 👤 Author

**Luan Henrique Neumann**

- LinkedIn: [LuanNeumannDev](https://www.linkedin.com/in/luan-henrique-neumann-dev/)
- GitHub: [@Luan-Neumann-Dev](https://github.com/Luan-Neumann-Dev)
- Email: luan.neumann.dev@gmail.com

---

<div align="center">

⭐ Star this repository if you found it helpful!

</div>
