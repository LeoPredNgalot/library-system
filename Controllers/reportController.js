//
// Controllers/reportController.js
//

const { getInventoryReportData, getDashboardData } = require(
  `../Services/ReportServiceFolder/reportService`,
);

async function sendInventoryReportPage(req, res) {
  try {
    const result = await getInventoryReportData({
      page:      Number(req.query.page) || 1,
      limit:     10,
      search:    (req.query.search    || '').trim(),
      genre:     (req.query.genre     || '').trim(),
      dateRange: (req.query.dateRange || '').trim(), // ← new
      dateFrom:  (req.query.dateFrom  || '').trim(), // ← new
      dateTo:    (req.query.dateTo    || '').trim(),  // ← new
    });

    res.render(`reportViews/inventoryReport`, {
      summary:    result.summary,
      books:      result.books,
      genres:     result.genres,
      filters:    result.filters,
      pagination: result.pagination,
    });
  } catch (error) {
    console.log(`REPORT CONTROLLER: sendInventoryReportPage ERROR`);
    console.log(error.message);
    return res.status(500).send(`Server error loading inventory report page.`);
  }
}

async function sendDashboardPage(req, res) {
  try {
    const result = await getDashboardData();
    res.render(`reportViews/dashboard`, {
      inventory:      result.inventory,
      borrowActivity: result.borrowActivity,
      reservations:   result.reservations,
    });
  } catch (error) {
    console.log(`REPORT CONTROLLER: sendDashboardPage ERROR`);
    console.log(error.message);
    return res.status(500).send(`Server error loading dashboard page.`);
  }
}

module.exports = {
  sendInventoryReportPage,
  sendDashboardPage,
};