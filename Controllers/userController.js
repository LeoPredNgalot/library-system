//
//
//---------------
// FOR WRITING
//---------------

const {
  registerUserToDb,
} = require("../Services/users.serviceFolder/userRegistration.service");

const {
  checkTheUpdateFormForChanges,
} = require("../Services/users.serviceFolder/user.checkUpdateForm");

//---------------
// FOR READING
//---------------

const {
  getTheStudentFromDb, // TEMPORARY
  getPaginatedStudentsFromDb,
} = require(`../Services/users.serviceFolder/user.read.service`);

//---------------
// FOR DELETING
//---------------

const {
  deleteStudentFromDb,
} = require("../Services/users.serviceFolder/user.deleteUser.service");

//-----------------
// REGISTRATION
//-----------------

exports.userRegistrationForm = (req, res) => {
  console.log(`USER REGISTRATION REQ WAS RECEIVED`);
  res.render("userViews/userRegistrationForm");
};

//-----------------
// CREATE USER
//-----------------

exports.registerUser = async (req, res) => {
  try {
    const result = await registerUserToDb(req.body);

    if (result.success) {
      return res.json({
        success: true,
        message: "New user has been successfully registered ",
      });
    }

    res.json({ success: false, message: result.message });
  } catch (error) {
    console.log(`ERROR SA CONTROLLER`);
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//-----------------
// SEND UPDATE FORM
//-----------------

exports.userUpdateForm = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await getTheStudentFromDb(studentId);
    res.render("userViews/userUpdateForm", { student });
  } catch (error) {
    res.status(201).json({
      success: false,
      message: `USER CONTROLLER: ERROR GETTING THE STUDENT`,
    });
  }
};

//-------------------
// SHOW/READ ALL USERS
//-------------------
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    let grade = req.query.grade || "";
    let section = req.query.section || "";
    const search = req.query.search || "";

    if (!grade) section = "";

    const { students, total } = await getPaginatedStudentsFromDb({
      page,
      limit,
      grade,
      section,
      search,
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.render("userViews/viewAllUsers", {
      students,
      currentPage: page,
      totalPages,
      total,
      filters: { grade, section, search },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ERROR FETCHING USERS",
    });
  }
};

//---------------------
// UPDATE USER
//---------------------
exports.updateUser = async (req, res) => {
  const id = req.params.id;
  req.body.id = id;

  console.log(`UPDATE REQUEST RECEIVED FOR STUDENT ID: ${id}`);
  console.log(`REQUEST BODY:`, req.body);

  try {
    const student = await getTheStudentFromDb(id);
    console.log(`CURRENT STUDENT INFO: `, student);

    const result = await checkTheUpdateFormForChanges(req.body);
    console.log(`UPDATE RESULT: `, result);

    res.json({
      success: true,
      message: `SUCCESSFULLY UPDATED THE STUDENT`,
    });
  } catch (error) {
    console.log(`UPDATE ERROR:`, error.message);
    console.log(error.stack);

    let message = `Problem occurred while updating student.`;

    if (error.message && error.message.includes(`foreign key constraint`)) {
      message = `Cannot change Student ID — this student has existing reservation or borrow records linked to their current ID. Update those records first, or leave the Student ID unchanged.`;
    }

    res.status(400).json({ success: false, message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await deleteStudentFromDb(req.params.id);
    console.log(`DELETE REQ WAS RECEIVED`);
    res.status(200).json({
      success: true,
      message: `DELETE REQ WAS RECEIVED`,
    });
  } catch (error) {
    res.json({ success: false, message: `ERROR OCCURED WHILE DELETING USER` });
    console.log(error.message);
  }
};