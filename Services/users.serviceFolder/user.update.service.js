//
//
//
const { pool } = require(`../../DB/pool`);
const { toTitleCase, toNumericOnly } = require("../formatUtils");

async function updateStudentId(student_id, updatedId) {
  try {
    const query = `UPDATE students SET student_id = ? WHERE student_id = ?`;
    await pool.query(query, [toNumericOnly(updatedId), student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT ID NUMBER`);
  }
}

async function updateStudentFirstName(student_id, updatedFirstName) {
  try {
    const query = `UPDATE students SET first_name = ? WHERE student_id = ?`;
    await pool.query(query, [toTitleCase(updatedFirstName), student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT FIRST NAME`);
  }
}

async function updateStudentLastName(student_id, updatedLastName) {
  try {
    const query = `UPDATE students SET last_name = ? WHERE student_id = ?`;
    await pool.query(query, [toTitleCase(updatedLastName), student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT LAST NAME`);
  }
}

async function updateStudentGrade(student_id, updatedGrade) {
  try {
    const query = `UPDATE students SET grade = ? WHERE student_id = ?`;
    await pool.query(query, [updatedGrade, student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT GRADE`);
  }
}

async function updateStudentSection(student_id, updatedSection) {
  try {
    const query = `UPDATE students SET section = ? WHERE student_id = ?`;
    await pool.query(query, [toTitleCase(updatedSection), student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT SECTION`);
  }
}

async function updateStudentEmail(student_id, updatedEmail) {
  try {
    const query = `UPDATE students SET email = ? WHERE student_id = ?`;
    await pool.query(query, [updatedEmail, student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT EMAIL`);
  }
}

async function updateStudentContactNumber(student_id, updatedContactNumber) {
  try {
    const query = `UPDATE students SET contact_number = ? WHERE student_id = ?`;
    await pool.query(query, [updatedContactNumber, student_id]);
  } catch (error) {
    throw new Error(`USER.UPDATE.FUNCTION: PROBLEM UPDATING THE STUDENT CONTACT NUMBER`);
  }
}

module.exports = {
  updateStudentId,
  updateStudentFirstName,
  updateStudentLastName,
  updateStudentGrade,
  updateStudentSection,
  updateStudentEmail,
  updateStudentContactNumber,
};
