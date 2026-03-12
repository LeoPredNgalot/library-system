//
//
//
const { pool } = require(`../../DB/pool`);

async function createBorrowRecord(payload) {
  const { studentId, bookCopyId, dueDate } = payload;

  try {
    console.log(`THIS IS THE PAYLOAD IN BORROW.WRITE.JS`);
    console.log(payload);

    const query = `
    INSERT INTO borrow_records (student_id, copy_id, due_date)
    VALUES (?, ?, ?)`;

    await pool.query(query, [studentId, bookCopyId, dueDate]);
  } catch (error) {
    console.log(`BORROW.WRITE: ERROR INSERTING BORROW BOOK RECORDS`);
    console.log(error.message);
    throw error;
  }
}

module.exports = { createBorrowRecord };
