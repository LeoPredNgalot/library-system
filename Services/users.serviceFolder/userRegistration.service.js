//
//
//

const { isStudentEmailExisting, isStudentIdExisting } = require(
  `./user.checkExistingRecord.service`,
);

const { pool } = require("../../DB/pool");
const { toTitleCase, toNumericOnly } = require('../formatUtils');

async function registerUserToDb(payload) {
  const data = {
    student_id:     toNumericOnly(payload.studentId),
    first_name:     toTitleCase(payload.studentFirstName),
    last_name:      toTitleCase(payload.studentLastName),
    grade:          payload.studentGrade,
    section:        toTitleCase(payload.studentSection),
    email:          payload.studentEmail,
    contact_number: payload.studentContactNumber,
  };

  try {
    const existingInfo = await checkUserCredentials(payload);

    if (!existingInfo.success) {
      console.log(`EXISTING INFO: ${existingInfo.message}`);
      return { success: false, message: existingInfo.message };
    }

    const query = `INSERT INTO students SET ?`;
    await pool.query(query, data);
    const message = `SUCCESSFULLY REGISTERED NEW USER`;
    console.log(message);
    return { success: true, message };

  } catch (error) {
    console.log(`USER.REG.SERVICE ERROR REGISTERING THE NEW USER:`);
    console.log(error.message);
    return { success: false, message: error.message };
  }
}

async function checkUserCredentials(payload) {
  const { studentEmail, studentId } = payload;

  try {
    const studentEmailExists = await isStudentEmailExisting(studentEmail);
    const studentIdExists    = await isStudentIdExisting(studentId);

    if (studentEmailExists && studentIdExists) {
      return { success: false, message: `Email and ID already exists` };
    } else if (studentEmailExists) {
      return { success: false, message: `Email already exists` };
    } else if (studentIdExists) {
      return { success: false, message: `ID already exists` };
    }

    return { success: true, message: `No duplicate credentials` };
  } catch (error) {
    console.log(`ERROR CHECKING CREDENTIALS`);
    console.log(error.message);
    throw error;
  }
}

module.exports = { registerUserToDb, checkUserCredentials };
