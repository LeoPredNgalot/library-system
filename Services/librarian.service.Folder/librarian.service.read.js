//
//
//

const { pool } = require(`../../DB/pool`);

// async function checkLibrarianUserName(payload) {
//   const { librarianUserName } = payload;

//   try {
//     const query = ` SELECT EXISTS
//       (SELECT 1 FROM library_staffs WHERE user_name = ?) AS existing_userName `;
//     const result = await pool.query(query, [librarianUserName]);

//     if (result[0].existing_userName === 1) {
//       return true;
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.log(` ERROR CHECKING THE USER NAME `);
//     throw new Error(`LIBRARIAN.CREATE: ERROR CHECKING THE USERNAME`);
//   }
// }

// async function checkLibrarianEmail(payload) {
//   const { librarianEmail } = payload;

//   try {
//     const query = ` SELECT EXISTS
//       (SELECT 1 FROM library_staffs WHERE email = ?) AS existing_email `;
//     const result = await pool.query(query, [librarianEmail]);

//     if (result[0].existing_email === 1) {
//       return true;
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.log(` ERROR CHECKING THE LIBRARIAN EMAIL `);
//     throw new Error(`LIBRARIAN.CREATE: ERROR CHECKING THE EMAIL`);
//   }
// }

async function getAllLibrariansFromDb() {
  const query = `SELECT * FROM library_staffs WHERE role = 'librarian' `;
  await pool.query(query);

  const [rows] = await pool.query(query);
  return rows;
}
async function checkLibrarianUserName(payload) {
  const { librarianUserName } = payload;

  const query = `
    SELECT EXISTS(
      SELECT 1 FROM library_staffs WHERE user_name = ?
    ) AS existing_userName`;

  const [rows] = await pool.query(query, [librarianUserName]);
  return rows[0].existing_userName === 1;
}

async function checkLibrarianEmail(payload) {
  const { librarianEmail } = payload;

  const query = `
    SELECT EXISTS(
      SELECT 1 FROM library_staffs WHERE email = ?
    ) AS existing_email
  `;

  const [rows] = await pool.query(query, [librarianEmail]);
  return rows[0].existing_email === 1;
}

async function getLibrarianById(payload) {
  const { id } = payload;

  const query = `SELECT * FROM library_staffs WHERE id = ?`;

  const [rows] = await pool.query(query, [id]);

  return rows[0];
}

module.exports = {
  checkLibrarianEmail,
  checkLibrarianUserName,
  getAllLibrariansFromDb,
  getLibrarianById,
};
