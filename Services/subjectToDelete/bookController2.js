// // const {
// //   checkIsbn,
// //   checkTitle,
// //   getAllBooksFromDb,
// //   searchBooks,
// // } = require("../Services/books/book.read.service");

// // const { deleteBookFromDb } = require("../Services/books/book.write.service");
// // const {
// //   updateBookService,
// //   getBookForUpdate,
// // } = require("../Services/books/book.update.service");

// // const { addBookToDb } = require("../Services/book.service.AddBook");

// // //---------------SENDING FORM PAGE FOR ADDING BOOKS
// // exports.sendForm = (req, res) => {
// //   res.render("addBookForm", {});
// // };

// // exports.addNewBook = async (req, res) => {
// //   try {
// //     // CHECKING ISBN AND TITLE. IF THE ISBN OR TITLE
// //     // OR BOTH EXIST ERROR OBJECTS GETS A NEW PROPERTY
// //     // AND BOOM! REQ. FAILED TO ADD NEW BOOK
// //     const error = {};
// //     try {
// //       const isbnExist = await checkIsbn(req.body);
// //       if (isbnExist) {
// //         error.isbnExist = true;
// //       }
// //     } catch (error) {
// //       console.log("\n\n");
// //       console.log("CHECKISBN() ERROR:");
// //       console.log(error);
// //     }

// //     try {
// //       const titleExist = await checkTitle(req.body);
// //       if (titleExist) {
// //         error.titleExist = true;
// //       }
// //     } catch (error) {
// //       console.log("\n\n");
// //       console.log("CHECKTITLE() ERROR:");
// //       console.log(error);
// //     }

// //     if (Object.keys(error).length > 0) {
// //       res.status(400).json({
// //         success: false,
// //         error,
// //       });
// //       return;
// //     }

// //     //------------------------------------
// //     // CALLING A FUNCTION FROM BOOK SERVICE
// //     //------------------------------------

// //     // ADDING THE BOOK TO DB
// //     try {
// //       // addBookToDb REGISTERS THE NEW BOOK & SPITS OUT
// //       // REJECTED COPIES
// //       if (req.file) {
// //         req.body.bookPhotoFilePath = req.file.path;
// //       }
// //       const failedCopies = await addBookToDb(req.body);
// //       res.json({
// //         success: true,
// //         message: "NEW BOOK ADDED SUCCESSFULLY",
// //         failedCopies,
// //       });
// //     } catch (error) {
// //       res.status(400).json({ success: false, message: error.message });
// //       console.log("\n\n");
// //       console.log("ADD BOOK TO DB ERROR:");
// //       console.log(error);
// //     }

// //     // LOGGING STUFF
// //     (() => {
// //       //----------
// //       // LOGGING THE REQ BODY
// //       //----------

// //       console.log("\n\n");
// //       console.log(`----------BOOK CONTROLLER, THE REQ BODY`);
// //       console.log(req.body);

// //       //----------
// //       // LOGGING THE RESULT
// //       //----------
// //     })();
// //   } catch (error) {
// //     console.log("\n\n\n");
// //     console.log(`BOOK CONTROLLER, ADD_NEW_BOOK() CATCH ERROR MESSAGE:`);
// //     console.log(error);
// //     res.status(400).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// // //----------------
// // // UPDATES
// // //----------------
// // exports.sendUpdateForm = async (req, res) => {
// //   try {
// //     const book = await getBookForUpdate(req.params.id);
// //     res.render("updateBookForm", book);
// //   } catch (error) {
// //     console.log("\n\n");
// //     console.log(`----------BOOK CONTROLLER, SEND_UPDATE_FORM(), ERROR:`);
// //     console.log(error);
// //     res.json({ success: false, message: error.message });
// //   }
// // };

// // // THIS ONE JUST CALLS THE UPDATEBOOKSERVICE FUNCTION
// // // AND LOGGING THINGS
// // // I SHOULD RENAME THIS INTO UPDATEBOOK
// // exports.evaluateUpdateForm = async (req, res) => {
// //   if (req.file) {
// //     req.body.bookPhotoFilePath = req.file.path;
// //   }

// //   // JUST LOGGING THINGS
// //   (() => {
// //     console.log("\n\n\n");
// //     console.log(`CONTROLLER HAS RECIEVED THE UPDATE FORM `);
// //     console.log(`BOOK CONTROLLER, REQ.BODY: `);
// //     console.log(req.body);
// //     console.log(req.file);
// //   })();

// //   try {
// //     const result = await updateBookService(req.params.id, req.body);

// //     //LOGGING AND RESPONDING
// //     console.log("\n\n\n");
// //     console.log(`BOOK UPDATED SUCCESSFULLY`);
// //     res.json({ success: true, message: "BOOK UPDATED SUCCESSFULLY" });
// //   } catch (error) {
// //     // LOGGING THE ERROR AND RESPONDING

// //     // LOGGING AND SENDING AN ERROR
// //     (() => {
// //       console.log("\n\n\n'");
// //       console.log(`-------------EVALUATE UPDATE FORM, CATCH ERRROR MESSAGE:`);
// //       console.log(error.message);
// //       res.status(400).json({
// //         success: false,
// //         message: error.message,
// //       });
// //     })();
// //   }
// // };

// // //---------------------
// // // READ
// // //---------------------
// // // TO DISPLAY ALL THE BOOKS TO VIEW BOOK PAGE
// // exports.getAllBooks = async (req, res) => {
// //   //
// //   try {
// //     const books = await getAllBooksFromDb(); // What is this, why naay ()? A FUNCTION

// //     res.render("getAllBooks.ejs", { book: books });
// //   } catch (error) {
// //     console.log(`${"\n\n"}-------------`);
// //     console.log(`BOOK CONTROLLER, GET_ALL_BOOKS() CATCH ERR MESSAGE:`);
// //     console.log(error.message);
// //     res.status(400).json({ message: "ERROR IN RETRIEVING BOOKS" });
// //   }
// // };

// // exports.getSearchedBook = async (req, res) => {
// //   //

// //   try {
// //     const results = await searchBooks(req.query.q);
// //     res.json({
// //       books: results,
// //     });
// //   } catch (error) {
// //     //
// //     console.log(`BOOK CONTROLLER, GET SEARCHED BOOK() CATCH ERR MESSAGE:`);
// //     console.log(error.message);
// //     //
// //     return res
// //       .status(400)
// //       .json({ message: "ERROR IN GETTING THE SEARCHED  BOOK" });
// //   }
// // };

// // exports.viewBook = async (req, res) => {
// //   try {
// //     const bookId = req.params.id;

// //     // I just reused this function because
// //     // it returns the desired output
// //     const result = await getBookForUpdate(bookId);

// //     const book = result.book;
// //     const bookCopies = result.bookIdArray;
// //     console.log(`THIS IS THE BOOK BEING VIEWED`);
// //     console.log(book);
// //     console.log(`THESE ARE ITS COPIES`);
// //     console.log(bookCopies);

// //     res.render("viewABook", { book, bookCopies });
// //   } catch (error) {
// //     console.error("VIEW BOOK ERROR:", error.message);
// //     res.status(404).send(error.message);
// //   }
// // };

// // //---------------------
// // // DELETE
// // //---------------------

// // exports.deleteBook = async (req, res) => {
// //   try {
// //     const book = { id: req.params.id };
// //     await deleteBookFromDb(book);
// //     res.json({ success: true, message: "BOOK DELETED SUCCESSFULLY" });
// //   } catch (error) {
// //     console.log("\n\n");
// //     console.log(`BOOK CONTROLLER, DELETE_BOOK() CATCH ERROR MESSAGE:`);
// //     console.log(error.message);
// //     res.status(400).json({ success: false, message: error.message });
// //   }
// // };
