//
//
//
const { pool } = require(`../../DB/pool`);
const { toTitleCase, toNumericOnly } = require("../formatUtils");

async function addBookToDb(book) {
  console.log(`THIS IS BOOK SERVICE, ADD BOOK FUNCTION`);

  const data = {
    isbn:                 toNumericOnly(book.bookIsbn),
    book_photo_file_path: book.bookPhotoFilePath,
    title:                toTitleCase(book.bookTitle),
    author:               toTitleCase(book.bookAuthor),
    genre:                book.bookGenre, // stays ALL CAPS
    book_location:        toTitleCase(book.bookLocation),
    publisher:            toTitleCase(book.bookPublisher),
    total_copies:         0,
    available_count:      0,
    year_published:       book.bookYearPublished,
  };

  const query = "INSERT INTO books SET ?";
  const [result] = await pool.query(query, data);
  const bookId = result.insertId;

  const failedCopies = await addBookCopyId(bookId, book.bookCopyIds);

  const successCount = Array.isArray(book.bookCopyIds)
    ? book.bookCopyIds.length - (failedCopies.failedCopies?.length || 0)
    : 0;

  if (successCount > 0) {
    await pool.query(
      `UPDATE books SET total_copies = ?, available_count = ? WHERE id = ?`,
      [successCount, successCount, bookId]
    );
  }

  return failedCopies;
}

async function addBookCopyId(bookId, bookCopyIds) {
  if (!bookCopyIds) return { failedCopies: [] };

  const query = `INSERT INTO book_copies SET ?`;
  let failed = [];

  for (const copyId of bookCopyIds) {
    try {
      await pool.query(query, { book_id: bookId, copy_id: copyId });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        failed.push(copyId);
      } else {
        throw error;
      }
    }
  }

  return { failedCopies: failed };
}

module.exports = { addBookCopyId, addBookToDb };
