//
//
//
const { pool } = require(`../../DB/pool`);

//------------------------------
// FUNCTIONS FROM book.service.js
//------------------------------

async function deleteBookFromDb(book) {
  const query = "DELETE FROM books WHERE id = ?";
  const [result] = await pool.query(query, [book.id]);
}

//--------------------------------------------
// FUNCTIONS FROM book.service.UpdateBook.js
//--------------------------------------------

//RENAME TO `DELETE ALL COPIES OF A BOOK`
// copyIds = copiesToBeRemoved or copyToBeRemoved
async function removeCopies(copiesToBeRemoved, bookId) {
  for (const bookCopy of copiesToBeRemoved) {
    const query = `DELETE FROM book_copies WHERE copy_id = ?`;
    await pool.query(query, [bookCopy]);
  }
}

//--------------------------------------------
// FUNCTIONS FROM book.service.Update.js
//--------------------------------------------

module.exports = {
  removeCopies,
  deleteBookFromDb,
};
