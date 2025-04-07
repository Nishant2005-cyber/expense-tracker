# EXPENSIOO Backend

This is the backend server for the EXPENSIOO expense management application.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expensioo
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Transactions
- GET `/api/transactions` - Get all transactions
- POST `/api/transactions` - Create a new transaction
- GET `/api/transactions/:id` - Get a single transaction
- PUT `/api/transactions/:id` - Update a transaction
- DELETE `/api/transactions/:id` - Delete a transaction

### Users
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt for password hashing 