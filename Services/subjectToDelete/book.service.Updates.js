//
//
//
// THIS FILE CONTAINS THE FUNCTIONS THAT WILL UPDATE
// 1. TITLE
// 2. AUTHOR
// 3. GENRE
// 4. ISBN
// 5. LOCATION
// 6. PUBLISHER
// 7. ADD BOOK COPY
// 8. REMOVE BOOK COPY

// NEED QTY AND ID PARAMS
// ADDNEWBOOKCOPY() uses this function
const { updateBookQty } = require("../Services/book.service");

const { pool } = require("../../DB/pool");

// async function updateTitle(newTitle, bookId) {
//   //
//   try {
//     const query = `UPDATE books SET title = ? WHERE id = ?`;
//     const values = [newTitle, bookId];
//     const result = await pool.query(query, values);
//     return result;
//   } catch (error) {
//     throw error;
//   }
// }

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

// THIS FUNC SHALL BE EDITED ACCORDINGLY
// THIS FUNC IS PASTED FROM BOOK SERVICE
// SINCE IT CONTAINS MOST OF THE DESIRED LOGIC
// AKO LANG GI COPY PASTE
// GOAL SA FUNC: TO ADD THE NEW BOOK COPY
async function addNewBookCopy(book, bookId) {
  //
  const { newBookCopies } = book;
  let { currentBookQty } = book;

  // PREPARING QUERY AND GETTING THE INITIAL BOOK QTY
  // INITIAL BOOK QTY IS THE NUMBER OF BOOKS DEFINED WITHOUT FILTERING
  // THE DUPLICATED
  const query = `INSERT INTO book_copies SET ?`;
  let initialBookQty = book.bookQty; // This one reflects the total number of new book copies user want to add. It should be renamed properly!

  for (const copy of newBookCopies) {
    // Dapat makabalo si user if pila and unsa
    // sa mga bookIds ang na record and wah na record. Right
    try {
      const data = {
        book_id: bookId,
        copy_number: copy,
      };
      await pool.query(query, data);

      currentBookQty++;
      await updateBookQty(bookId, currentBookQty);
      //WAh tay gi butang ari nga part para mu increment ang qty.
      // Sa every successful insert, ang qty sa book kay dapat mu increment
      // This gives me the idea nga dapat naa tay access sa initialQty sa book
      // unya every successful insert, mu increment ta ug 1 sa initial qty
    } catch (error) {
      //
      // WHEN AN ERROR OCCUR, WE UPDATE INITIAL QTY OF THE BOOK
      //
      if (error.code === "ER_DUP_ENTRY") {
        //
        try {
          let finalBookQty = --initialBookQty;

          await updateBookQty(bookId, finalBookQty);
          console.log(`--------FINAL BOOK QTY: ${finalBookQty}`);
        } catch (error) {
          console.log(
            `${"\n\n"}-------BOOK.SERVICE.UPDATE, ADD_NEW_BOOK_COPY: CATCH, ERROR MESSAGE`
          );
          console.log(error.message);
          throw error;
        }
        //
      } else {
        //
        console.log(
          `BOOK SERVICE ADD_BOOK_IDS()_catch(), ERROR MESSAGE: ${error.message}`
        );
        throw error;
      }
    }
  }
}
async function removeBookCopy(copiesToBeRemove) {
  for (const bookCopy of copiesToBeRemove) {
    const query = `DELETE FROM book_copies WHERE copy_number = ?`;
    await pool.query(query, [bookCopy]);
  }
}

module.exports = {
  updateTitle,
  updateAuthor,
  updateGenre,
  updateBookLocation,
  updateIsbn,
  updatePublisher,
  addNewBookCopy,
  removeBookCopy,
};
