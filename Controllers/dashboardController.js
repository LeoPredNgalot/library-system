const { getDashboardStats, getRecentTransactions } = require(
  '../Services/dashboardServiceFolder/dashboard.service'
);

async function dashboardStats(req, res) {
  try {
    const stats = await getDashboardStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('DASHBOARD STATS ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function recentTransactions(req, res) {
  try {
    const transactions = await getRecentTransactions(8);
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('RECENT TRANSACTIONS ERROR:', error.message);
    res.status(500).json({ success: false, transactions: [] });
  }
}

module.exports = { dashboardStats, recentTransactions };



