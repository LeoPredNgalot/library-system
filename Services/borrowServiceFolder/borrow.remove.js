//
//
//

const { pool } = require(`../../DB/pool`);

async function removeRecordFromBorrowsTable(bookCopyId) {
  //
  //
  try {
    const query = ` DELETE FROM borrow_records WHERE copy_id = ? `;
    await pool.query(query, bookCopyId);
  } catch (error) {
    console.log(`ERROR DELETING A BORROW RECORDS`);
    throw error;
  }
}

module.exports = { removeRecordFromBorrowsTable };
