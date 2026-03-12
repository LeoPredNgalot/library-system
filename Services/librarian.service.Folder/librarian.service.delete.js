//
//
//

const { pool } = require(`../../DB/pool`);

async function deleteLibrarianFromDb(librarianId) {
  const query = `DELETE FROM library_staffs WHERE id = ?`;
  await pool.query(query, [librarianId]);
}

module.exports = {
  deleteLibrarianFromDb,
};
