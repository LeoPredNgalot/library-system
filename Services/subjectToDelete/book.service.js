//
//
//
const { pool } = require("../../DB/pool");

// UNSA GAE NI CYA NA FILE?
// THIS FILE CONTAINS CRUCIAL FUNCTIONS
// 1. ADDING BOOK COPIES TO DB
// 2. DELETE BOOK
// 3. SEARCH BOOK
// 4. GETTING ALL BOOKS
// 5. CHECK ISBN AND TITLES UNIQUNESS
// 6. COUNT COPIES

async function addBookCopyId(bookId, bookCopyIds) {
  //
  if (!bookCopyIds) {
    return;
  }

  const query = `INSERT INTO book_copies SET ?`;
  let failed = [];
  let successCount = 0;

  for (const copyNumber of bookCopyIds) {
    try {
      const data = {
        book_id: bookId,
        copy_number: copyNumber,
      };
      await pool.query(query, data);
      successCount++; // To feed to updateAvailableCount
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        //
        failed.push(copyNumber);
      } else {
        //
        throw error;
      }
    }
  }

  // AFTER ADDING ALL BOOK COPY IDs
  // I SHOULD UPDATE THE total_copies
  // and the available_copies

  try {
    const currentAvailableCount = await getCurrentAvailableCount(bookId);
    const newAvailableCount = currentAvailableCount + successCount;
    await updateAvailableCount(bookId, newAvailableCount);
  } catch (error) {
    console.log(`ERROR UPDATING AVAILABLE COUNT IN ADD BOOK`);
    console.log(error.message);
  }

  // I PROVIDE THIS FOR THE CONTROLLER, THIS IS FOR THE FE.
  return { successCount, failedCopies: failed };
}

async function checkIsbn(book) {
  //
  try {
    const isbn = book.bookIsbn;
    const query = `SELECT EXISTS 
    (SELECT 1 FROM books WHERE isbn = ? ) AS existing_isbn`;

    const [result] = await pool.query(query, [isbn]); // mysql2 requires the 2nd arg as arr

    // mysql returns [ rows, fields ]   that's why we have rows as const
    if (result[0].existing_isbn === 1) {
      return true;
    } else {
      console.log(`----------BOOK.SERVICE, CHECK_ISBN(), else`);
    }
    //
  } catch (error) {
    throw error;
  }
}

async function checkTitle(book) {
  //
  // extractProperty, createQuery, catchResult, checkQueryResult,

  try {
    const title = book.bookTitle;

    const query = ` SELECT EXISTS (
      SELECT 1
      FROM books
      WHERE title = ?
    ) AS existing_title
    `;

    const [result] = await pool.query(query, [title]);

    // Need pani dungagan or tang2 ngan
    if (result[0].existing_title === 1) {
      return true;
    } else {
    }
  } catch (error) {
    // AN ERROR MESSAGE

    console.log(
      `${"\n"}---------CHECKTITLE()_catch(), ERROR MESSAGE: ${error.message}`
    );
    throw error;
  }
}

async function getAllBooksFromDb() {
  // For book viewing
  const query = "SELECT * FROM books";
  const [result] = await pool.query(query);
  return result;
}

async function countCopies(bookId) {
  const query = `SELECT COUNT(*) AS count FROM book_copies WHERE book_id = ?`;
  const [rows] = await pool.query(query, [bookId]);
  return rows[0].count;
}

async function deleteBookFromDb(book) {
  const query = "DELETE FROM books WHERE id = ?";
  const [result] = await pool.query(query, [book.id]);
}

async function searchBooks(searchTerm) {
  //
  const query = `SELECT * FROM books WHERE title LIKE ? OR 
    author LIKE ? OR isbn LIKE ? ORDER BY title ASC`;

  const likeTerm = `%${searchTerm}%`;
  const [rows] = await pool.query(query, [likeTerm, likeTerm, likeTerm]);
  return rows;
}

//-----------------
// COPY-PASTED
//-----------------

// REMEMBER, THESE  ARE IMPORTED IN CONTROLLER
module.exports = {
  // I just realized that these functions are being imported
  // and used by other files :(
  checkIsbn,
  checkTitle,
  getAllBooksFromDb,

  addBookCopyId, // 1 file use this function, updateBook, I should
  // `give` updateBook its own copy of this function. Para dili na magka complicate
  // ang connection between files.
  //
  // SO PRESENT NA NI NGA METHOD KAY book.service.updateBook.js
  countCopies,
  deleteBookFromDb,
  searchBooks,
};
