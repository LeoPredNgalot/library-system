//
//
//
// THIS FILE WAS CREATED TO EDIT THE DETAILS OF THE ADMINS
// THESE ARE THE ADMINS
// zike01 - zike123
// kirk123 - kirk123

const bcrypt = require("bcrypt");
const { pool } = require(`../Lib_system/DB/pool`);

//---------------------------
//
//---------------------------

async function changePassword(userName, plainPassword) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const query = `
    UPDATE library_staffs
    SET password = ?
    WHERE user_name = ?
  `;

  const [result] = await pool.execute(query, [hashedPassword, userName]);

  console.log(result);
}

changePassword("kirk123", "kirk123");

//---------------------------
//
//---------------------------

async function changeUsername(oldUserName, newUserName) {
  const query = `
    UPDATE library_staffs 
    SET user_name = ? 
    WHERE user_name = ?
  `;

  const [result] = await pool.execute(query, [newUserName, oldUserName]);
  console.log(result);
}

changeUsername("admin2", "kirk123");

//---------------------------
//
//---------------------------
async function changeFirstNameLastName(username, firstName, lastName) {
  const query = `
    UPDATE library_staffs 
    SET first_name = ?, last_name = ?
    WHERE user_name = ?
  `;

  const [result] = await pool.execute(query, [firstName, lastName, username]);
  console.log(result);
}

changeFirstNameLastName(`admin2`, `Kirk Vincent,`, `Abellana`);
