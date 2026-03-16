//
//
//
const { pool } = require("../../DB/pool");

const { getTheBook } = require(`./books.service.read`);
const { addBookCopyId } = require(`./book.service.addBookCopyId`);
const { removeCopies } = require(`./book.service.delete`);
const { syncBookCounts } = require(`./book.sync`);
const { addNewBookCopy, addBookToDb } = require(`./books.service.create`);
const { removeBookCopy, deleteBookFromDb } = require(`./book.service.delete`);

//--------------------------------------
// MAIN UPDATE FUNCTION
//--------------------------------------
async function updateBookService(bookId, payload) {
  // ✅ DEBUG — shows what arrives from the controller
  console.log("=== updateBookService CALLED ===");
  console.log("bookId:", bookId);
  console.log("payload.newBookCopies:", payload.newBookCopies);

  await checkAndUpdateFormInformation(payload);

  // HANDLES COPIES TO BE MARKED AS LOST
  if (payload.listOfCopyToBeMarkAsLost?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsLost) {
      await markABookCopyAsLost(copyId);
    }
  }

  // HANDLE COPIES TO BE MARKED AS DAMAGED
  if (payload.listOfCopyToBeMarkAsDamage?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsDamage) {
      await markABookCopyAsDamaged(copyId);
    }
  }

  // HANDLE COPIES TO BE MARKED AS FOUND
  if (payload.listOfCopyToBeMarkAsFound?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsFound) {
      await markABookCopyAsFound(copyId);
    }
  }

  // HANDLE COPIES TO BE MARKED AS REPAIRED
  if (payload.listOfCopyToBeMarkAsRepaired?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsRepaired) {
      await markABookCopyAsRepaired(copyId);
    }
  }

  // HANDLE COPIES TO REMOVE
  if (payload.listOfCopyToRemove?.length) {
    await removeCopies(payload.listOfCopyToRemove, bookId);
  }

  // HANDLES NEW COPIES — with duplicate check
  if (payload.newBookCopies) {
    const newCopies = Array.isArray(payload.newBookCopies)
      ? payload.newBookCopies
      : [payload.newBookCopies];

    // ✅ DEBUG — shows what copy IDs are being checked
    console.log("=== DUPLICATE CHECK RUNNING ===");
    console.log("newCopies:", newCopies);

    for (const copyId of newCopies) {
      const trimmedId = copyId.trim();

      const [rows] = await pool.query(
        `SELECT copy_id FROM book_copies WHERE copy_id = ?`,
        [trimmedId]
      );

      // ✅ DEBUG — shows DB result for each copy ID
      console.log(`copy_id="${trimmedId}" found in DB:`, rows.length, "row(s)");

      if (rows.length > 0) {
        const err = new Error(`Copy ID "${trimmedId}" already exists. Please use a unique copy ID.`);
        err.errorCode = "DUPLICATE_COPY_ID";
        throw err;
      }
    }

    await addBookCopyId(bookId, newCopies.map(id => id.trim()));
  }

  // Resync all counter columns after all operations are done
  await syncBookCounts(bookId);

  return { message: "Book updated successfully" };
}

async function checkAndUpdateFormInformation(payload) {
  const bookId = payload.bookId;

  if (!bookId) {
    console.error("checkAndUpdateFormInformation: bookId is missing from payload");
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

  if (payload.bookPhotoFilePath && payload.bookPhotoFilePath !== existingBook.book_photo_file_path) {
    updates.book_photo_file_path = payload.bookPhotoFilePath;
  }
  if (payload.bookTitle && payload.bookTitle !== existingBook.title) {
    updates.title = payload.bookTitle;
  }
  if (payload.bookAuthor && payload.bookAuthor !== existingBook.author) {
    updates.author = payload.bookAuthor;
  }
  if (payload.bookIsbn && payload.bookIsbn !== existingBook.isbn) {
    updates.isbn = payload.bookIsbn;
  }
  if (payload.bookGenre && payload.bookGenre !== existingBook.genre) {
    updates.genre = payload.bookGenre;
  }
  if (payload.bookPublisher && payload.bookPublisher !== existingBook.publisher) {
    updates.publisher = payload.bookPublisher;
  }
  if (payload.bookYearPublished && payload.bookYearPublished !== existingBook.year_published) {
    updates.year_published = payload.bookYearPublished;
  }
  if (payload.bookLocation && payload.bookLocation !== existingBook.book_location) {
    updates.book_location = payload.bookLocation;
  }

  if (Object.keys(updates).length > 0) {
    await pool.query(`UPDATE books SET ? WHERE id = ?`, [updates, bookId]);
  }

  return updates;
}

async function markABookCopyAsLost(copyId) {
  await pool.query(`UPDATE book_copies SET lost = TRUE, available = FALSE WHERE copy_id = ?`, [copyId]);
}

async function markABookCopyAsDamaged(copyId) {
  await pool.query(`UPDATE book_copies SET damaged = TRUE, available = FALSE WHERE copy_id = ?`, [copyId]);
}

// ✅ FIXED — also updates borrow_records so the record shows RETURNED + SETTLED
async function markABookCopyAsFound(copyId) {
  // 1. Update the book copy — mark as no longer lost and available again
  await pool.query(
    `UPDATE book_copies SET lost = FALSE, available = TRUE WHERE copy_id = ?`,
    [copyId]
  );

  // 2. Update the matching borrow record — mark as RETURNED and SETTLED
  await pool.query(
    `UPDATE borrow_records
     SET status = 'RETURNED', payment_status = 'SETTLED', return_date = NOW()
     WHERE copy_id = ? AND status = 'LOST'`,
    [copyId]
  );
}

// ✅ FIXED — also updates borrow_records so the record shows RETURNED + SETTLED
async function markABookCopyAsRepaired(copyId) {
  // 1. Update the book copy — mark as no longer damaged and available again
  await pool.query(
    `UPDATE book_copies SET damaged = FALSE, available = TRUE WHERE copy_id = ?`,
    [copyId]
  );

  // 2. Update the matching borrow record — mark as RETURNED and SETTLED
  await pool.query(
    `UPDATE borrow_records
     SET status = 'RETURNED', payment_status = 'SETTLED', return_date = NOW()
     WHERE copy_id = ? AND status = 'DAMAGED'`,
    [copyId]
  );
}

//------------------------------------
// INDIVIDUAL FIELD UPDATE FUNCTIONS
//------------------------------------
async function updateTitle(newTitle, bookId) {
  return pool.query(`UPDATE books SET title = ? WHERE id = ?`, [newTitle, bookId]);
}
async function updateAuthor(newAuthor, bookId) {
  return pool.query(`UPDATE books SET author = ? WHERE id = ?`, [newAuthor, bookId]);
}
async function updateGenre(newGenre, bookId) {
  return pool.query(`UPDATE books SET genre = ? WHERE id = ?`, [newGenre, bookId]);
}
async function updateIsbn(newIsbn, bookId) {
  return pool.query(`UPDATE books SET isbn = ? WHERE id = ?`, [newIsbn, bookId]);
}
async function updateBookLocation(newLocation, bookId) {
  return pool.query(`UPDATE books SET book_location = ? WHERE id = ?`, [newLocation, bookId]);
}
async function updatePublisher(newPublisher, bookId) {
  return pool.query(`UPDATE books SET publisher = ? WHERE id = ?`, [newPublisher, bookId]);
}
async function updateYearPublished(newYearPublished, bookId) {
  return pool.query(`UPDATE books SET year_published = ? WHERE id = ?`, [newYearPublished, bookId]);
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