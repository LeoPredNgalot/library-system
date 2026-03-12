//
//
//

const { pool } = require(`../../DB/pool`);

async function getAllBooksWithZeroAvailableCount() {
  const query = `SELECT id, title FROM books WHERE available_count = 0`;
  const [result] = await pool.query(query);
  return result;
}

async function checkIfStudentIdExist(payload) {
  const studentId = payload.studentId;
  const query = `SELECT EXISTS
  (SELECT 1 FROM students WHERE student_id = ?) AS existing_studentId`;
  const [result] = await pool.query(query, [studentId]);
  return result[0].existing_studentId === 1;
}

async function checkIfStudentAlreadyReservedBook(payload) {
  const { studentId, bookId } = payload;
  const query = `SELECT EXISTS
  (SELECT 1 FROM reservations WHERE student_id = ? AND book_id = ? AND is_active = 1) AS existing_reservation`;
  const [result] = await pool.query(query, [studentId, bookId]);
  return result[0].existing_reservation === 1;
}

async function checkIfStudentAlreadyBorrowedTheBook(payload) {
  const { studentId, bookId } = payload;
  const query = `
    SELECT EXISTS (
      SELECT 1
      FROM borrow_records br
      INNER JOIN book_copies bc ON br.copy_id = bc.copy_id
      WHERE br.student_id = ?
        AND bc.book_id = ?
        AND br.status = 'BORROWED'
    ) AS existing_borrow
  `;
  const [result] = await pool.query(query, [studentId, bookId]);
  return result[0].existing_borrow === 1;
}

// NEW: blocks reservation if the book still has available copies
async function checkIfBookHasAvailableCopies(bookId) {
  const query = `SELECT available_count FROM books WHERE id = ? LIMIT 1`;
  const [result] = await pool.query(query, [bookId]);
  if (result.length === 0) return false;
  return result[0].available_count > 0;
}

async function getAllReservationsDetails() {
  const query = `
    SELECT
      r.reservation_id AS reservation_id,
      b.title AS bookTitle,
      s.student_id AS studentID,
      CONCAT(s.first_name, ' ', s.last_name) AS studentName,
      bc.copy_id AS copyID,
      r.status AS status,
      r.reservation_date AS reserved_date,
      r.expiration_date AS expire_date
    FROM reservations r
    INNER JOIN students s ON r.student_id = s.student_id
    INNER JOIN books b ON r.book_id = b.id
    LEFT JOIN book_copies bc ON r.book_copy_id = bc.id
    ORDER BY r.reservation_date DESC;
  `;
  const [rows] = await pool.query(query);
  return rows;
}

async function getReservationsPage({ page = 1, pageSize = 10, search = "", status = "" } = {}) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const values = [];
  const countValues = [];

  if (search) {
    conditions.push(`(s.student_id LIKE ? OR CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR b.title LIKE ?)`);
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    countValues.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push(`r.status = ?`);
    values.push(status);
    countValues.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const dataQuery = `
    SELECT
      r.reservation_id AS reservation_id,
      b.title AS bookTitle,
      s.student_id AS studentID,
      CONCAT(s.first_name, ' ', s.last_name) AS studentName,
      bc.copy_id AS copyID,
      r.status AS status,
      r.reservation_date AS reserved_date,
      r.expiration_date AS expire_date
    FROM reservations r
    INNER JOIN students s ON r.student_id = s.student_id
    INNER JOIN books b ON r.book_id = b.id
    LEFT JOIN book_copies bc ON r.book_copy_id = bc.id
    ${whereClause}
    ORDER BY r.reservation_date DESC
    LIMIT ? OFFSET ?
  `;
  values.push(pageSize, offset);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM reservations r
    INNER JOIN students s
      ON r.student_id = s.student_id
    INNER JOIN books b
      ON r.book_id = b.id
    LEFT JOIN book_copies bc
      ON r.book_copy_id = bc.id
    ${whereClause}
  `;

  const [rows] = await pool.query(dataQuery, values);
  const [countRows] = await pool.query(countQuery, countValues);

  const total = countRows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      pageSize,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  };
}

module.exports = {
  checkIfStudentIdExist,
  checkIfStudentAlreadyReservedBook,
  checkIfStudentAlreadyBorrowedTheBook,
  checkIfBookHasAvailableCopies,
  getAllBooksWithZeroAvailableCount,
  getAllReservationsDetails,
  getReservationsPage,
};