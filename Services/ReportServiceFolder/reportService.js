//
// Services/ReportServiceFolder/reportService.js
//

const { pool } = require(`../../DB/pool`);

async function getInventoryReportData(options = {}) {
  try {
    const page   = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit  = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const search = (options.search || '').trim();
    const genre  = (options.genre  || '').trim();

    // ── Date range filter ──
    // dateRange: 'this_week' | 'this_month' | 'custom'
    // dateFrom / dateTo: YYYY-MM-DD strings (for custom)
    let dateRange = (options.dateRange || '').trim();
    const dateFrom  = (options.dateFrom  || '').trim();
    const dateTo    = (options.dateTo    || '').trim();

    // Fallback: if dateRange is empty but dates are provided, treat as custom
    if (!dateRange && (dateFrom || dateTo)) {
      dateRange = 'custom';
    }

    const whereClauses = [];
    const queryParams  = [];

    if (search) {
      whereClauses.push(`(title LIKE ? OR author LIKE ? OR isbn LIKE ?)`);
      const like = `%${search}%`;
      queryParams.push(like, like, like);
    }

    if (genre) {
      whereClauses.push(`genre = ?`);
      queryParams.push(genre);
    }

    // Date filter — shows books added to the library in the selected period
    if (dateRange === 'this_week') {
      // YEARWEEK with mode 1 = week starts Monday, reliable across all MySQL configs
      whereClauses.push(`YEARWEEK(date_added, 1) = YEARWEEK(CURDATE(), 1)`);
    } else if (dateRange === 'this_month') {
      whereClauses.push(`YEAR(date_added) = YEAR(CURDATE()) AND MONTH(date_added) = MONTH(CURDATE())`);
    } else if (dateRange === 'custom' && dateFrom && dateTo) {
      whereClauses.push(`DATE(date_added) BETWEEN ? AND ?`);
      queryParams.push(dateFrom, dateTo);
    } else if (dateRange === 'custom' && dateFrom) {
      whereClauses.push(`DATE(date_added) >= ?`);
      queryParams.push(dateFrom);
    } else if (dateRange === 'custom' && dateTo) {
      whereClauses.push(`DATE(date_added) <= ?`);
      queryParams.push(dateTo);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    console.log('DEBUG dateRange:', dateRange);
    console.log('DEBUG whereSql:', whereSql);

    // ── Summary (whole library, no filters) ──
    const summaryQuery = `
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(total_copies),    0) AS total_copies,
        COALESCE(SUM(available_count), 0) AS total_available,
        COALESCE(SUM(borrowed_count),  0) AS total_borrowed,
        COALESCE(SUM(lost_count),      0) AS total_lost,
        COALESCE(SUM(damaged_count),   0) AS total_damaged
      FROM books
    `;

    // ── Genre options ──
    const genresQuery = `
      SELECT DISTINCT genre FROM books
      WHERE genre IS NOT NULL AND TRIM(genre) <> ''
      ORDER BY genre ASC
    `;

    // ── Count filtered books ──
    const countQuery = `SELECT COUNT(*) AS total_books FROM books ${whereSql}`;

    const [[summaryRow]]  = await pool.query(summaryQuery);
    const [genreRows]     = await pool.query(genresQuery);
    const [[countRow]]    = await pool.query(countQuery, queryParams);

    const totalBooks = countRow.total_books;
    const totalPages = Math.max(1, Math.ceil(totalBooks / limit));
    const safePage   = page > totalPages ? totalPages : page;
    const offset     = (safePage - 1) * limit;

    // ── Book rows ──
    const booksQuery = `
      SELECT
        id, title, author, genre, year_published,
        total_copies, available_count, borrowed_count,
        lost_count, damaged_count,
        book_location, isbn, publisher,
        book_photo_file_path, date_added
      FROM books
      ${whereSql}
      ORDER BY title ASC
      LIMIT ? OFFSET ?
    `;

    const [bookRows] = await pool.query(booksQuery, [...queryParams, limit, offset]);

    return {
      summary: summaryRow,
      books:   bookRows,
      genres:  genreRows.map(r => r.genre),
      filters: { search, genre, dateRange, dateFrom, dateTo },
      pagination: {
        page:       safePage,
        limit,
        totalBooks,
        totalPages,
        hasPrev:  safePage > 1,
        hasNext:  safePage < totalPages,
        prevPage: safePage - 1,
        nextPage: safePage + 1,
      },
    };
  } catch (error) {
    console.log('REPORT SERVICE: getInventoryReportData ERROR', error.message);
    throw error;
  }
}

async function getDashboardData() {
  try {
    const inventorySummaryQuery = `
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(total_copies),    0) AS total_copies,
        COALESCE(SUM(available_count), 0) AS total_available,
        COALESCE(SUM(borrowed_count),  0) AS total_borrowed,
        COALESCE(SUM(lost_count),      0) AS total_lost,
        COALESCE(SUM(damaged_count),   0) AS total_damaged
      FROM books
    `;
    const borrowActivityQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN DATE(borrow_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS borrowed_today,
        COALESCE(SUM(CASE WHEN return_date IS NOT NULL AND DATE(return_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS returned_today,
        COALESCE(SUM(CASE WHEN status = 'BORROWED' AND due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdue_books,
        COALESCE(SUM(CASE WHEN payment_status = 'UNSETTLED' THEN 1 ELSE 0 END), 0) AS unsettled_payments
      FROM borrow_records
    `;
    const reservationSummaryQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN DATE(reservation_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS reservations_today,
        COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) AS active_reservations,
        COALESCE(SUM(CASE WHEN status = 'waiting' AND is_active = 1 THEN 1 ELSE 0 END), 0) AS waiting_reservations,
        COALESCE(SUM(CASE WHEN status = 'pending' AND is_active = 1 THEN 1 ELSE 0 END), 0) AS pending_reservations,
        COALESCE(SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END), 0) AS expired_reservations
      FROM reservations
    `;
    const [[inventory]]      = await pool.query(inventorySummaryQuery);
    const [[borrowActivity]] = await pool.query(borrowActivityQuery);
    const [[reservations]]   = await pool.query(reservationSummaryQuery);
    return { inventory, borrowActivity, reservations };
  } catch (error) {
    console.log('REPORT SERVICE: getDashboardData ERROR', error.message);
    throw error;
  }
}

module.exports = { getInventoryReportData, getDashboardData };