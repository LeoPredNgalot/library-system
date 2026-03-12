//
//
//
const { pool } = require("../../DB/pool");

// RENAME TO `getTheBookSubjectToUpdate`
const { getTheBook } = require(`./books.service.read`);
const { addBookCopyId } = require(`./book.service.addBookCopyId`);
const { removeCopies } = require(`./book.service.delete`);
const { syncBookCounts } = require(`./book.sync`);

const { addNewBookCopy, addBookToDb } = require(`./books.service.create`);

const { removeBookCopy, deleteBookFromDb } = require(
  `./book.service.delete`,
);

//--------------------------------------
// FUNCTIONS FROM service.updateBook.js
//--------------------------------------

// JUST RENAME TO `updateBookRecord`
async function updateBookService(bookId, payload) {
  await checkAndUpdateFormInformation(payload);

  // HANDLES NEW BOOKS TO BE MAL
  if (payload.listOfCopyToBeMarkAsLost?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsLost) {
      await markABookCopyAsLost(copyId);
    }
  }

  //  HANDLE BOOKS TO BE MAD
  if (payload.listOfCopyToBeMarkAsDamage?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsDamage) {
      await markABookCopyAsDamaged(copyId);
    }
  }

  // HANDLE COPIES TO BE FOUND
  if (payload.listOfCopyToBeMarkAsFound?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsFound) {
      await markABookCopyAsFound(copyId);
    }
  }

  // HANDLE COPIES TO BE REPAIRED
  if (payload.listOfCopyToBeMarkAsRepaired?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsRepaired) {
      await markABookCopyAsRepaired(copyId);
    }
  }

  if (payload.listOfCopyToRemove?.length) {
    await removeCopies(payload.listOfCopyToRemove, bookId);
  }

  //  HANDLES NEW COPIES
  if (payload.newBookCopies) {
    await addBookCopyId(bookId, payload.newBookCopies);
  }

  // Resync all counter columns after all operations are done
  await syncBookCounts(bookId);

  return { message: "Book updated successfully" };
}

async function checkAndUpdateFormInformation(payload) {
  const bookId = payload.bookId;

  if (!bookId) {
    console.error("checkAndUpdateFormInformation: bookId is missing from payload", payload);
    const err = new Error("Book ID is missing from the request.");
    err.errorCode = "INVALID_INPUT";
    throw err;
  }

  const existingBook = await getTheBook(bookId);

  if (!existingBook) {
    console.error(`checkAndUpdateFormInformation: no book found for id=${bookId}`);
    const err = new Error(`Book with id=${bookId} not found.`);
    err.errorCode = "BOOK_NOT_FOUND";
    throw err;
  }

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

  // CHECK YEAR PUBLISHED
  if (
    payload.bookYearPublished &&
    payload.bookYearPublished !== existingBook.year_published
  ) {
    updates.year_published = payload.bookYearPublished;
  }

  // CHECK LOCATION
  if (
    payload.bookLocation &&
    payload.bookLocation !== existingBook.book_location
  ) {
    updates.book_location = payload.bookLocation;
  }

  // 3. Update book table (ONLY if something changed)
  if (Object.keys(updates).length > 0) {
    await pool.query(`UPDATE books SET ? WHERE id = ?`, [updates, bookId]);
  }

  // RETURNING WHAT UPDATES WHERE MADE:
  return updates;
}

async function markABookCopyAsLost(copyId) {
  await pool.query(`UPDATE book_copies SET lost = TRUE, available = FALSE WHERE copy_id = ?`, [copyId]);
}

async function markABookCopyAsDamaged(copyId) {
  await pool.query(`UPDATE book_copies SET damaged = TRUE, available = FALSE WHERE copy_id = ?`, [copyId]);
}

async function markABookCopyAsFound(copyId) {
  await pool.query(`UPDATE book_copies SET lost = FALSE, available = TRUE WHERE copy_id = ?`, [copyId]);
}

async function markABookCopyAsRepaired(copyId) {
  await pool.query(`UPDATE book_copies SET damaged = FALSE, available = TRUE WHERE copy_id = ?`, [copyId]);
}

//------------------------------------
// FUNCIIONS FROM
//------------------------------------

async function updateTitle(newTitle, bookId) {
  const query = `UPDATE books SET title = ? WHERE id = ?`;
  const values = [newTitle, bookId];
  return pool.query(query, values);
}
async function updateAuthor(newAuthor, bookId) {
  const query = `UPDATE books SET author = ? WHERE id = ?`;
  const values = [newAuthor, bookId];
  return pool.query(query, values);
}
async function updateGenre(newGenre, bookId) {
  const query = `UPDATE books SET genre = ? WHERE id = ?`;
  const values = [newGenre, bookId];
  return await pool.query(query, values);
}
async function updateIsbn(newIsbn, bookId) {
  const query = `UPDATE books SET isbn = ? WHERE id = ?`;
  const values = [newIsbn, bookId];
  return await pool.query(query, values);
}
async function updateBookLocation(newLocation, bookId) {
  const query = `UPDATE books SET book_location =? WHERE id =?`;
  const values = [newLocation, bookId];
  return pool.query(query, values);
}
async function updatePublisher(newPublisher, bookId) {
  const query = `UPDATE books SET publisher = ? WHERE id = ?`;
  const values = [newPublisher, bookId];
  return pool.query(query, values);
}
async function updateYearPublished(newYearPublished, bookId) {
  const query = `UPDATE books SET year_published = ? WHERE id = ?`;
  const values = [newYearPublished, bookId];
  return pool.query(query, values);
}

module.exports = {
  updateBookService,
  updateTitle,
  updateAuthor,
  updateGenre,
  updateIsbn,
  updateBookLocation,
  updatePublisher,
  markABookCopyAsFound,
  markABookCopyAsRepaired,
};