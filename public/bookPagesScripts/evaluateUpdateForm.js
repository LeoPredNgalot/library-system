// /*

// THIS FILE CONTAINS(NOT YET) A FUNCTION
// THAT WILL SANITIZE/VALIDATE/CHECK THE
// INFORMATIONS INSIDE THE UPDATE FORM BEFORE
// MAKING THE NECESSARY UPDATES TO OUR BOOKS.

// ALSO THIS FUNCTIO WILL BE USED INSIDE THE
// CONTROLLER

// */

// async function evaluateUpdateForm(req, res) {
//   const id = req.params.id;

//   // JUST LOGGING THINGS
//   (() => {
//     console.log(`CONTROLLER HAS RECIEVED THE UPDATE FORM, REQ ID IS ${id}`);
//     console.log(`BOOK CONTROLLER, REQ.BODY: `);
//     console.log(req.body);
//     console.log(req.file);
//   })();

//   // DESTRUCTURING THE REQUEST BODY
//   const {
//     bookId,
//     bookTitle,
//     bookAuthor,
//     bookIsbn,
//     bookPublisher,
//     bookGenre,
//     bookLocation,
//     bookQty,
//     bookIds, // I should change this bitch ass' word
//     newBookCopies,
//   } = req.body;

//   // GETTING THE CORRESPONDING BOOK FROM THE DB
//   // DAPAT DILI NI CYA DIRI
//   const query = `SELECT * FROM books WHERE id=?`;
//   const [responseContent] = await pool.query(query, [bookId]);
//   console.log(`-----------BOOK CONTROLLER, BOOK FROM DB`);
//   console.log(responseContent[0]);

//   // DESTRUCTURING THE BOOK OBJ RESPONSE FROM DB
//   const {
//     title,
//     author,
//     isbn,
//     genre,
//     qty, // I am sure `quantit` ni cya dili qty
//     book_location,
//     publisher,
//     book_photo_file_path,
//   } = responseContent[0];

//   // COMPARING THE REQ BODY AND THE BOOK FROM ARRAY
//   if (bookTitle !== title) {
//     console.log(`------------------Title not same`);
//     try {
//       await updateTitle(bookTitle, id);
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   if (bookAuthor !== author) {
//     console.log(`----------------author not same`);
//     console.log(`${author} VS. ${bookAuthor}`);

//     try {
//       await updateAuthor(bookAuthor, id);
//     } catch (error) {
//       res.status(400).json({ success: true, message: error.message });
//     }
//   }

//   if (bookIsbn !== isbn) {
//     console.log(`-----------------isbn not same`);
//     console.log(`${isbn} VS. ${bookIsbn}`);

//     try {
//       await updateIsbn(bookIsbn, id);
//     } catch (error) {
//       res.status(400).json({ success: true, message: error.message });
//     }
//   }

//   if (bookGenre !== genre) {
//     try {
//       console.log(`-----------------genre not same`);
//       console.log(`${genre} VS. ${bookGenre}`);
//       await updateGenre(bookGenre, id);
//     } catch (error) {
//       res.status(400).json({ success: true, message: error.message });
//     }
//   }

//   if (bookPublisher !== publisher) {
//     console.log(`-----------------publisher not same`);
//     console.log(`${publisher} VS. ${bookPublisher}`);

//     try {
//       await updatePublisher(bookPublisher, id);
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   if (bookLocation !== book_location) {
//     console.log(`--------------------location not same`);
//     console.log(`${bookLocation} VS. ${book_location}`);

//     try {
//       await updateBookLocation(bookLocation, id);
//     } catch (error) {
//       console.log(`BOOK CONTOLLER: ERROR UPDATING BOOK LOCATION`);
//       console.log(error.message);
//       res.status(400).json({ success: false, message: error.message });
//     }
//   }

//   // IF NAAY SUD ANG NEWBOOKCOPY ARRAY, THEN ATONG GAMITUN SI ADDBOOKIDS

//   if (newBookCopies.length > 0) {
//     try {
//       const result = await addNewBookCopy(req.body, bookId);
//     } catch (error) {
//       console.log("/n/n/");
//       console.log(
//         `BOOK CONTROLLER, EVALUATE_UPDATE_FORM(), CATCH, ERROR MESSAGE`
//       );
//       return error.message;
//     }
//   }

//   //-------------
//   res.send({ success: true, message: "The server received the update req." });
// }

// module.exports = { evaluateUpdateForm };
