// Routes/reportRoute.js

const express = require(`express`);
const router  = express.Router();

const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);

const reportController = require(`../Controllers/reportController`);

// Full page render (initial load)
router.get(`/inventory`,      reportController.sendInventoryReportPage);

// ── NEW: AJAX JSON endpoint for filter/paginate updates ──
router.get(`/inventory/data`, reportController.getInventoryReportData);

router.get(`/dashboard`,      reportController.sendDashboardPage);

module.exports = router;