const { pool } = require("../../DB/pool");

async function resetAllReservationsService() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // -----------------------------
    // 1. Check active borrow records
    // -----------------------------
    const [activeBorrowRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE status = 'BORROWED'
      `,
    );

    const activeBorrowCount = activeBorrowRows[0].count;

    if (activeBorrowCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset reservation records because there are still active borrowed books.",
      };
    }

    // -----------------------------
    // 2. Check active reservations
    // -----------------------------
    const [activeReservationRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM reservations
      WHERE is_active = 1
         OR status IN ('waiting', 'pending')
      `,
    );

    const activeReservationCount = activeReservationRows[0].count;

    if (activeReservationCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset reservation records because there are still active reservations in the system.",
      };
    }

    // -----------------------------
    // 3. Check reserved book copies
    // -----------------------------
    const [reservedCopyRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM book_copies
      WHERE reserved = TRUE
      `,
    );

    const reservedCopyCount = reservedCopyRows[0].count;

    if (reservedCopyCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset reservation records because some book copies are still marked as reserved.",
      };
    }

    // -----------------------------
    // 4. Delete all reservation records
    // -----------------------------
    const [deleteResult] = await connection.query(
      `
      DELETE FROM reservations
      `,
    );

    // -----------------------------
    // 5. Reset AUTO_INCREMENT
    // -----------------------------
    await connection.query(`
      ALTER TABLE reservations AUTO_INCREMENT = 1
    `);

    await connection.commit();

    return {
      success: true,
      message: "All reservation records have been reset successfully.",
      deletedRows: deleteResult.affectedRows,
    };
  } catch (error) {
    await connection.rollback();
    console.log("RESET ALL RESERVATIONS SERVICE ERROR:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

//
//
//
//
async function resetAllBorrowRecordsService() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ---------------------------------
    // 1. Check active borrowed records
    // ---------------------------------
    const [activeBorrowRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE status = 'BORROWED'
      `,
    );

    const activeBorrowCount = activeBorrowRows[0].count;

    if (activeBorrowCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset borrow records because there are still active borrowed books.",
      };
    }

    // ---------------------------------
    // 2. Check book copies still marked as borrowed
    // ---------------------------------
    const [borrowedCopyRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM book_copies
      WHERE borrowed = TRUE
      `,
    );

    const borrowedCopyCount = borrowedCopyRows[0].count;

    if (borrowedCopyCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset borrow records because some book copies are still marked as borrowed.",
      };
    }

    // ---------------------------------
    // 3. Check unsettled fines
    // ---------------------------------
    const [unsettledFineRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE payment_status = 'UNSETTLED'
      `,
    );

    const unsettledFineCount = unsettledFineRows[0].count;

    if (unsettledFineCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset borrow records because there are still unsettled fines.",
      };
    }

    // ---------------------------------
    // 4. Delete all borrow records (LOST/DAMAGED records are also deleted)
    // ---------------------------------
    const [deleteResult] = await connection.query(
      `
      DELETE FROM borrow_records
      `,
    );

    // ---------------------------------
    // 5. Reset AUTO_INCREMENT
    // ---------------------------------
    await connection.query(`
      ALTER TABLE borrow_records AUTO_INCREMENT = 1
    `);

    await connection.commit();

    return {
      success: true,
      message: "All borrow records have been reset successfully.",
      deletedRows: deleteResult.affectedRows,
    };
  } catch (error) {
    await connection.rollback();
    console.log("RESET ALL BORROW RECORDS SERVICE ERROR:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

//
//
//
//

async function resetAllStudentsService() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // ---------------------------------
    // 1. Check active borrowed records
    // ---------------------------------
    const [activeBorrowRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE status = 'BORROWED'
      `,
    );

    const activeBorrowCount = activeBorrowRows[0].count;

    if (activeBorrowCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset student records because there are still active borrowed books.",
      };
    }

    // ---------------------------------
    // 2. Check unsettled fines
    // ---------------------------------
    const [unsettledFineRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM borrow_records
      WHERE payment_status = 'UNSETTLED'
      `,
    );

    const unsettledFineCount = unsettledFineRows[0].count;

    if (unsettledFineCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset student records because there are still unsettled fines.",
      };
    }

    // ---------------------------------
    // 3. Check active reservations
    // ---------------------------------
    const [activeReservationRows] = await connection.query(
      `
      SELECT COUNT(*) AS count
      FROM reservations
      WHERE is_active = 1
         OR status IN ('waiting', 'pending')
      `,
    );

    const activeReservationCount = activeReservationRows[0].count;

    if (activeReservationCount > 0) {
      await connection.rollback();
      return {
        success: false,
        message:
          "Cannot reset student records because there are still active reservations.",
      };
    }

    // ---------------------------------
    // 4. Delete all students
    // ---------------------------------
    const [deleteResult] = await connection.query(
      `
      DELETE FROM students
      `,
    );

    // ---------------------------------
    // 5. Reset AUTO_INCREMENT
    // ---------------------------------
    await connection.query(
      `
      ALTER TABLE students AUTO_INCREMENT = 1
      `,
    );

    await connection.commit();

    return {
      success: true,
      message: "All student records have been reset successfully.",
      deletedRows: deleteResult.affectedRows,
    };
  } catch (error) {
    await connection.rollback();
    console.log("RESET ALL STUDENTS SERVICE ERROR:", error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  resetAllReservationsService,
  resetAllBorrowRecordsService,
  resetAllStudentsService,
};