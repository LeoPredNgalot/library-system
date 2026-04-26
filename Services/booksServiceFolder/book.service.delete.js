const { pool } = require(`../../DB/pool`);

async function deleteBookFromDb(book) {
  const query = "DELETE FROM books WHERE id = ?";
  const [result] = await pool.query(query, [book.id]);
}

async function removeCopies(copiesToBeRemoved, bookId) {
  for (const bookCopy of copiesToBeRemoved) {

    const [borrowRows] = await pool.query(
      `SELECT id FROM borrow_records WHERE copy_id = ? AND status NOT IN ('RETURNED', 'LOST')`,
      [bookCopy]
    );
    if (borrowRows.length > 0) {
      const err = new Error(`Copy "${bookCopy}" has an active borrow record.`);
      err.errorCode = "COPY_HAS_BORROW_RECORD";
      throw err;
    }

    const [reserveRows] = await pool.query(
      `SELECT id FROM reservations WHERE copy_id = ? AND status NOT IN ('CANCELLED', 'COMPLETED')`,
      [bookCopy]
    );
    if (reserveRows.length > 0) {
      const err = new Error(`Copy "${bookCopy}" has an active reservation.`);
      err.errorCode = "COPY_HAS_RESERVATION";
      throw err;
    }

    await pool.query(`DELETE FROM book_copies WHERE copy_id = ?`, [bookCopy]);
  }
}

module.exports = {
  removeCopies,
  deleteBookFromDb,
};