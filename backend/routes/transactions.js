const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardStats
} = require('../controllers/transactions');

// Protect all routes
router.use(protect);

// Transaction routes
router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);
router.route('/stats/dashboard').get(getDashboardStats);

module.exports = router; 