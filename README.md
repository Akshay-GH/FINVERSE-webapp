# Finverse

Finverse is a MERN-based payments web app with OTP-verified transfers, fraud scoring, and a transaction history dashboard. The backend exposes REST APIs and the frontend is built with React + Vite.

## Features

- User authentication and account management
- Send and receive transfers with OTP verification for riskier activity
- Fraud scoring with audit logs
- Transaction history with filters and status badges
- Responsive UI

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Validation: Zod
- Email: Nodemailer

## Repository Layout

- backend/: Express API, MongoDB models, fraud detection, OTP flow
- frontend/: React + Vite application

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB connection string

### Install

```bash
npm install
npm install --prefix frontend
```

### Environment Variables

Create a .env file in the repository root with the following keys:

```bash
MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
SECRET_KEY=your_jwt_secret

# Brevo SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_login
BREVO_SMTP_KEY=your_brevo_smtp_key
SENDER_EMAIL=no-reply@example.com
SENDER_NAME=Finverse


ADMIN_EMAIL=admin@example.com
PORT=3000
```

Notes:

- Brevo variables are required for OTP emails.
- ADMIN_EMAIL is optional and marks a pre-existing user as admin.
- PORT is optional (defaults to 3000).

### Run in Development

Run the backend and frontend in separate terminals:

Backend:

```bash
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### Build and Run (Production)

```bash
npm run build
npm start
```

The Express server will serve frontend/dist and expose APIs at /api/v1.

## API Highlights

- POST /api/v1/users/signup
- POST /api/v1/users/login
- GET /api/v1/accounts/balance
- POST /api/v1/accounts/transfer
- POST /api/v1/accounts/transfer/verify-otp
- GET /api/v1/transactions/history

## Fraud Detection Summary

Each transfer is scored based on amount, velocity, device trust, time-of-day, and daily limits. Scores >= 40 trigger OTP verification; transactions are logged for auditing and appear in the transaction history view.
