//
//
//
const { pool } = require("../../DB/pool");

async function isStudentIdExisting(studentId) {
  try {
    const query = `SELECT EXISTS
    (SELECT 1 FROM students WHERE student_id  = ? ) AS existing_studentId`;
    const [result] = await pool.query(query, [studentId]);
    if (result[0].existing_studentId === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`USER.SERVICE.EMAIL-ID-CHECKER:`);
    console.log(`ERROR CHECKING THE STUDENT ID NUMBER`);
    console.log(error.message);
    throw new Error(`USER REG SERVICE: ERROR CHECKING THE STUDENT ID NUMBER`);
  }
}

async function isStudentEmailExisting(studentEmail) {
  try {
    const query = `
      SELECT EXISTS
      (SELECT 1 FROM students WHERE email = ?) AS existing_email
    `;
    const [result] = await pool.query(query, [studentEmail]);

    if (result[0].existing_email === 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(`ERROR CHECKING THE STUDENT EMAIL`);
    console.log(error.message);
    throw new Error(`USER REG SERVICE: ERROR CHECKING THE STUDENT EMAIL`);
  }
}

module.exports = { isStudentEmailExisting, isStudentIdExisting };
