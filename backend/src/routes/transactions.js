const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats,
} = require('../controllers/transactions');

// Get all transactions
router.get('/', getTransactions);

// Get dashboard stats
router.get('/stats', getDashboardStats);

// Add a new transaction
router.post('/', addTransaction);

// Update a transaction
router.put('/:id', updateTransaction);

// Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router; 