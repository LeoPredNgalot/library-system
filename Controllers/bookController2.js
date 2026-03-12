//
// BOOK CONTROLLER — fixed sendUpdateForm to prevent double sidebar
//

const { addNewBookCopy, addBookCopyId, addBookToDb } = require(
  `../Services/booksServiceFolder/books.service.create`,
);

const { removeBookCopy, removeCopies, deleteBookFromDb } = require(
  `../Services/booksServiceFolder/book.service.delete`,
);

const { updateBookService } = require(
  `../Services/booksServiceFolder/book.service.update`,
);

const { getRecommendedBooks } = require('../Services/booksServiceFolder/books.service.read');

const {
  getAllBooksFromDb,
  searchBooks,
  checkIsbn,
  checkTitle,
  getBookForUpdate,
} = require(`../Services/booksServiceFolder/books.service.read`);

exports.sendForm = (req, res) => {
  res.render("bookViews/addBookForm", {});
};

exports.addNewBook = async (req, res) => {
  try {
    const error = {};

    const isbnExist = await checkIsbn(req.body);
    if (isbnExist) error.isbnExist = true;

    const titleExist = await checkTitle(req.body);
    if (titleExist) error.titleExist = true;

    if (Object.keys(error).length > 0) {
      return res.status(400).json({ success: false, error });
    }

    try {
      if (req.file) req.body.bookPhotoFilePath = req.file.filename; // ✅ FIXED
      const failedCopies = await addBookToDb(req.body);
      res.json({ success: true, message: "NEW BOOK ADDED SUCCESSFULLY", failedCopies });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
      console.log("ADD BOOK TO DB ERROR:", error);
    }
  } catch (error) {
    console.log(`BOOK CONTROLLER, ADD_NEW_BOOK() CATCH ERROR:`, error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.sendUpdateForm = async (req, res) => {
  try {
    const book = await getBookForUpdate(req.params.id);
    res.render("bookViews/updateBookForm", { ...book, layout: false });
  } catch (error) {
    console.log(`BOOK CONTROLLER, SEND_UPDATE_FORM(), ERROR:`, error);
    res.json({ success: false, message: error.message });
  }
};

exports.evaluateUpdateForm = async (req, res) => {
  if (req.file) req.body.bookPhotoFilePath = req.file.filename; // ✅ FIXED

  try {
    const result = await updateBookService(req.params.id, req.body);
    console.log(`BOOK UPDATED SUCCESSFULLY`);
    res.json({ success: true, message: "BOOK UPDATED SUCCESSFULLY" });
  } catch (error) {
    console.log(`EVALUATE UPDATE FORM, CATCH ERROR:`, error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const page  = Number(req.query.page) || 1;
    const sort  = req.query.sort || "ASC";
    const genre = req.query.genre || null;

    const result = await getAllBooksFromDb({ page, limit: 6, sort, genre });

    res.render("bookViews/getAllBooks.ejs", { ...result, query: req.query });
  } catch (error) {
    console.log("GET_ALL_BOOKS ERROR:", error.message);
    res.status(400).json({ message: "ERROR IN RETRIEVING BOOKS" });
  }
};

exports.getSearchedBook = async (req, res) => {
  try {
    const results = await searchBooks(req.query.q);
    res.json({ books: results });
  } catch (error) {
    console.log(`BOOK CONTROLLER, GET_SEARCHED_BOOK() ERROR:`, error.message);
    res.status(400).json({ message: "ERROR IN GETTING THE SEARCHED BOOK" });
  }
};

exports.viewBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const result = await getBookForUpdate(bookId);
    const book = result.book;
    const bookCopies = result.bookIdArray;
    res.render("bookViews/viewABook", { book, bookCopies });
  } catch (error) {
    console.error("VIEW BOOK ERROR:", error.message);
    res.status(404).send(error.message);
  }
};

exports.getBookCopiesApi = async (req, res) => {
  try {
    const result = await getBookForUpdate(req.params.id);
    const bookCopies = result.bookIdArray || [];
    res.json({ success: true, bookCopies });
  } catch (error) {
    console.error("GET_BOOK_COPIES_API ERROR:", error.message);
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.getRecommendedBooks = async (req, res) => {
  try {
    const books = await getRecommendedBooks();
    res.json(books);
  } catch (error) {
    console.log('GET_RECOMMENDED_BOOKS ERROR:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = { id: req.params.id };
    await deleteBookFromDb(book);
    res.json({ success: true, message: "BOOK DELETED SUCCESSFULLY" });
  } catch (error) {
    console.log(`BOOK CONTROLLER, DELETE_BOOK() ERROR:`, error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};