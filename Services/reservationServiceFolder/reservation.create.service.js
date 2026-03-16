//
//
//

const { pool } = require(`../../DB/pool`);

async function recordReservation(payload) {
  const { studentId, bookId } = payload;

  const query = `
    INSERT INTO reservations (student_id, book_id)
    VALUES (?, ?)
  `;

  await pool.query(query, [studentId, bookId]);
}

async function assignCopyToReservation(bookId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Find the oldest waiting reservation for this book
    const [reservations] = await conn.query(
      `SELECT reservation_id FROM reservations
       WHERE book_id = ? AND status = 'waiting' AND is_active = 1
       ORDER BY reservation_date ASC
       LIMIT 1`,
      [bookId]
    );

    if (reservations.length === 0) {
      // No waiting reservations — nothing to assign
      await conn.commit();
      return;
    }

    const reservationId = reservations[0].reservation_id;

    // 2. Find an available copy for this book (not borrowed, not reserved, not lost, not damaged)
    const [copies] = await conn.query(
      `SELECT id FROM book_copies
       WHERE book_id = ? AND available = 1 AND lost = 0 AND damaged = 0
       LIMIT 1`,
      [bookId]
    );

    if (copies.length === 0) {
      // No available copies right now — leave reservation as waiting
      await conn.commit();
      return;
    }

    const copyId = copies[0].id;

    // 3. Assign the copy to the reservation and update status to 'pending'
    await conn.query(
      `UPDATE reservations
       SET book_copy_id = ?, status = 'pending', expiration_date = DATE_ADD(NOW(), INTERVAL 3 DAY)
       WHERE reservation_id = ?`,
      [copyId, reservationId]
    );

    // 4. Mark the copy as no longer available
    await conn.query(
      `UPDATE book_copies SET available = 0 WHERE id = ?`,
      [copyId]
    );

    await conn.commit();
    console.log(`Assigned copy id=${copyId} to reservation id=${reservationId}`);

  } catch (error) {
    await conn.rollback();
    console.log(`ERROR ASSIGNING COPY TO RESERVATION: ${error.message}`);
    throw error;
  } finally {
    conn.release();
  }
}

module.exports = {
  recordReservation,
  assignCopyToReservation,
};
