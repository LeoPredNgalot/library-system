//
//
//THIS FILE SHOULD CONTAIN THE FUNCTIONS
// THAT READ STUDENT DETAILS

const { pool } = require("../../DB/pool");

async function getTheStudentFromDb(id) {
  //
  try {
    const query = `SELECT * FROM students WHERE student_id = ?`;
    const [rows] = await pool.query(query, [id]);
    const user = rows[0];

    return user;
  } catch (error) {
    console.log(`USER.READ.SERVICE,ERROR GETTING THE SPECIFIED STUDENT RECORD`);
    console.log(error.message);
    throw error;
  }
}
async function getPaginatedStudentsFromDb({
  page = 1,
  limit = 10,
  grade = "",
  section = "",
  search = "",
}) {
  const offset = (page - 1) * limit;

  let whereClauses = [];
  let values = [];

  if (grade) {
    whereClauses.push("grade = ?");
    values.push(grade);
  }

  if (section) {
    whereClauses.push("section = ?");
    values.push(section);
  }

  if (search) {
    whereClauses.push(`
      (
        student_id LIKE ?
        OR first_name LIKE ?
        OR last_name LIKE ?
        OR email LIKE ?
      )
    `);

    const searchValue = `%${search}%`;
    values.push(searchValue, searchValue, searchValue, searchValue);
  }

  const whereSQL = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  // Get paginated rows
  const dataQuery = `
    SELECT * FROM students
    ${whereSQL}
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM students
    ${whereSQL}
  `;

  const [rows] = await pool.query(dataQuery, [...values, limit, offset]);
  const [countRows] = await pool.query(countQuery, values);

  return {
    students: rows,
    total: countRows[0].total,
  };
}

module.exports = { getTheStudentFromDb, getPaginatedStudentsFromDb };
