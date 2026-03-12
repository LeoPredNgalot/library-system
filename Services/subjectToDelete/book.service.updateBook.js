//
// FUNCTIONS OF THIS FILE:
//
// 1. GETBOOKFORUPDATE
// 2. UPDATEBOOKSERVICE
// 3. MAD/MAL
// 4. ADDBOOKCOPYID
// 5. REMOVECOPIES
// 6. COUNTDAMAGEDCOPY
// 7. COUNTLOSTCOPY

const { pool } = require("../../DB/pool");

const {
  checkAndUpdateFormInformation,
  updateAvailableCount,
  updateTotalCopies,
  getCurrentAvailableCount,
  markBookAsDamage,
  markBookAsLost,
  removeBookCopy,
  countCopies,
  setABookCopyNotAvailable,
  isBookCopyIdAvailable,
} = require("../Services/book.service2.updates");

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
      `-----BOOK.SERVICE, GET_BOOK_FOR_UPDATE(): BOOK INFO AND COPIES`
    );

    console.log(bookInfo);
    console.log(copies);
  })();
  return { book: bookInfo, bookIdArray: copies };
}

async function updateBookService(bookId, payload) {
  //
  const updates = await checkAndUpdateFormInformation(payload);

  // HANDLES NEW BOOKS TO BE MAL
  if (payload.listOfCopyToBeMarkAsLost?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsLost) {
      await markCopyAsLost(copyId, bookId);
    }
  }

  //  HANDLE BOOKS TO BE MAD
  if (payload.listOfCopyToBeMarkAsDamage?.length) {
    for (const copyId of payload.listOfCopyToBeMarkAsDamage) {
      await markCopyAsDamaged(copyId, bookId);
    }
  }

  //  HANDLE COPIES TO REMOVE
  if (payload.listOfCopyToRemove?.length) {
    await removeCopies(payload.listOfCopyToRemove, bookId);
  }

  //  HANDLES NEW COPIES
  if (payload.newBookCopies) {
    await addBookCopyId(bookId, payload.newBookCopies);
  }

  return {
    updatedFields: Object.keys(updates),
    message: "Book updated successfully",
  };
}

async function markCopyAsLost(copyId, bookId) {
  // 1. Check if this copy is available
  const isAvailable = await isBookCopyIdAvailable(copyId);

  // 2. Decrement ONLY if available === 1
  if (isAvailable === 1) {
    const currentAvailableCount = await getCurrentAvailableCount(bookId);
    const newAvailableCount = currentAvailableCount - 1;
    await updateAvailableCount(bookId, newAvailableCount);
  }

  // 3. Mark copy as lost
  await markBookAsLost(copyId);
  await setABookCopyNotAvailable(copyId);
}

async function markCopyAsDamaged(copyId, bookId) {
  // 1. Check if this copy is available
  const isAvailable = await isBookCopyIdAvailable(copyId);

  // 2. Decrement ONLY if available === 1
  if (isAvailable === 1) {
    const currentAvailableCount = await getCurrentAvailableCount(bookId);
    const newAvailableCount = currentAvailableCount - 1;
    await updateAvailableCount(bookId, newAvailableCount);
  }

  // 3. Mark copy as damaged
  await markBookAsDamage(copyId);
  await setABookCopyNotAvailable(copyId);
}

async function addBookCopyId(bookId, bookCopyIds) {
  //
  if (!bookCopyIds) {
    return;
  }

  const query = `INSERT INTO book_copies SET ?`;
  let failed = [];
  let successCount = 0; // for updateAvailableCount;

  for (const copyId of bookCopyIds) {
    try {
      const data = {
        book_id: bookId,
        copy_id: copyId,
      };
      await pool.query(query, data);
      successCount++; // Dih ni cya mu run if the above code fails
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        failed.push(copyId);
      } else {
        console.log(`ADD BOOK COPY ID() ERROR MESSAGE`);
        console.log(error.message);
      }
    }
  }

  const damagedCount = await countDamagedCopy(bookId);
  const lostCount = await countLostCopy(bookId);

  console.log(`DAMAGE COUNT: ${damagedCount}`);
  console.log(`LOST COUNT: ${lostCount}`);

  // AFTER INSERTING ALL THE BOOK COPIES, I NEED TO COUNT
  // THOSE COPIES, AND UPDATE THE OVERALL COPIES OF THAT BOOK.

  // ALSO SINCE NEW BOOK COPIES ARE INSERTED, AVAILABLE_COUNT
  // SHOULD BE INCREMENTED TOO.
  // FIRST, WE TRACK THE NUMBER OF HOW MANY OF THE NEW COPIES ARE SUCCESSFULLY.
  // REGISTERED/ADDED AND USE THAT NUMBER TO BE ADDED TO THE TOTAL COPIES.

  const countCopiesResult = await countCopies(bookId);
  await updateTotalCopies(bookId, countCopiesResult);

  const currentAvailableCount = await getCurrentAvailableCount(bookId);
  const newCurrentAvailableCount = currentAvailableCount + successCount;
  await updateAvailableCount(bookId, newCurrentAvailableCount);
}

async function removeCopies(copyIds, bookId) {
  let availableToRemove = 0;

  // 1. Check which copies are currently available
  for (const copyId of copyIds) {
    const isAvailable = await isBookCopyIdAvailable(copyId);
    if (isAvailable === 1) {
      availableToRemove++;
    }
  }

  // 2. Remove copies
  await removeBookCopy(bookId, copyIds);

  // 3. Update total copies
  const totalCopies = await countCopies(bookId);
  await updateTotalCopies(bookId, totalCopies);

  // 4. Update available copies (only if needed)
  if (availableToRemove > 0) {
    const currentAvailableCount = await getCurrentAvailableCount(bookId);
    const newAvailableCount = currentAvailableCount - availableToRemove;
    await updateAvailableCount(bookId, newAvailableCount);
  }
}

// NEWLY ADDED FUNC, NEED PA E TEST
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

module.exports = {
  updateBookService,
  getBookForUpdate,
};
