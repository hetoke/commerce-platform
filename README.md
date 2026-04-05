# MiniStore

Full-stack e-commerce application built with React, Express, MongoDB, and VNPay.

The project includes:
- customer storefront, cart, and order flow
- admin item management with image uploads
- cookie-based authentication with CSRF protection
- VNPay checkout and payment status handling

## Live Demo

- App: https://commerce-platform.onrender.com/

Notes:
- the Render deployment may cold-start on first visit
- admin access is intentionally restricted on the public demo

## Screenshots

![Storefront](screenshots/storefront.jpg)
![Item Detail](screenshots/item-details.jpg)
![Admin Panel](screenshots/admin-panel.jpg)

## Features

### Customer

- browse products and view product details
- add products to cart
- create orders from selected cart items
- pay with VNPay or choose cash
- view order status and cancel eligible orders
- leave product reviews
- sign up, log in, and use Google sign-in

### Admin

- create, edit, and delete items
- upload product images to Supabase Storage
- manage catalog content from the admin panel

### Payments and Orders

- VNPay payment URL generation
- VNPay return and IPN handling
- payment success updates order payment state
- paid VNPay orders move from `pending` to `confirmed`
- only paid, non-cancelled orders count toward `sellCount`

## Tech Stack

### Frontend

- React 19
- React Router 7
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- TypeScript
- Supabase Storage

### Security

- JWT access and refresh tokens in cookies
- CSRF protection with `csrf-csrf`
- request validation with `express-validator`
- auth rate limiting

### Testing and Tooling

- Vitest
- Supertest
- Swagger / OpenAPI generation scripts
- generated API testcase scaffolding

## Architecture

Backend structure:

```text
routes -> controllers -> services -> models
```

Responsibilities:
- routes define endpoints and middleware
- controllers handle HTTP input/output
- services implement business logic
- models define MongoDB schemas

## Main Flows

### Order Flow

1. Customer adds items to cart.
2. Customer selects cart items and creates an order.
3. Backend snapshots price and quantity into the order.
4. Customer either pays with VNPay or leaves the order unpaid.
5. Successful VNPay callback marks the order as `paid` and `confirmed`.

### VNPay Return Flow

1. Frontend requests order creation.
2. Backend creates the VNPay payment URL.
3. VNPay redirects the customer to the backend `VNPAY_RETURN_URL`.
4. Backend processes the callback and redirects to the frontend `/order` page.

Important:
- `VNPAY_RETURN_URL` must point to the backend route, not the frontend
- `FRONTEND_URL` must point to the frontend app

## Repository Layout

```text
.
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ scripts/
│  │  └─ services/
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  └─ utils/
└─ screenshots/
```

## Environment Variables

### Backend

Create `backend/.env` and configure at least:

```env
MONGODB_URI=
DB_NAME=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_USERNAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=

VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=
FRONTEND_URL=
```

### Frontend

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_API_BASE=
```

Examples:
- local frontend `VITE_API_BASE=http://localhost:3000`
- local backend return URL `VNPAY_RETURN_URL=http://localhost:3000/api/orders/vnpay/return`
- local frontend URL `FRONTEND_URL=http://localhost:5173`

## Local Development

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment files

- create `backend/.env`
- create `frontend/.env`

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

## Useful Scripts

### Backend

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run test
npm run seed
npm run docs
npm run gen_testcases
npm run clean_tokens
```

Optional one-time utility:

```bash
npm run convert_prices_vnd
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Deployment Notes

- frontend and backend can be deployed separately
- if using VNPay, ensure the return URL points to the deployed backend
- if using Render free tier, expect occasional cold starts

## Future Improvements

- admin order management workflow beyond customer cancellation
- stronger payment logging and observability
- inventory and stock enforcement
- email notifications
- richer analytics dashboard

## Author

Built by [hetoke](https://github.com/hetoke)
