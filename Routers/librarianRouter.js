const express = require("express");
const router = express.Router();
const librarianController = require(`../Controllers/librarianController`);
const { resetLibrarianPassword } = require(`../Controllers/librarianController`);

const upload = require("../Middlewares/upload");
const { normalizeBody } = require("../Middlewares/normalizeBody");
const { validate } = require("../Middlewares/validateSchema");
const {
  librarianSchema,
  updateLibrarianSchema,
} = require("../Schemas/librarianSchema");

//------------------------
// AUTH / LOGIN — unprotected
//------------------------
router.get(`/login`, librarianController.staffLoginForm);
router.post(`/login`, upload.none(), librarianController.staffLogin);

//------------------------
// LOGOUT — unprotected
//------------------------
router.get(`/logout`, librarianController.logout);

//****************
// REQUIRE LOGIN — everything below is protected
//****************
const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);

//------------------------
// ADMIN SETTINGS — now protected ✅
//------------------------
router.get(`/admin/settings`, librarianController.adminSettings);

//------------------------
// HOMEPAGES
//------------------------
router.get(`/homepage`, librarianController.librarianHomePage);
router.get(`/admin/homepage`, librarianController.adminHomepage);
router.get(`/profile/me`, librarianController.myProfile);

//------------------------
// REGISTRATION FORM
//------------------------
router.get(`/registration`, librarianController.librarianRegistrationForm);

//------------------------
// CREATE
//------------------------
router.post(
  `/register`,
  upload.none(),
  normalizeBody,
  validate(librarianSchema),
  librarianController.registerLibrarian,
);

//------------------------
// UPDATE
//------------------------
router.put(
  `/update/:id`,
  upload.none(),
  normalizeBody,
  validate(updateLibrarianSchema),
  librarianController.updateLibrarian,
);

//------------------------
// VIEW ALL
//------------------------
router.get(`/view-all-librarians`, librarianController.viewAllLibrarians);

//------------------------
// DELETE
//------------------------
router.delete(`/delete/:id`, librarianController.deleteLibrarian);

//------------------------
// PASSWORD RESET
//------------------------
router.post("/reset-password/:id", librarianController.resetLibrarianPassword);

//------------------------
// UPDATE MY PROFILE
//------------------------
router.put(
  `/updateMyProfile/:id`,
  upload.none(),
  normalizeBody,
  librarianController.updateMyProfile,
);

//------------------------------------
// ADMIN: RESETING THE LIBRARY RECORDS
//------------------------------------
const adminController = require("../Controllers/adminResetRecordsController");
router.post("/delete", adminController.adminDeleteAction);

module.exports = router;