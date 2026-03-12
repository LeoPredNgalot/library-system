//
//
//

const { pool } = require(`../../DB/pool`);

const { assignCopyToReservation } = require(
  `../reservationServiceFolder/reservation.create.service`,
);

// --------------ORIGINAL CODE
// async function addBookCopyId(bookId, bookCopyIds) {
//   //
//   if (!bookCopyIds) {
//     return;
//   }

//   const query = `INSERT INTO book_copies SET ?`;
//   let failed = [];
//   //let successCount = 0;

//   for (const copyId of bookCopyIds) {
//     try {
//       const data = {
//         book_id: bookId,
//         copy_id: copyId, // from copy_number to copy_id
//       };
//       await pool.query(query, data);
//       // successCount++; // To feed to updateAvailableCount
//     } catch (error) {
//       //
//       //
//       if (error.code === "ER_DUP_ENTRY") {
//         // failed.push(copyNumber);
//       } else {
//         throw error;
//       }
//     }
//   }

//   // return { successCount, failedCopies: failed };
// }

async function addBookCopyId(bookId, bookCopyIds) {
  if (!bookCopyIds) {
    return;
  }

  const query = `INSERT INTO book_copies SET ?`;
  let failed = [];

  for (const copyId of bookCopyIds) {
    try {
      const data = {
        book_id: bookId,
        copy_id: copyId,
      };

      await pool.query(query, data);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        failed.push(copyId); // FIXED: copyId not copyNumber
      } else {
        throw error;
      }
    }
  }

  // After adding copies, try assigning reservations repeatedly
  // (because multiple waiting reservations may exist)
  for (let i = 0; i < bookCopyIds.length; i++) {
    await assignCopyToReservation(bookId);
  }

  return { failedCopies: failed };
}

module.exports = { addBookCopyId };
