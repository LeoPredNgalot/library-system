// Controllers/reportController.js

// Alias the service function to avoid naming conflict with the controller function below
const {
  getInventoryReportData: fetchInventoryData,
  getDashboardData,
} = require(`../Services/ReportServiceFolder/reportService`);

// ── Shared helper to parse query params ──
function parseInventoryQuery(query) {
  return {
    page:      Number(query.page)      || 1,
    limit:     10,
    search:    (query.search     || '').trim(),
    genre:     (query.genre      || '').trim(),
    dateRange: (query.dateRange  || '').trim(),
    dateFrom:  (query.dateFrom   || '').trim(),
    dateTo:    (query.dateTo     || '').trim(),
  };
}

// ── Full page render (initial load) ──
async function sendInventoryReportPage(req, res) {
  try {
    const result = await fetchInventoryData(parseInventoryQuery(req.query));
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

// ── AJAX JSON endpoint — returns only data, no HTML ──
async function getInventoryReportData(req, res) {
  try {
    const result = await fetchInventoryData(parseInventoryQuery(req.query));
    return res.json({
      success:    true,
      summary:    result.summary,
      books:      result.books,
      filters:    result.filters,
      pagination: result.pagination,
      // genres omitted — dropdown never needs to update after page load
    });
  } catch (error) {
    console.log(`REPORT CONTROLLER: getInventoryReportData ERROR`);
    console.log(error.message);
    return res.status(500).json({ success: false, message: `Server error.` });
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
  getInventoryReportData,   // ← export the new one
  sendDashboardPage,
};