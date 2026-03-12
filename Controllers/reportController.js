//
// Controllers/reportController.js
//

const { getInventoryReportData, getDashboardData } = require(
  `../Services/reportServiceFolder/reportService`,
);

async function sendInventoryReportPage(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const search = (req.query.search || "").trim();
    const genre = (req.query.genre || "").trim();

    const result = await getInventoryReportData({
      page,
      limit,
      search,
      genre,
    });

    res.render(`reportViews/inventoryReport`, {
      summary: result.summary,
      books: result.books,
      genres: result.genres,
      filters: result.filters,
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
      inventory: result.inventory,
      activity: result.activity,
      recentActivity: result.recentActivity,
    });
  } catch (error) {
    console.log(`REPORT CONTROLLER: sendDashboardPage ERROR`);
    console.log(error.message);
    return res.status(500).send(`Server error loading dashboard page.`);
  }
}

//---------//

async function sendDashboardPage(req, res) {
  try {
    const result = await getDashboardData();

    res.render(`reportViews/dashboard`, {
      inventory: result.inventory,
      borrowActivity: result.borrowActivity,
      reservations: result.reservations,
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
