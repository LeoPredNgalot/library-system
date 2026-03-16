//
//
//

const { pool } = require("../../DB/pool");

async function expireReservations() {
  try {
    const [expiredReservations] = await pool.query(`
      SELECT reservation_id, book_id, book_copy_id
      FROM reservations
      WHERE status = 'pending'
        AND is_active = 1
        AND expiration_date IS NOT NULL
        AND expiration_date < NOW()
    `);

    if (expiredReservations.length === 0) {
      return;
    }

    for (const reservation of expiredReservations) {
      const reservationId = reservation.reservation_id;
      const bookId = reservation.book_id;
      const bookCopyId = reservation.book_copy_id;

      // Free reserved copy if assigned
      if (bookCopyId !== null) {
        await pool.query(
          `
          UPDATE book_copies
          SET reserved = FALSE,
              available = CASE 
                  WHEN borrowed = FALSE AND lost = FALSE AND damaged = FALSE THEN TRUE
                  ELSE FALSE
              END
          WHERE id = ?
        `,
          [bookCopyId],
        );
      }

      // Mark reservation expired
      await pool.query(
        `
        UPDATE reservations
        SET status = 'expired',
            is_active = 0
        WHERE reservation_id = ?
      `,
        [reservationId],
      );

      // Assign freed copy to next waiting reservation (if any)
      await assignCopyToReservation(bookId);
    }
  } catch (error) {
    console.log(`ERROR EXPIRING RESERVATIONS: ${error.message}`);
    throw error;
  }
}

function startReservationExpirationChecker() {
  setInterval(async () => {
    try {
      await expireReservations();
    } catch (error) {
      console.log(`RESERVATION EXPIRATION CHECK FAILED: ${error.message}`);
    }
  }, 60 * 1000); // every 60 seconds
}

module.exports = { startReservationExpirationChecker };
