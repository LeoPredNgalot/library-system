//
//
//
const { pool } = require("../../DB/pool");

/**
 * Resyncs all counter columns on the books table for a given bookId.
 * Call this after any operation that adds, removes, borrows, returns,
 * marks lost, or marks damaged a book copy.
 */
async function syncBookCounts(bookId) {
  await pool.query(
    `UPDATE books
     SET
       total_copies    = (SELECT COUNT(*)                              FROM book_copies WHERE book_id = ?),
       available_count = (SELECT COUNT(*) FROM book_copies WHERE book_id = ? AND available = 1 AND lost = 0 AND damaged = 0 AND borrowed = 0),
       borrowed_count  = (SELECT COUNT(*) FROM book_copies WHERE book_id = ? AND borrowed = 1),
       lost_count      = (SELECT COUNT(*) FROM book_copies WHERE book_id = ? AND lost = 1),
       damaged_count   = (SELECT COUNT(*) FROM book_copies WHERE book_id = ? AND damaged = 1)
     WHERE id = ?`,
    [bookId, bookId, bookId, bookId, bookId, bookId]
  );
}

module.exports = { syncBookCounts };
