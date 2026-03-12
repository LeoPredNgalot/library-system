const express = require('express');
const router = express.Router();
const { dashboardStats, recentTransactions } = require('../Controllers/dashboardController');

router.get('/stats', dashboardStats);
router.get('/recent-transactions', recentTransactions);

module.exports = router;
