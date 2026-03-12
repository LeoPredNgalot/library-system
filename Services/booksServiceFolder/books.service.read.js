//
//
//
const { pool } = require(`../../DB/pool`);

//----------------------
// FUNCTION FROM addBook
//----------------------

//----------------------
// FUNCTIONS FROM service.js
//----------------------

async function getAllBooksFromDb({
  page = 1,
  limit = 6,
  sort = "ASC",
  genre = null,
}) {
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM books`;
  const values = [];

  // FILTER BY GENRE
  if (genre) {
    query += ` WHERE genre = ?`;
    values.push(genre);
  }

  // SORTING
  query += ` ORDER BY title ${sort === "DESC" ? "DESC" : "ASC"}`;

  // PAGINATION
  query += ` LIMIT ? OFFSET ?`;
  values.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, values);

  // COUNT FOR TOTAL PAGES
  let countQuery = `SELECT COUNT(*) as total FROM books`;
  const countValues = [];

  if (genre) {
    countQuery += ` WHERE genre = ?`;
    countValues.push(genre);
  }

  const [[{ total }]] = await pool.query(countQuery, countValues);

  return {
    books: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

async function searchBooks(searchTerm) {
  //
  const query = `SELECT * FROM books WHERE title LIKE ? OR 
    author LIKE ? OR isbn LIKE ? ORDER BY title ASC`;

  const likeTerm = `%${searchTerm}%`;
  const [rows] = await pool.query(query, [likeTerm, likeTerm, likeTerm]);
  return rows;
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
      SELECT 1 FROM books WHERE title = ? ) 
      AS existing_title`;

    const [result] = await pool.query(query, [title]);

    if (result[0].existing_title === 1) {
      return true;
    } else {
    }
  } catch (error) {
    // AN ERROR MESSAGE

    console.log(
      `${"\n"}---------CHECKTITLE()_catch(), ERROR MESSAGE: ${error.message}`,
    );
    throw error;
  }
}

//--------------------------------------
// FUNCTIONS FROM service.UpdateBook.js
//--------------------------------------

async function getBookForUpdate(id) {
  //
  //
  const query = `SELECT * FROM books WHERE id = ?`;
  const [rows] = await pool.query(query, [id]);

  //CHECKING IF THE BOOK EXIST FIRST
  if (rows.length === 0) {
    throw new Error("Book not found");
  }

  const bookInfo = rows[0];
  const bookId = bookInfo.id;

  // RETRIEVING THE BOOK COPIES
  const bookCopiesQuery = `SELECT * FROM book_copies WHERE book_id = ?`;
  const [copies] = await pool.query(bookCopiesQuery, [bookId]);

  // ----- LOGGING
  (() => {
    console.log("\n\n\n");
    console.log(
      `-----BOOK.SERVICE, GET_BOOK_FOR_UPDATE(): BOOK INFO AND COPIES`,
    );

    console.log(bookInfo);
    console.log(copies);
  })();
  return { book: bookInfo, bookIdArray: copies };
}

//--------------------------------------
// FUNCTIONS FROM service2.updates
//--------------------------------------

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

async function getRecommendedBooks() {
  const query = `
    SELECT *
    FROM books
    ORDER BY borrowed_count DESC
    LIMIT 5
  `;

  const [rows] = await pool.query(query);
  return rows;
}

module.exports = {
  getAllBooksFromDb,

  searchBooks,

  checkIsbn,
  checkTitle,

  getBookForUpdate,

  getTheBook,
  getRecommendedBooks,
};
