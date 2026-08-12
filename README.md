# Winvel - T-Shirt E-Commerce Platform

A full-stack t-shirt e-commerce application built with React, Node.js/Express, and MySQL.

## Project Structure

```
winvel/
├── backend/                  # Express API server
│   └── src/
│       ├── config/           # Database & environment config
│       ├── middleware/        # Auth, error handling
│       ├── services/         # Modular service layer
│       │   ├── auth/         # Authentication (login, register)
│       │   ├── products/     # Product catalog
│       │   ├── orders/       # Order management
│       │   ├── users/        # User management (admin)
│       │   └── categories/   # Product categories
│       └── routes/           # API route aggregator
├── frontend/                 # React SPA (Vite)
│   └── src/
│       ├── pages/
│       │   ├── user/         # Customer-facing pages
│       │   ├── admin/        # Admin dashboard pages
│       │   └── shared/       # Login, register
│       ├── layouts/          # User & Admin layouts
│       ├── routes/           # Route definitions
│       └── services/         # API client
├── database/
│   ├── schema.sql            # MySQL schema
│   └── seed.sql              # Sample data
└── docker-compose.yml        # MySQL container
```

## Tech Stack

- **Frontend:** React 19, React Router, Vite
- **Backend:** Node.js, Express (ES modules)
- **Database:** MySQL 8
- **Auth:** JWT + bcrypt

## Quick Start with Docker (recommended)

Run **MySQL + Backend + Frontend** together with one command:

```bash
docker compose up -d --build
```

Or:

```bash
npm run docker:up
```

| Service | URL |
|---------|-----|
| Store (frontend) | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| API | http://localhost:5000/api |
| API health | http://localhost:5000/api/health |

**Admin login:** `admin@winvel.com` / `admin123`

Other commands:

```bash
npm run docker:logs    # view logs
npm run docker:down    # stop all containers
```

Logo uploads and settings are persisted in Docker volumes (`uploads_data`, `mysql_data`).

---

## Local Development (without Docker for app)

### Prerequisites

- Node.js 18+
- Docker (for MySQL) or a local MySQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

### 3. Start MySQL only

```bash
docker compose up -d mysql
```

Wait until the container is healthy (`docker ps` should show `healthy`), then continue.

### 4. Create admin user

```bash
npm run db:init
```

This is safe to re-run. If Docker already initialized the database, it skips schema/seed and only ensures the admin account exists.

### 5. Start development servers

```bash
npm run dev
```

This starts both:
- **Backend API** at http://localhost:5000
- **Frontend** at http://localhost:3000

run reparate go separate path and run 

ADMIN@DESKTOP-UC767RF MINGW64 /d/Documents/winvel/frontend (main)
$ npm run dev


ADMIN@DESKTOP-UC767RF MINGW64 /d/Documents/winvel/backend (main)
$ npm run dev


## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register customer | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/profile` | Get profile | User |
| GET | `/api/products` | List products | Public |
| GET | `/api/products/:id` | Product detail | Public |
| POST | `/api/products` | Create product | Admin |
| GET | `/api/orders` | List orders | User/Admin |
| GET | `/api/users` | List users | Admin |
| GET | `/api/categories` | List categories | Public |
| GET | `/api/settings` | App theme & store config | Public |
| PUT | `/api/settings` | Update settings | Admin |
| POST | `/api/settings/upload/logo` | Upload store logo | Admin |

## Screens

### User (Customer)
- Home, Shop, Product Detail, Cart, Orders
- Login / Register

### Admin
- Dashboard (stats overview)
- Products management
- Orders management
- Users management

Access admin at http://localhost:3000/admin

## Default Admin Account

| Email | Password |
|-------|----------|
| admin@winvel.com | admin123 |

Created automatically by `npm run db:init`. Change this password before deploying to production.
