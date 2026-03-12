//
// Services/reportServiceFolder/reportService.js
//

const { pool } = require(`../../DB/pool`);

async function getInventoryReportData(options = {}) {
  try {
    const page = Number(options.page) > 0 ? Number(options.page) : 1;
    const limit = Number(options.limit) > 0 ? Number(options.limit) : 10;
    const search = (options.search || "").trim();
    const genre = (options.genre || "").trim();

    const whereClauses = [];
    const queryParams = [];

    if (search) {
      whereClauses.push(`
        (
          title LIKE ?
          OR author LIKE ?
          OR isbn LIKE ?
        )
      `);

      const likeValue = `%${search}%`;
      queryParams.push(likeValue, likeValue, likeValue);
    }

    if (genre) {
      whereClauses.push(`genre = ?`);
      queryParams.push(genre);
    }

    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // -----------------------------
    // SUMMARY (whole library)
    // -----------------------------
    const summaryQuery = `
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(total_copies), 0) AS total_copies,
        COALESCE(SUM(available_count), 0) AS total_available,
        COALESCE(SUM(borrowed_count), 0) AS total_borrowed,
        COALESCE(SUM(lost_count), 0) AS total_lost,
        COALESCE(SUM(damaged_count), 0) AS total_damaged
      FROM books
    `;

    // -----------------------------
    // GENRE OPTIONS
    // -----------------------------
    const genresQuery = `
      SELECT DISTINCT genre
      FROM books
      WHERE genre IS NOT NULL
        AND TRIM(genre) <> ''
      ORDER BY genre ASC
    `;

    // -----------------------------
    // COUNT FILTERED BOOKS
    // -----------------------------
    const countQuery = `
      SELECT COUNT(*) AS total_books
      FROM books
      ${whereSql}
    `;

    const [summaryRows] = await pool.query(summaryQuery);
    const [genreRows] = await pool.query(genresQuery);
    const [countRows] = await pool.query(countQuery, queryParams);

    const totalBooks = countRows[0].total_books;
    const totalPages = Math.max(1, Math.ceil(totalBooks / limit));

    const safePage = page > totalPages ? totalPages : page;
    const offset = (safePage - 1) * limit;

    // -----------------------------
    // BOOK ROWS WITH PAGINATION
    // -----------------------------
    const booksQuery = `
      SELECT
        id,
        title,
        author,
        genre,
        year_published,
        total_copies,
        available_count,
        borrowed_count,
        lost_count,
        damaged_count,
        book_location,
        isbn,
        publisher,
        book_photo_file_path,
        date_added
      FROM books
      ${whereSql}
      ORDER BY title ASC
      LIMIT ? OFFSET ?
    `;

    const [bookRows] = await pool.query(booksQuery, [
      ...queryParams,
      limit,
      offset,
    ]);

    return {
      summary: summaryRows[0],
      books: bookRows,
      genres: genreRows.map((row) => row.genre),
      filters: {
        search,
        genre,
      },
      pagination: {
        page: safePage,
        limit,
        totalBooks,
        totalPages,
        hasPrev: safePage > 1,
        hasNext: safePage < totalPages,
        prevPage: safePage - 1,
        nextPage: safePage + 1,
      },
    };
  } catch (error) {
    console.log(`REPORT SERVICE: getInventoryReportData ERROR`);
    console.log(error.message);
    throw error;
  }
}

async function getDashboardData() {
  try {
    // =============================
    // INVENTORY SUMMARY
    // =============================
    const inventorySummaryQuery = `
      SELECT
        COUNT(*) AS total_titles,
        COALESCE(SUM(total_copies), 0) AS total_copies,
        COALESCE(SUM(available_count), 0) AS total_available,
        COALESCE(SUM(borrowed_count), 0) AS total_borrowed,
        COALESCE(SUM(lost_count), 0) AS total_lost,
        COALESCE(SUM(damaged_count), 0) AS total_damaged
      FROM books
    `;

    // =============================
    // BORROW ACTIVITY
    // =============================
    const borrowActivityQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN DATE(borrow_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS borrowed_today,

        COALESCE(SUM(CASE WHEN return_date IS NOT NULL AND DATE(return_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS returned_today,

        COALESCE(SUM(CASE WHEN status = 'BORROWED' AND due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdue_books,

        COALESCE(SUM(CASE WHEN payment_status = 'UNSETTLED' THEN 1 ELSE 0 END), 0) AS unsettled_payments
      FROM borrow_records
    `;

    // =============================
    // RESERVATION SUMMARY
    // =============================
    const reservationSummaryQuery = `
  SELECT
    COALESCE(SUM(CASE WHEN DATE(reservation_date) = CURDATE() THEN 1 ELSE 0 END), 0) AS reservations_today,

    COALESCE(SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END), 0) AS active_reservations,

    COALESCE(SUM(CASE WHEN status = 'waiting' AND is_active = 1 THEN 1 ELSE 0 END), 0) AS waiting_reservations,

    COALESCE(SUM(CASE WHEN status = 'pending' AND is_active = 1 THEN 1 ELSE 0 END), 0) AS pending_reservations,

    COALESCE(SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END), 0) AS expired_reservations
  FROM reservations
`;

    const [inventoryRows] = await pool.query(inventorySummaryQuery);
    const [borrowRows] = await pool.query(borrowActivityQuery);
    const [reservationRows] = await pool.query(reservationSummaryQuery);

    return {
      inventory: inventoryRows[0],
      borrowActivity: borrowRows[0],
      reservations: reservationRows[0],
    };
  } catch (error) {
    console.log(`REPORT SERVICE: getDashboardData ERROR`);
    console.log(error.message);
    throw error;
  }
}

module.exports = {
  getInventoryReportData,
  getDashboardData,
};
