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

    const [result] = await pool.query(query, [isbn]);

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

  if (rows.length === 0) {
    throw new Error("Book not found");
  }

  const bookInfo = rows[0];
  const bookId = bookInfo.id;

  const bookCopiesQuery = `SELECT * FROM book_copies WHERE book_id = ?`;
  const [copies] = await pool.query(bookCopiesQuery, [bookId]);

  (() => {
    console.log("\n\n\n");
    console.log(`-----BOOK.SERVICE, GET_BOOK_FOR_UPDATE(): BOOK INFO AND COPIES`);
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
    return rows[0];
  } catch (error) {
    console.log(`ERROR GETTING THE BOOK`);
  }
}





// ══════════════════════════════════════════════════════
// UPDATED: Genre-based recommendation algorithm
//
// Algorithm:
//   Step 1 — Find the most borrowed genre overall
//            by counting borrow_records joined through
//            book_copies → books
//   Step 2 — Return books from that genre ordered by
//            borrowed_count DESC
//   Fallback — If no borrow history exists yet,
//              return top books by borrowed_count
//
// ══════════════════════════════════════════════════════
async function getRecommendedBooks() {
  // Step 1 — Find the most borrowed genre
  const genreQuery = `
    SELECT
      b.genre,
      COUNT(br.id) AS borrow_count
    FROM borrow_records br
    INNER JOIN book_copies bc ON br.copy_id = bc.copy_id
    INNER JOIN books b ON bc.book_id = b.id
    WHERE b.genre IS NOT NULL
      AND TRIM(b.genre) != ''
    GROUP BY b.genre
    ORDER BY borrow_count DESC
    LIMIT 1
  `;

  const [genreRows] = await pool.query(genreQuery);
  const topGenre = genreRows[0];

  // 🔁 Fallback — no borrow history yet
  if (!topGenre) {
    const fallbackQuery = `
      SELECT
        id,
        title,
        author,
        genre,
        book_photo_file_path,
        available_count,
        borrowed_count
      FROM books
      ORDER BY borrowed_count DESC
      LIMIT 10
    `;

    const [books] = await pool.query(fallbackQuery);

    return {
      genre: null,
      books
    };
  }

  // Step 2 — Get books from the most borrowed genre
  const booksQuery = `
    SELECT
      id,
      title,
      author,
      genre,
      book_photo_file_path,
      available_count,
      borrowed_count
    FROM books
    WHERE LOWER(TRIM(genre)) = LOWER(TRIM(?))
    ORDER BY borrowed_count DESC
    LIMIT 10
  `;

  const [books] = await pool.query(booksQuery, [topGenre.genre]);

  return {
    genre: topGenre.genre,
    books
  };
}






// ══════════════════════════════════════════════════════
// NEW: Most Borrowed Books
//
// Returns top 50 books ordered by borrowed_count.
// The frontend filters by genre client-side so no
// extra API calls are needed when switching genre tabs.
// ══════════════════════════════════════════════════════
async function getMostBorrowedBooks() {
  const query = `
    SELECT
      id,
      title,
      author,
      genre,
      book_photo_file_path,
      available_count,
      borrowed_count
    FROM books
    ORDER BY borrowed_count DESC
    LIMIT 50
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
  getMostBorrowedBooks,
};


