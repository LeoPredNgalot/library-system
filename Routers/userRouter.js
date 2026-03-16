//
//
//
const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");
//
const upload = require("../Middlewares/upload");
const { normalizeBody } = require("../Middlewares/normalizeBody");
const validateSchema = require("../Middlewares/validateSchema");
const { studentSchema } = require("../Schemas/userRegistration.schema");
const { studentUpdateSchema } = require("../Schemas/userUpdate.schema");

//****************
// REQUIRE LOGIN
//****************
const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);

//---------------------------------
// USER MEANS BORROWER
//---------------------------------

router.get("/registration", userController.userRegistrationForm);

router.get("/view-all-users", userController.getAllUsers);

// ✅ MUST be before /update/:id to avoid :id catching "search"
router.get("/search", async (req, res) => {
  try {
    const { pool } = require("../DB/pool");
    const q    = req.query.q || "";
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT student_id, first_name, last_name, grade, section
       FROM students
       WHERE student_id LIKE ? OR first_name LIKE ? OR last_name LIKE ?
       ORDER BY student_id ASC
       LIMIT 10`,
      [like, like, like]
    );
    res.json({ students: rows });
  } catch (error) {
    console.log("Student search error:", error.message);
    res.status(500).json({ students: [] });
  }
});

router.post(
  "/registration",
  upload.none(),
  normalizeBody,
  validateSchema.validate(studentSchema),
  userController.registerUser,
);

router.get("/update/:id", userController.userUpdateForm);

router.patch(
  "/update/:id",
  upload.none(),
  normalizeBody,
  validateSchema.validate(studentUpdateSchema),  
  userController.updateUser,
);

router.delete("/delete/:id", userController.deleteUser);

module.exports = router;






































