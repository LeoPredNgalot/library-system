//
//
//

const { pool } = require(`../../DB/pool`);

async function checkStudentId(studentId) {
  //
  //
  const query = `SELECT 1 FROM students
    WHERE student_id = ? LIMIT 1 `;

  const [rows] = await pool.query(query, [studentId]);

  if (rows.length > 0) {
    return true;
  } else {
    return false;
  }
}
//
//
async function checkBookCopyId(bookCopyId) {
  try {
    const query = `SELECT 1 FROM book_copies 
    WHERE copy_id = ? LIMIT 1`;

    const [rows] = await pool.query(query, [bookCopyId]);

    if (rows.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`ERROR CHECKING BOOK COPY ID: ${error.message}`);
    throw error;
  }
}

async function checkBookAvailability(bookCopyId) {
  try {
    const query = `
    SELECT 1
    FROM book_copies WHERE copy_id = ?
    AND available = true LIMIT 1`;

    const [rows] = await pool.query(query, [bookCopyId]);

    if (rows.length === 1) {
      return { available: true };
    }
    return { available: false };
  } catch (error) {
    console.log(`ERROR CHECKING BOOK AVAILABILITY: ${error.message}`);

    throw error;
  }
}

async function getAllBorrowRecords() {
  const sql = `
  SELECT
   br.id             AS borrowId, 
    b.title           AS bookTitle,
    bc.copy_id        AS copyID,
    s.first_name      AS fName,
    s.last_name       AS lName,
    s.grade           AS grade,
    s.section         AS section,

    br.borrow_date    AS borrowDate,
    br.due_date       AS dueDate,
    br.return_date    AS returnDate,

    br.status         AS borrowStatus,
    br.fine_amount    AS fineAmount,
    br.payment_status AS paymentStatus

  FROM borrow_records br
  INNER JOIN students s
    ON br.student_id = s.student_id
  INNER JOIN book_copies bc
    ON br.copy_id = bc.copy_id
  INNER JOIN books b
    ON bc.book_id = b.id
  ORDER BY br.borrow_date DESC
`;

  const [rows] = await pool.execute(sql);
  return rows;
}

async function getBorrowRecordsPage(filters) {
  const {
    q = "",
    view = "", // borrowed | returned | lost | damaged | overdue
    payment = "", // SETTLED | UNSETTLED | ""
    grade = "", // 11 | 12 | ""
    section = "", // Mercury, Venus, etc.
    page = 1,
    pageSize = 10,
  } = filters;

  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safePageSize = 10;
  const offset = (safePage - 1) * safePageSize;

  const where = [];
  const params = [];

  // --------------------------
  // VIEW FILTER
  // --------------------------
  if (view === "borrowed") {
    where.push(`br.status = 'BORROWED'`);
  }

  if (view === "returned") {
    where.push(`br.status = 'RETURNED'`);
  }

  if (view === "lost") {
    where.push(`br.status = 'LOST'`);
  }

  if (view === "damaged") {
    where.push(`br.status = 'DAMAGED'`);
  }

  if (view === "overdue") {
    where.push(`br.status = 'BORROWED' AND br.due_date < NOW()`);
  }

  // --------------------------
  // PAYMENT FILTER
  // --------------------------
  if (payment === "UNSETTLED" || payment === "SETTLED") {
    where.push(`br.payment_status = ?`);
    params.push(payment);
  }

  // --------------------------
  // GRADE FILTER
  // --------------------------
  if (grade === "11" || grade === "12") {
    where.push(`s.grade = ?`);
    params.push(grade);
  }

  // --------------------------
  // SECTION FILTER
  // --------------------------
  if (section) {
    where.push(`s.section = ?`);
    params.push(section);
  }

  // --------------------------
  // SEARCH FILTER
  // --------------------------
  const trimmed = String(q || "").trim();
  if (trimmed.length > 0) {
    where.push(`
    (
      b.title LIKE ?
      OR bc.copy_id LIKE ?
      OR br.student_id LIKE ?
      OR s.first_name LIKE ?
      OR s.last_name LIKE ?
      OR CONCAT(s.first_name, ' ', s.last_name) LIKE ?
    )
  `);

    const like = `%${trimmed}%`;
    params.push(like, like, like, like, like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*) AS total
    FROM borrow_records br
    INNER JOIN students s ON br.student_id = s.student_id
    INNER JOIN book_copies bc ON br.copy_id = bc.copy_id
    INNER JOIN books b ON bc.book_id = b.id
    ${whereSql}
  `;

  const [[countRow]] = await pool.query(countSql, params);
  const total = Number(countRow?.total || 0);
  const totalPages = Math.max(Math.ceil(total / safePageSize), 1);

  const dataSql = `
    SELECT
      br.id             AS borrowId,
      b.title           AS bookTitle,
      bc.copy_id        AS copyID,
      s.first_name      AS fName,
      s.last_name       AS lName,
      s.grade           AS grade,
      s.section         AS section,

      br.borrow_date    AS borrowDate,
      br.due_date       AS dueDate,
      br.return_date    AS returnDate,

      br.status         AS borrowStatus,
      br.fine_amount    AS fineAmount,
      br.payment_status AS paymentStatus
    FROM borrow_records br
    INNER JOIN students s ON br.student_id = s.student_id
    INNER JOIN book_copies bc ON br.copy_id = bc.copy_id
    INNER JOIN books b ON bc.book_id = b.id
    ${whereSql}
    ORDER BY br.borrow_date DESC
    LIMIT ? OFFSET ?
  `;

  const dataParams = [...params, safePageSize, offset];
  const [rows] = await pool.query(dataSql, dataParams);

  return {
    rows,
    pagination: {
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages,
    },
  };
}
module.exports = {
  checkStudentId,
  checkBookCopyId,
  checkBookAvailability,
  getAllBorrowRecords,
  getBorrowRecordsPage,
};
