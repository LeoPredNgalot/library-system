//
//
//
const { pool } = require(`../../DB/pool`);
const { assignCopyToReservation } = require(
  `../reservationServiceFolder/reservation.create.service`,
);

async function addBookCopyId(bookId, bookCopyIds) {
  if (!bookCopyIds) return;

  const query = `INSERT INTO book_copies SET ?`;

  for (const copyId of bookCopyIds) {
    try {
      const data = { book_id: bookId, copy_id: copyId };
      await pool.query(query, data);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // ✅ throw instead of silently pushing to failed array
        // This ensures the controller gets the error and returns 400
        const err = new Error(`Copy ID "${copyId}" already exists. Please use a unique copy ID.`);
        err.errorCode = "DUPLICATE_COPY_ID";
        throw err;
      } else {
        throw error;
      }
    }
  }

  // After adding copies, try assigning reservations
  // (because multiple waiting reservations may exist)
  for (let i = 0; i < bookCopyIds.length; i++) {
    await assignCopyToReservation(bookId);
  }
}

module.exports = { addBookCopyId };