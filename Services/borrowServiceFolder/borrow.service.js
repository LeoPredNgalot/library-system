//
//
//
const { pool } = require(`../../DB/pool`);
const { syncBookCounts } = require(`../booksServiceFolder/book.sync`);

async function borrowServiceFunction(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const studentId  = payload.studentId;
    const bookCopyId = payload.bookCopyId;
    const dueDate    = payload.dueDate;

    // 1. Check student exists
    const [studentRows] = await connection.query(
      `SELECT 1 FROM students WHERE student_id = ? LIMIT 1`,
      [studentId],
    );
    if (studentRows.length === 0) {
      await connection.rollback();
      connection.release();
      return { success: false, message: `Student ID does not exist` };
    }

    // 2. Check copy exists
    const [copyRows] = await connection.query(
      `SELECT available, borrowed, lost, damaged FROM book_copies WHERE copy_id = ? LIMIT 1`,
      [bookCopyId],
    );
    if (copyRows.length === 0) {
      await connection.rollback();
      connection.release();
      return { success: false, message: `Book Copy ID does not exist` };
    }

    const copy = copyRows[0];

    // 3. Get book_id for duplicate borrow check and sync
    const [bookRows] = await connection.query(
      `SELECT book_id FROM book_copies WHERE copy_id = ? LIMIT 1`,
      [bookCopyId],
    );
    const bookId = bookRows[0].book_id;

    // 4. Check if student already borrowing same book
    const [activeSameBookBorrow] = await connection.query(
      `SELECT 1
       FROM borrow_records br
       INNER JOIN book_copies bc ON br.copy_id = bc.copy_id
       WHERE br.student_id = ? AND br.status = 'BORROWED' AND bc.book_id = ?
       LIMIT 1`,
      [studentId, bookId],
    );
    if (activeSameBookBorrow.length > 0) {
      await connection.rollback();
      connection.release();
      return { success: false, message: `Student is already borrowing this book.` };
    }

    // 5. Availability check
    if (copy.available !== 1 || copy.borrowed !== 0 || copy.lost !== 0 || copy.damaged !== 0) {
      await connection.rollback();
      connection.release();
      return { success: false, message: `Book Copy is not available` };
    }

    // 6. Insert borrow record
    await connection.query(
      `INSERT INTO borrow_records (student_id, copy_id, borrow_date, due_date)
       VALUES (?, ?, CURDATE(), ?)`,
      [studentId, bookCopyId, dueDate],
    );

    // 7. Mark copy as borrowed
    await connection.query(
      `UPDATE book_copies SET borrowed = 1, available = 0 WHERE copy_id = ?`,
      [bookCopyId],
    );

    await connection.commit();
    connection.release();

    // 8. Sync book counters AFTER commit
    await syncBookCounts(bookId);

    return { success: true, message: `Book borrow success!` };

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.log(`BORROW SERVICE ERROR: ${error.message}`);
    throw error;
  }
}

module.exports = { borrowServiceFunction };
