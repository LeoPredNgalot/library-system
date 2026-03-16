//
//
//

const { isStudentEmailExisting, isStudentIdExisting } = require(
  `./user.checkExistingRecord.service`,
);

const { getTheStudentFromDb } = require("./user.read.service");

const { pool } = require("../../DB/pool");

async function checkTheUpdateFormForChanges(payload) {
  const {
    id,
    studentId,
    studentFirstName,
    studentLastName,
    studentGrade,
    studentSection,
    studentEmail,
    studentContactNumber,
  } = payload;

  console.log(`STUDENT ID: ${studentId}`);
  console.log(`ID: ${id}`);

  const existingStudentRecord = await getTheStudentFromDb(id);

  const setClauses = [];
  const values = [];

  const emailExist     = await isStudentEmailExisting(studentEmail);
  const studentIdExist = await isStudentIdExisting(studentId);

  // Student ID
  if (studentId !== existingStudentRecord.student_id) {
    if (!studentIdExist) {
      setClauses.push(`student_id = ?`);
      values.push(studentId);
      console.log(`STUDENT ID HAS CHANGED`);
    } else {
      console.log(`ID NUMBER ALREADY EXIST`);
    }
  }

  // First Name
  if (studentFirstName !== existingStudentRecord.first_name) {
    setClauses.push(`first_name = ?`);
    values.push(studentFirstName);
    console.log(`FIRST NAME HAS CHANGED`);
  }

  // Last Name
  if (studentLastName !== existingStudentRecord.last_name) {
    setClauses.push(`last_name = ?`);
    values.push(studentLastName);
    console.log(`STUDENT LAST NAME HAS CHANGED`);
  }

  // Grade
  if (String(studentGrade) !== String(existingStudentRecord.grade)) {
    setClauses.push(`grade = ?`);
    values.push(studentGrade);
    console.log(`STUDENT GRADE HAS CHANGED`);
  }

  // Section
  if (studentSection !== existingStudentRecord.section) {
    setClauses.push(`section = ?`);
    values.push(studentSection);
    console.log(`STUDENT SECTION HAS CHANGED`);
  }

  // Email
  if (studentEmail !== existingStudentRecord.email) {
    if (emailExist) {
      console.log(`EMAIL ALREADY EXISTS – UPDATE SKIPPED`);
    } else {
      setClauses.push(`email = ?`);
      values.push(studentEmail);
      console.log(`STUDENT EMAIL HAS CHANGED`);
    }
  }

  // Contact Number
  const newContact      = studentContactNumber || null;
  const existingContact = existingStudentRecord.contact_number || null;
  if (newContact !== existingContact) {
    setClauses.push(`contact_number = ?`);
    values.push(newContact);
    console.log(`STUDENT CONTACT NUMBER HAS CHANGED`);
  }

  // Apply updates
  if (setClauses.length > 0) {
    values.push(existingStudentRecord.student_id);
    const updateQuery = `UPDATE students SET ${setClauses.join(", ")} WHERE student_id = ?`;
    console.log(`RUNNING QUERY: ${updateQuery}`);
    console.log(`VALUES:`, values);
    const updateResult = await pool.query(updateQuery, values);
    console.log(`UPDATE RESULT:`, updateResult);
  } else {
    console.log(`NO CHANGES DETECTED — NOTHING TO UPDATE`);
  }
}

module.exports = {
  checkTheUpdateFormForChanges,
};