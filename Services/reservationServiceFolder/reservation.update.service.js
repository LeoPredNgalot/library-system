//
//
//

const { pool } = require(`../../DB/pool`);

const { assignCopyToReservation } = require(`./reservation.create.service`);

async function fulfillReservationService(reservationId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get reservation + the real copy_id string
    const [rows] = await connection.execute(
      `
      SELECT 
        r.student_id,
        r.book_copy_id,
        bc.copy_id AS real_copy_id
      FROM reservations r
      INNER JOIN book_copies bc
        ON r.book_copy_id = bc.id
      WHERE r.reservation_id = ?
        AND r.status = 'pending'
        AND r.is_active = 1
      `,
      [reservationId],
    );

    if (rows.length === 0) {
      throw new Error(
        "Reservation not found, not pending, or has no assigned copy.",
      );
    }

    const studentId = rows[0].student_id;
    const copyIdString = rows[0].real_copy_id;
    const copyIdInt = rows[0].book_copy_id;

    // 2. Insert into borrow_records
    await connection.execute(
      `
  INSERT INTO borrow_records (student_id, copy_id, borrow_date, due_date)
  VALUES (
    ?, 
    ?,
    CURDATE(),
    CASE
      WHEN DAYOFWEEK(DATE_ADD(NOW(), INTERVAL 3 DAY)) = 7 THEN DATE_ADD(NOW(), INTERVAL 5 DAY)
      WHEN DAYOFWEEK(DATE_ADD(NOW(), INTERVAL 3 DAY)) = 1 THEN DATE_ADD(NOW(), INTERVAL 4 DAY)
      ELSE DATE_ADD(NOW(), INTERVAL 3 DAY)
    END
  )
  `,
      [studentId, copyIdString],
    );

    // 3. Update book_copies: reserved -> borrowed
    await connection.execute(
      `
      UPDATE book_copies
      SET reserved = FALSE,
          borrowed = TRUE,
          available = FALSE
      WHERE id = ?
      `,
      [copyIdInt],
    );

    // 4. Mark reservation fulfilled
    await connection.execute(
      `
      UPDATE reservations
      SET status = 'fulfilled',
          is_active = 0,
          fulfilled_date = NOW()
      WHERE reservation_id = ?
      `,
      [reservationId],
    );

    await connection.commit();
    return { message: "Reservation fulfilled successfully." };
  } catch (error) {
    await connection.rollback();
    console.error("FULFILL RESERVATION SERVICE ERROR:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelReservationService(reservationId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // get book_id before cancelling
    const [rows] = await connection.execute(
      `SELECT book_id FROM reservations WHERE reservation_id = ?`,
      [reservationId],
    );

    if (rows.length === 0) {
      throw new Error("Reservation not found.");
    }

    const bookId = rows[0].book_id;

    // cancel reservation (trigger will free the copy)
    await connection.execute(
      `
      UPDATE reservations
      SET status = 'cancelled'
      WHERE reservation_id = ?
      `,
      [reservationId],
    );

    // now assign freed copy to next waiting reservation
    await connection.execute(`CALL assign_copy_to_oldest_reservation(?)`, [
      bookId,
    ]);

    await connection.commit();
    return { message: "Reservation cancelled successfully." };
  } catch (error) {
    await connection.rollback();
    console.error("CANCEL RESERVATION SERVICE ERROR:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// ✅ ADDED: Permanently delete a fulfilled/expired/cancelled reservation record
async function removeReservationService(reservationId) {
  try {
    const [result] = await pool.execute(
      `DELETE FROM reservations WHERE reservation_id = ? AND status IN ('fulfilled', 'expired', 'cancelled')`,
      [reservationId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Reservation not found or cannot be removed. Only fulfilled, expired, or cancelled reservations can be removed.");
    }

    return { message: "Reservation removed successfully." };
  } catch (error) {
    console.error("REMOVE RESERVATION SERVICE ERROR:", error.message);
    throw error;
  }
}

module.exports = {
  cancelReservationService,
  fulfillReservationService,
  removeReservationService,
};
