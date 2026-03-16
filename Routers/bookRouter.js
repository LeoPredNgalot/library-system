//
//
//
const express = require("express");
const router = express.Router();
const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);

const bookController = require("../Controllers/bookController2");

const validateSchema = require("../Middlewares/validateSchema");
const upload = require("../Middlewares/upload");
const { bookSchema, bookUpdateSchema } = require("../Schemas/book.schema");

// THIS TO CONVERT EMPTY STRING TO `UNDEFINED`
const { normalizeBody } = require("../Middlewares/normalizeBody");

// CREATE:  ADD BOOK
router.get("/add", bookController.sendForm);

router.post(
  "/add",
  upload.single("bookPhoto"),
  normalizeBody,
  validateSchema.validate(bookSchema),
  bookController.addNewBook,
);

// READ: GET ALL BOOKS
router.get("/get-all-books", bookController.getAllBooks);

// SEARCHING SPECIFIC BOOK THIS ROUTE IS FOR BOOK SEARCH
router.get("/books", bookController.getSearchedBook);

// VIEW A BOOK
router.get(`/get/viewBook/:id`, bookController.viewBook);

// API: GET SINGLE BOOK AS JSON (used by inventory modal)
router.get("/api/:id", bookController.getBookApi);

// API: GET BOOK COPIES AS JSON (used by borrow form)
router.get("/api/copies/:id", bookController.getBookCopiesApi);

// RECOMMENDED BOOKS
router.get("/recommended-books", bookController.getRecommendedBooks);

// UPDATE: UPDATE BOOK
router.get("/update/:id", bookController.sendUpdateForm);

router.patch(
  "/update/:id",
  upload.single("bookPhoto"),
  normalizeBody,
  validateSchema.validate(bookUpdateSchema),
  bookController.evaluateUpdateForm,
);

// DELETE: DELETE BOOK
router.delete("/delete/:id", bookController.deleteBook);

module.exports = router;