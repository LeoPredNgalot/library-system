//
//
// PLAN IS, THIS FILE IS THE EXTENSION OF
// THE UPDATE SERVICE FUNCTION.
// THIS FILE CONTAINS THE HELPER FUNCTIONS

// 1. CHECK AND UPDATE FORM INFO

// 2. GET THE BOOK (that is being updated for reference)
// 3. GET CURRENT AVAILABLE COUNT ( for reference )

// 4. UPDATE AVAILABLE COUNT
// 5. UPDATE TOTAL COPIES
// 6. SET A BOOK COPY NOT AVAILABLE
// 7. MAL/MAD

// 8. REMOVE BOOK COPY

// 9. COUNT COPIES
// 10. ISBOOKCOPYAVAILABLE

// 11. GETLOSTCOUNTBYBOOKID
// 12. GETDAMAGECOUNTBYBOOKID

const { pool } = require("../../DB/pool");

async function checkAndUpdateFormInformation(payload) {
  const bookId = payload.bookId;
  const existingBook = await getTheBook(bookId);

  // 2. Build updates dynamically
  const updates = {};

  //   CHECKING BOOK PHOTO
  if (
    payload.bookPhotoFilePath &&
    payload.bookPhotoFilePath !== existingBook.book_photo_file_path
  ) {
    updates.book_photo_file_path = payload.bookPhotoFilePath;
  }

  // CHECKING BOOK TITLE
  if (payload.bookTitle && payload.bookTitle !== existingBook.title) {
    updates.title = payload.bookTitle;
  }

  // CHECK AUTHOR
  if (payload.bookAuthor && payload.bookAuthor !== existingBook.author) {
    updates.author = payload.bookAuthor;
  }

  // CHECK ISBN
  if (payload.bookIsbn && payload.bookIsbn !== existingBook.isbn) {
    updates.isbn = payload.bookIsbn;
  }

  // CHECK GENRE
  if (payload.bookGenre && payload.bookGenre !== existingBook.genre) {
    updates.genre = payload.bookGenre;
  }

  // CHECK PUBLISHER
  if (
    payload.bookPublisher &&
    payload.bookPublisher !== existingBook.publisher
  ) {
    updates.publisher = payload.bookPublisher;
  }

  if (
    payload.bookLocation &&
    payload.bookLocation !== existingBook.book_location
  ) {
    updates.book_location = payload.bookLocation;
  }

  // 3. Update book table (ONLY if something changed)
  if (Object.keys(updates).length > 0) {
    const updateQuery = `UPDATE books SET ? WHERE id = ?`;
    await pool.query(updateQuery, [updates, bookId]);
  }

  // RETURNING WHAT UPDATES WHERE MADE:

  return updates;
}

// HELPERS
async function getTheBook(bookId) {
  try {
    const query = `SELECT * FROM books WHERE id = ?`;
    const [rows] = await pool.query(query, [bookId]);
    if (rows.length === 0) {
      throw new Error("Book not found");
    }
    const existingBook = rows[0];
    return existingBook;
  } catch (error) {
    console.log(`ERROR GETTING THE BOOK`);
  }
}

async function getCurrentAvailableCount(bookId) {
  try {
    const query = `SELECT available_count AS count FROM books WHERE id = ?`;
    const [result] = await pool.query(query, [bookId]);
    const currentAvailableCount = result[0].count;
    return currentAvailableCount;
  } catch (error) {
    console.log(`ERROR GETTING THE CURRENT AVAILABLE COUNT`);
  }
}

async function updateAvailableCount(bookId, count) {
  // THE 'COUNT' VALUE SHOULD BE CALCULATED FIRST,
  // BY USING THE countCopies() TO GET THE BASE COUNT.
  try {
    const query = `UPDATE books SET available_count = ? WHERE id = ?`;
    await pool.query(query, [count, bookId]);
  } catch (error) {
    console.log(`ERROR UPDATING THE AVAILABLE COUNT`);
  }
}

async function updateTotalCopies(bookId, qty) {
  //
  try {
    const query = `UPDATE books SET total_copies = ? WHERE id = ?`;
    await pool.query(query, [qty, bookId]);
    //
  } catch (error) {
    //
    console.log(`ERROR UPDATING THE TOTAL COPIES `);
  }
}

async function setABookCopyNotAvailable(copyId) {
  try {
    const query = `UPDATE book_copies SET available =? where copy_id =? `;
    const data = [0, copyId];
    await pool.query(query, data);
  } catch (error) {
    console.log("ERROR UPDATING BOOKS AVAILABILITY");
  }
}

async function markBookAsLost(copyId) {
  //
  try {
    const query = `UPDATE book_copies SET lost =? where copy_id =?`;
    const data = [1, copyId];
    await pool.query(query, data);
  } catch (error) {
    console.log(`ERROR MARKING A  BOOK AS LOST`);
  }
}

async function markBookAsDamage(copyId) {
  //
  try {
    const query = `UPDATE book_copies SET damaged =? WHERE copy_id=?`;
    const data = [1, copyId];
    await pool.query(query, data);
  } catch (error) {
    console.log(`ERROR MARKING A BOOK AS DAMAGED`);
    console.log(`ERROR MESSAGE ${error.message}`);
  }
}

async function removeBookCopy(bookId, bookCopiesToRemove) {
  try {
    const removeQuery = `DELETE FROM book_copies WHERE copy_id = ? AND book_id = ?`;
    for (const copyNumber of bookCopiesToRemove) {
      await pool.query(removeQuery, [copyNumber, bookId]);
      console.log(`Removed copy number: ${copyNumber} for book ID: ${bookId}`);
    }
  } catch (error) {
    console.log(`ERROR REMOVING BOOK COPY`);
  }
}

async function countCopies(bookId) {
  // COUNTS ALL THE BOOK COPY WITH THE SAME BOOKID
  try {
    const query = `SELECT COUNT(*) AS count FROM book_copies WHERE book_id = ?`;
    const [rows] = await pool.query(query, [bookId]);
    return rows[0].count;
  } catch (error) {
    console.log(`ERROR COUNTING COPIES`);
  }
}

async function isBookCopyIdAvailable(copyId) {
  // THIS FUNCTION RETURN 1 || 0 FOR TRUE AND FALSE
  try {
    const query = `SELECT available FROM book_copies WHERE copy_id = ?`;
    const [rows] = await pool.query(query, [copyId]);
    return rows[0]?.available; // 1 or 0
  } catch (error) {
    console.log(`ERROR CHECKING IF BOOK COPY ID IS AVAILABLE`);
  }
}

// NEWLY ADDED FUNC, NEED PA E TEST
//-------------
// COUNTING THE LOST/DAMAGE NUMBER
// & GETTING THE LOST/DAMAGE COUNT OF A PARTICULAR BOOKS
//-------------
async function countDamagedCopy(bookId) {
  try {
    const query = `SELECT COUNT(*) AS damage_count
      FROM book_copies WHERE book_id = ? AND damaged = true `;
    const [rows] = await pool.query(query, [bookId]);
    return rows[0].damage_count;
  } catch (error) {
    console.log("ERROR COUNTING DAMAGED COPIES");
    throw new Error(`ERROR COUNTING DAMAGED COPIES`);
  }
}

async function countLostCopy(bookId) {
  try {
    const query = `SELECT COUNT(*) AS lost_count
      FROM book_copies WHERE book_id = ? AND lost = true `;
    const [rows] = await pool.query(query, [bookId]);
    return rows[0].lost_count;
  } catch (error) {
    console.log("ERROR COUNTING LOST COPIES");
    throw new Error(`ERROR COUNTING LOST COPIES`);
  }
}

async function getLostCountByBookId(bookId) {
  try {
    const query = ` SELECT lost_count
      FROM books WHERE id = ? `;
    const [rows] = await pool.query(query, [bookId]);

    if (rows.length === 0) return 0;
    return rows[0].lost_count;
  } catch (error) {
    console.log("ERROR GETTING LOST COUNT FOR BOOK");
    throw error;
  }
}

async function getDamagedCountByBookId(bookId) {
  try {
    const query = `SELECT damaged_count
      FROM books WHERE id = ? `;
    const [rows] = await pool.query(query, [bookId]);

    if (rows.length === 0) return 0;
    return rows[0].damaged_count;
  } catch (error) {
    console.log("ERROR GETTING DAMAGED COUNT FOR BOOK");
    throw error;
  }
}

module.exports = {
  checkAndUpdateFormInformation,
  getCurrentAvailableCount,
  updateAvailableCount,
  updateTotalCopies,
  markBookAsDamage,
  markBookAsLost,
  removeBookCopy,
  countCopies,

  setABookCopyNotAvailable,
  isBookCopyIdAvailable,
};
