const { pool } = require(`../../DB/pool`);

async function getDashboardStats() {
  const [bookRows] = await pool.query(`
    SELECT
      COUNT(*)                             AS totalBooks,
      SUM(available_count)                 AS availableBooks,
      SUM(total_copies - available_count)  AS borrowedBooks
    FROM books
  `);

  const [txnRows] = await pool.query(`
    SELECT
      SUM(CASE WHEN status = 'BORROWED' THEN 1 ELSE 0 END) AS borrowed,
      SUM(CASE WHEN status = 'RETURNED'
               AND MONTH(return_date) = MONTH(CURDATE())
               AND YEAR(return_date)  = YEAR(CURDATE())  THEN 1 ELSE 0 END) AS returned,
      SUM(CASE WHEN status = 'BORROWED' AND due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue
    FROM borrow_records
  `);

  // ✅ correct table: students
  const [userRows] = await pool.query(`
    SELECT COUNT(*) AS totalUsers FROM students
  `);

  // ✅ correct statuses: waiting + pending
  const [resRows] = await pool.query(`
    SELECT COUNT(*) AS reservations
    FROM reservations
    WHERE status IN ('waiting', 'pending')
  `);

  return {
    totalBooks:   Number(bookRows[0].totalBooks   || 0),
    borrowed:     Number(txnRows[0].borrowed      || 0),
    returned:     Number(txnRows[0].returned      || 0),
    overdue:      Number(txnRows[0].overdue       || 0),
    totalUsers:   Number(userRows[0].totalUsers   || 0),
    reservations: Number(resRows[0].reservations  || 0),
  };
}

async function getRecentTransactions(limit = 8) {
  const [rows] = await pool.query(`
    SELECT
      CONCAT(s.first_name, ' ', s.last_name) AS borrowerName,
      b.title                                AS bookTitle,
      br.borrow_date                         AS date,
      br.status
    FROM borrow_records br
    JOIN students    s  ON br.student_id = s.student_id
    JOIN book_copies bc ON br.copy_id    = bc.copy_id
    JOIN books       b  ON bc.book_id    = b.id
    ORDER BY br.borrow_date DESC
    LIMIT ?
  `, [limit]);

  return rows.map(r => ({
    borrowerName: r.borrowerName,
    bookTitle:    r.bookTitle,
    date:         r.date,
    status:       r.status ? r.status.toLowerCase() : 'borrowed',
  }));
}

module.exports = { getDashboardStats, getRecentTransactions };
