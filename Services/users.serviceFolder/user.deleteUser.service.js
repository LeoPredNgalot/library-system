//
//
//
const { pool } = require(`../../DB/pool`);

async function deleteStudentFromDb(id) {
  const query = `DELETE FROM students WHERE student_id = ?`;

  try {
    await pool.query(query, [id]);
  } catch (error) {
    console.log(`USER.DELETE.SERVICE: ${error.message}`);
    throw new Error(`USER.DELETE.SERVICE: ERROR DELETING STUDENT`);
  }
}

module.exports = { deleteStudentFromDb };
