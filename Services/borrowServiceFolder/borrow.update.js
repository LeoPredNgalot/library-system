//
//
//

const { pool } = require(`../../DB/pool`);

const { assignCopyToReservation } = require(
  `../reservationServiceFolder/reservation.create.service`,
);

const { removeRecordFromBorrowsTable } = require(
  `../borrowServiceFolder/borrow.remove`,
);

const { syncBookCounts } = require(`../booksServiceFolder/book.sync`);

async function markBookCopyAsBorrowed(bookCopyId) {
  try {
    await pool.query(`UPDATE book_copies SET borrowed = true, available = false WHERE copy_id = ?`, [bookCopyId]);
  } catch (error) {
    console.log(`ERROR MARKING BOOK AS BORROWED: ${error.message}`);
    throw error;
  }
}

async function markBookCopyAsLostServiceFunction(bookCopyId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [borrowResult] = await connection.query(
      `UPDATE borrow_records
       SET status = 'LOST', return_date = NOW(), fine_amount = 500, payment_status = 'UNSETTLED'
       WHERE copy_id = ? AND status = 'BORROWED'`,
      [bookCopyId],
    );
    if (borrowResult.affectedRows === 0) {
      throw new Error(`No active BORROWED record found for copy_id: ${bookCopyId}`);
    }

    const [copyResult] = await connection.query(
      `UPDATE book_copies SET lost = true, available = false WHERE copy_id = ?`,
      [bookCopyId],
    );
    if (copyResult.affectedRows === 0) {
      throw new Error(`Book copy not found: ${bookCopyId}`);
    }

    const [[copy]] = await connection.query(`SELECT book_id FROM book_copies WHERE copy_id = ?`, [bookCopyId]);
    const bookId = copy.book_id;

    await connection.commit();
    connection.release();

    await syncBookCounts(bookId);
    return { success: true, message: `Book marked as LOST successfully.` };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function markBookCopyAsDamagedServiceFunction(bookCopyId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [borrowResult] = await connection.query(
      `UPDATE borrow_records
       SET status = 'DAMAGED', return_date = NOW(), fine_amount = 200, payment_status = 'UNSETTLED'
       WHERE copy_id = ? AND status = 'BORROWED'`,
      [bookCopyId],
    );
    if (borrowResult.affectedRows === 0) {
      throw new Error(`No active BORROWED record found for copy_id: ${bookCopyId}`);
    }

    const [copyResult] = await connection.query(
      `UPDATE book_copies SET damaged = true, available = false WHERE copy_id = ?`,
      [bookCopyId],
    );
    if (copyResult.affectedRows === 0) {
      throw new Error(`Book copy not found: ${bookCopyId}`);
    }

    const [[copy]] = await connection.query(`SELECT book_id FROM book_copies WHERE copy_id = ?`, [bookCopyId]);
    const bookId = copy.book_id;

    await connection.commit();
    connection.release();

    await syncBookCounts(bookId);
    return { success: true, message: `Book marked as DAMAGED successfully.` };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

async function markBookCopyAsReturned(bookCopyId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Close borrow record as RETURNED
    const [borrowResult] = await connection.query(
      `UPDATE borrow_records
       SET status = 'RETURNED', return_date = NOW()
       WHERE copy_id = ? AND status = 'BORROWED'`,
      [bookCopyId],
    );
    if (borrowResult.affectedRows === 0) {
      throw new Error(`No active BORROWED record found for copy_id: ${bookCopyId}`);
    }

    // 2. Mark copy as available again
    const [copyResult] = await connection.query(
      `UPDATE book_copies SET borrowed = false, available = true WHERE copy_id = ?`,
      [bookCopyId],
    );
    if (copyResult.affectedRows === 0) {
      throw new Error(`Book copy not found: ${bookCopyId}`);
    }

    // 3. Get book_id
    const [[copy]] = await connection.query(`SELECT book_id FROM book_copies WHERE copy_id = ?`, [bookCopyId]);
    const bookId = copy.book_id;

    await connection.commit();
    connection.release();

    // 4. Sync counters and assign to any waiting reservation
    await syncBookCounts(bookId);
    await assignCopyToReservation(bookId);

  } catch (error) {
    await connection.rollback();
    connection.release();
    console.log(`ERROR MARKING BOOK AS RETURNED: ${error.message}`);
    throw error;
  }
}

async function settleBorrowPaymentService(borrowId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE borrow_records
       SET payment_status = 'SETTLED'
       WHERE id = ? AND payment_status = 'UNSETTLED' AND status IN ('LOST', 'DAMAGED')`,
      [borrowId],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      connection.release();
      return { success: false, message: `No UNSETTLED LOST/DAMAGED record found for that ID.` };
    }

    await connection.commit();
    connection.release();
    return { success: true, message: `Payment settled successfully.` };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.log(`SETTLE PAYMENT ERROR: ${error.message}`);
    throw error;
  }
}

module.exports = {
  markBookCopyAsBorrowed,
  markBookCopyAsReturned,
  markBookCopyAsLostServiceFunction,
  markBookCopyAsDamagedServiceFunction,
  settleBorrowPaymentService,
};
