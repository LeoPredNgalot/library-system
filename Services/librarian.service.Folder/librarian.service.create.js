//
//
//

const { pool } = require(`../../DB/pool`);
const bcrypt = require("bcrypt");
const { toTitleCase, toNumericOnly } = require("../formatUtils");

const { checkLibrarianEmail, checkLibrarianUserName } = require(
  `./librarian.service.read`,
);

async function registerLibrarianToDb(payload) {
  const validation = await checkLibrarianCredentials(payload);

  if (!validation.success) {
    return validation;
  }

  const hashedPassword = await bcrypt.hash(payload.librarianPassword, 10);

  const data = {
    first_name:     toTitleCase(payload.librarianFirstName),
    last_name:      toTitleCase(payload.librarianLastName),
    user_name:      payload.librarianUserName,
    password:       hashedPassword,
    email:          payload.librarianEmail,
    contact_number: payload.librarianContactNumber,
  };

  const query = `INSERT INTO library_staffs SET ?`;
  await pool.query(query, data);

  return { success: true, message: `Librarian registered successfully` };
}

async function checkLibrarianCredentials(payload) {
  const emailExists    = await checkLibrarianEmail(payload);
  const usernameExists = await checkLibrarianUserName(payload);

  if (emailExists && usernameExists) {
    return { success: false, message: `Email and username already taken` };
  }
  if (emailExists) {
    return { success: false, message: `Email already taken` };
  }
  if (usernameExists) {
    return { success: false, message: `Username already taken` };
  }

  return { success: true };
}

async function resetLibrarianPasswordService(id, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const query = `UPDATE library_staffs SET password = ? WHERE id = ?`;
  const [result] = await pool.query(query, [hashedPassword, id]);

  if (result.affectedRows === 0) {
    return { success: false, message: "Librarian not found." };
  }

  return { success: true, message: "Password reset successfully." };
}

module.exports = { registerLibrarianToDb, resetLibrarianPasswordService };
