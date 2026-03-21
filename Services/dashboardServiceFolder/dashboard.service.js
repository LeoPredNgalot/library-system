//
// Services/dashboardServiceFolder/dashboard.service.js
//

const { pool } = require(`../../DB/pool`);

async function getDashboardStats() {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM books) AS totalBooks,

      (SELECT COUNT(*) FROM borrow_records
       WHERE status = 'BORROWED'
         AND return_date IS NULL
         AND due_date >= CURRENT_DATE) AS borrowed,

      (SELECT COUNT(*) FROM borrow_records
       WHERE status = 'RETURNED') AS returned,

      (SELECT COUNT(*) FROM borrow_records
       WHERE status = 'BORROWED'
         AND return_date IS NULL
         AND due_date < CURRENT_DATE) AS overdue,

      (SELECT COUNT(*) FROM students) AS totalUsers,

      (SELECT COUNT(*) FROM reservations
       WHERE status IN ('WAITING', 'PENDING')) AS reservations
  `;
  const [[row]] = await pool.query(query);
  return row;
}

async function getRecentTransactions() {
  // Latest 5 borrow records
  const borrowSql = `
    SELECT
      'borrow'                                    AS type,
      br.id                                       AS id,
      b.title                                     AS bookTitle,
      CONCAT(s.first_name, ' ', s.last_name)      AS studentName,
      CASE
        WHEN br.status = 'BORROWED'
             AND br.return_date IS NULL
             AND br.due_date < CURRENT_DATE
          THEN 'OVERDUE'
        ELSE br.status
      END                                         AS status,
      br.borrow_date                              AS date
    FROM borrow_records br
    INNER JOIN students s  ON br.student_id = s.student_id
    INNER JOIN book_copies bc ON br.copy_id  = bc.copy_id
    INNER JOIN books b        ON bc.book_id  = b.id
    ORDER BY br.borrow_date DESC
    LIMIT 5
  `;

  // Latest 5 reservations
  const reserveSql = `
    SELECT
      'reservation'                               AS type,
      r.reservation_id                            AS id,
      b.title                                     AS bookTitle,
      CONCAT(s.first_name, ' ', s.last_name)      AS studentName,
      r.status                                    AS status,
      r.reservation_date                          AS date
    FROM reservations r
    INNER JOIN students s ON r.student_id = s.student_id
    INNER JOIN books b    ON r.book_id    = b.id
    ORDER BY r.reservation_date DESC
    LIMIT 5
  `;

  const [[borrows], [reservations]] = await Promise.all([
    pool.query(borrowSql),
    pool.query(reserveSql),
  ]);

  return { borrows, reservations };
}

module.exports = {
  getDashboardStats,
  getRecentTransactions,
};