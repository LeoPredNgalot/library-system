//
//
//
const express = require(`express`);
const router = express.Router();

//****************
// REQUIRE LOGIN
//****************
const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);





const reportController = require(`../Controllers/reportController`);

router.get(`/inventory`, reportController.sendInventoryReportPage);

router.get(`/dashboard`, reportController.sendDashboardPage);

module.exports = router;
