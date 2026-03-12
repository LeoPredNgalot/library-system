//
//
//

const { pool } = require(`../../DB/pool`);
const bcrypt = require("bcrypt");

// THIS FILE IS FOR LOGGING IN
// IT WILL CHECK THE DB WHEN A LIBRARIAN WANTS TO LOG IN

async function authenticateStaff(payload) {
  const { userName, password } = payload;

  const query = `
  SELECT id, user_name, role, password, first_name, last_name
  FROM library_staffs WHERE user_name = ?`;

  const [rows] = await pool.execute(query, [userName]);

  if (rows.length === 0) {
    console.log(`Login failed`);
    return { success: false };
  }

  const storedHash = rows[0].password;

  const isMatch = await bcrypt.compare(password, storedHash);

  if (!isMatch) {
    console.log("Login failed");
    return { success: false };
  }

  //----------------------------------
  // FOR SUCESSFUL LOGIN
  //----------------------------------
  console.log(`Login successful`);

  return {
    success: true,
    user: {
      id: rows[0].id,
      username: rows[0].user_name,
      role: rows[0].role,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
    },
  };
}

module.exports = { authenticateStaff };