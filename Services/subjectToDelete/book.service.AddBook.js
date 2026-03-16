//
//
//
//-------------------------
// NOTICE NGA WALA TAY FUNCTIONS NGA GI IMPORT GIKAN SA
// SA LAING FILES TO ADD BOOK AND BOOK COPIES.
// IT MEANS THAT THIS FILE IS INDEPENDENT
// AND HANDLES EVERYTHING ON ITS OWN

// THIS FILE CONTAINS ALL THE FUNCTIONS RELATED
// SA PAG ADD UG BOOKS, THIS IS AN INDEPENDENT FILE!
//-------------------------

const { pool } = require("../../DB/pool");

async function addBookToDb(book) {
  console.log(`THIS IS BOOK SERVICE, ADD BOOK FUNCTION`);

  // Extracting data
  // Remember, these property names are
  // our table column names

  const data = {
    isbn: book.bookIsbn,
    book_photo_file_path: book.bookPhotoFilePath,

    title: book.bookTitle,
    author: book.bookAuthor,
    genre: book.bookGenre,

    book_location: book.bookLocation,
    publisher: book.bookPublisher,

    total_copies: 0, // pwede ni cya sa DB ra e set
    year_published: book.bookYearPublished,
  };

  // INSERTING DETAILS TO THE DB
  const query = "INSERT INTO books SET ?";
  const [result] = await pool.query(query, data);

  // TAKING ONE PROPERTY FROM THE RESULT
  const bookId = result.insertId;

  // CALLING ADD BOOK COPY FUNCTION, AND GETTING THE RESULT
  // WHICH IS AN OBJECT WITH AN ARRAY OF FAILED COPIES
  const failedCopies = await addBookCopyId(bookId, book.bookCopyIds);

  // UPDATE QUANTITY
  const bookQty = await countCopies(bookId);
  await updateBookQty(bookId, bookQty);

  // THIS RETURNS AN ARRAY
  return failedCopies;
}
// -------------UPDATES
// ANOTHER FUNCTION MUST BE ADDED HERE.
// THE NEW TABLE CONTAINS `available_count`
// SO EVERYTIME A NEW COPY IS ADDED THIS COLUMN MUST BE UPDATED TOO

//------------IMPORTANT
// BOTH ADD_BOOK_COPYID() and UPDATE_BOOK_QYT
// APPEAR TO BOTH book.service.AddBook.js and book.service.js
//------------

// THIS FUNCTION RESTURNS AN AN OBJECT
// WITH ARRAY OF FAILED COPIES
// THIS LOOKS FINE TO ME
async function addBookCopyId(bookId, bookCopyIds) {
  // CHECKING IF USER INPUTED COPIES
  if (!bookCopyIds) {
    return;
  }

  const query = `INSERT INTO book_copies SET ?`;
  let failed = []; // TO CONTAIN THE COPIES THAT ARE NOT ADDED
  let successCount = 0;

  for (const copyId of bookCopyIds) {
    try {
      const data = {
        book_id: bookId,
        copy_id: copyId,
      };
      await pool.query(query, data);
      successCount++;
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        failed.push(copyId);
      } else {
        throw error;
      }
    }
  }

  // AFTER ALL THE BOOK IDs WERE ADDED, WE UPDATE THE available_count

  const currentAvailableCount = await getCurrentAvailableCount(bookId);
  const newCurrentCount = currentAvailableCount + successCount;
  updateAvailableCount(bookId, newCurrentCount);

  // MU RETURN LANG KOG ARRAY
  // KAY E WRAP MAN GIHAPON NI
  // INTO AN OBJECT BY THE `OUTER CALLER`
  return failed;
}

// I THINK E RENAME SAD NI NAKO INTO UPDATE_TOTAL_COUNT
// THIS UPDATE THE TOTAL COPIES OF A BOOK.
async function updateBookQty(bookId, qty) {
  //
  try {
    const query = ` UPDATE books SET total_copies = ? WHERE id = ?`;
    const [result] = await pool.query(query, [qty, bookId]);
    return result;
  } catch (error) {
    //
    console.log(`${"\n\n"}`);
    console.log(`BOOK.SERVICE, UPDATE_BOOK_QTY()_catch(), ERROR MESSAGE: `);
    console.log(`${error.message}`);
    throw error;
  }
}

// THIS RETURNS THE COUNT OF BOOK COPIES UNDER
// THE SAME ID.
// TO BE PASS ON TO UPDATE_BOOK_QTY
async function countCopies(bookId) {
  const query = `SELECT COUNT(*) AS count FROM book_copies WHERE book_id = ?`;
  const [rows] = await pool.query(query, [bookId]);
  return rows[0].count;
}

// COPY-PASTED

async function updateAvailableCount(bookId, count) {
  // FIRST WE WILL GET THE CURRENT available_count
  // THEN ADD THE SUCCESS COUNT TO IT

  try {
    const currentAvailableCount = await getCurrentAvailableCount(bookId);
    const updatedAvailableCount = currentAvailableCount + count;
    const query = `UPDATE books SET available_count = ? WHERE id = ?`;
    await pool.query(query, [updatedAvailableCount, bookId]);
  } catch (error) {
    console.log(`ERROR UPDATING CURRENT AVAILABLE COUNT`);
    console.log(error.message);
  }
}

// async function updateAvailableCount(bookId, count) {
//   //
//   // si available_count is not always equal to tota_count
//   // ma addan si available_count if mag add tag newBookCopyIds.
//   // in other words, if naay successfully added new copyId, mu increment
//   // sad ni si available_count.
//   // So we need to count the successful book insertion and mao toy i feed ari nga function
//   // Adto ta kay addBookCopyId and didto atong ni cyang e paslak.
//   // feeling nako by default, zero sah ni si available_count or initial count niya is zero.

//   const query = ` UPDATE books SET available_count = ? WHERE id = ?`;
//   await pool.query(query, [bookId, count]);
// }

async function getCurrentAvailableCount(bookId) {
  const query = `SELECT available_count AS count FROM books WHERE id = ?`;
  const [result] = await pool.query(query, [bookId]);
  const currentAvailableCount = result[0].count;
  return currentAvailableCount;
}

module.exports = { addBookToDb, addBookCopyId, updateBookQty };
