# 💰 FINVERSE Backend (Express + MongoDB)

This is a backend project that mimics the core features of **A payment application**.  
Built with **Express.js**, **MongoDB**, and **Zod** for validation, it provides APIs for:  
- 🔐 User **authentication & authorization**  
- 🔎 Searching users  
- 💸 Sending & receiving **transactions**  
- ✅ Secure validation  

---

## 🚀 Features

- **User Authentication & Authorization**  
  - Secure sign-up & login  
  - JWT-based authentication  
  - Role-based access *(if implemented)*  

- **User Search**  
  - Search users by name, email, or phone number  

- **Transactions**  
  - Transfer money between users  
  - View balance & transaction history  

- **Validation**  
  - Strong schema validation using **Zod**  

---

## 🛠️ Tech Stack
- **Backend Framework**: Express.js  
- **Database**: MongoDB (Mongoose ODM)  
- **Validation**: Zod  
- **Authentication**: JWT + bcrypt  

---

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd FINVERSE-backend


Install dependencies

npm install
SETUP YOUR .env with mongoUrl and SECRET_KEY.
Run the server
npm run dev

📌 API Endpoints


Users
POST /api/v1/users/signup → Create new user

POST /api/v1/users/login → Login & get JWT

PUT /api/v1/users/ → Update user password or firstname/lastname

GET /api/v1/users/bulk → Search other users

- Accounts
GET /api/v1/accounts/balance → Get user balance

POST /api/v1/accounts/transfer → Transfer money from one user to another

## Security
Passwords hashed with bcrypt

JWT used for secure authentication

Input validation with Zod

## Future Improvements
Add support for UPI IDs

Implement notifications

Integrate payment gateway simulation
