//
//
//

//  ************************RESERVATIONS IMPORT **************************

const { cancelReservationService, fulfillReservationService, removeReservationService } = require(
  `../Services/reservationServiceFolder/reservation.update.service`,
);

const { recordReservation } = require(
  `../Services/reservationServiceFolder/reservation.create.service`,
);

const {
  checkIfStudentIdExist,
  checkIfStudentAlreadyReservedBook,
  checkIfStudentAlreadyBorrowedTheBook,
  checkIfBookHasAvailableCopies,
  getAllBooksWithZeroAvailableCount,
  getAllReservationsDetails,
  getReservationsPage,
} = require(`../Services/reservationServiceFolder/reservation.read.service`);

// *******************************************************************
//
//
// ************************** BORROW IMPORT************************
const { borrowServiceFunction } = require(
  `../Services/borrowServiceFolder/borrow.service`,
);

const { getAllBorrowRecords, getBorrowRecordsPage } = require(
  `../Services/borrowServiceFolder/borrow.read`,
);

const {
  markBookCopyAsReturned,
  markBookCopyAsDamagedServiceFunction,
  markBookCopyAsLostServiceFunction,
  settleBorrowPaymentService,
} = require("../Services/borrowServiceFolder/borrow.update");
// *******************************************************************
//
//
//***************************************************************
// <<<<<<<<<<<<<<<<<<___CONTROLLER FUNCTIONS___>>>>>>>>>>>>>>>>>>
//***************************************************************

//--------------------
// SENDING BORROW FORM
//--------------------

async function sendBorrowPage(req, res) {
  res.render("transactionViews/borrowPage", {});
}

//--------------------
// PROCESSING BORROW
//--------------------

async function borrowBook(req, res) {
  try {
    const borrowResult = await borrowServiceFunction(req.body);

    if (borrowResult.success) {
      console.log(`Burrow transaction success`);
      return res
        .status(200)
        .json({ success: true, message: `Borrow transaction sucess!` });
    } else {
      console.log(`Borrow transaction failed ${borrowResult.message}`);
      return res
        .status(400)
        .json({ success: false, message: borrowResult.message });
    }
  } catch (error) {
    console.log(`TRANSACTION CONTROLLER ERR MESSAGE:`);
    console.log(error.message);
    res.status(500).json({ success: false, message: `Server Error` });
  }
}

async function viewBorrowRecords(req, res) {
  try {
    const {
      q = "",
      view = "actionable",
      payment = "all",
      overdue = "0",
      page = "1",
    } = req.query;

    const result = await getBorrowRecordsPage({
      q,
      view,
      payment,
      page,
      pageSize: 10,
    });

    return res.render("transactionViews/viewAllBorrowRecords", {
      records: result.rows,
      pagination: result.pagination,
      filters: { q, view, payment },
    });
  } catch (error) {
    console.log("viewBorrowRecords ERROR:", error.message);
    return res.status(500).send("Server error loading borrow records.");
  }
}

async function returnBook(req, res) {
  console.log("Return book function called");
  console.log(req.body);

  try {
    await markBookCopyAsReturned(req.body.bookCopyId);
    res
      .status(200)
      .json({ success: true, message: `BOOK HAS BEEN RETURNED SUCCESSFULLY` });
  } catch (error) {
    console.log(`TRANSACTION CONTROLLER: RETURN_BOOK(): ERROR`);
    console.log(error.message);
    res.status(400).json({
      success: false,
      message: `SERVER HAS PROBLEM PROCESSING RETURN TRANSACTION`,
    });
  }
}

async function settlePaymentController(req, res) {
  try {
    const { borrowId } = req.body;

    if (!borrowId) {
      return res
        .status(400)
        .json({ success: false, message: "borrowId is required" });
    }

    const result = await settleBorrowPaymentService(borrowId);
    return res.json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error settling payment.` });
  }
}

// ************************** RESERVATION CONTROLLERS

async function sendReservationPage(req, res) {
  try {
    const {
      search = "",
      status = "",
      page = "1",
      pageSize = "10",
    } = req.query;

    const booksWithZeroAvailableCount = await getAllBooksWithZeroAvailableCount();
    const result = await getReservationsPage({
      search,
      status,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });

    res.render(`transactionViews/reservationPage`, {
      reservations: result.rows,
      books: booksWithZeroAvailableCount,
      filters: {
        search,
        status,
        pageSize,
      },
      pagination: result.pagination,
    });
  } catch (error) {
    console.log(`TRANSACTION CONTROLLER: sendReservationPage: ERROR`);
    console.log(error.message);
    return res.status(500).send("Server error loading reservation page.");
  }
}

async function reserveBook(req, res) {
  const intBookId = Number(req.body.bookId);
  req.body.bookId = intBookId;

  try {
    const bookHasAvailableCopies = await checkIfBookHasAvailableCopies(intBookId);
    if (bookHasAvailableCopies) {
      return res.json({
        success: false,
        message: `This book still has available copies. Reservation is only allowed when all copies are borrowed.`,
      });
    }

    const studentExist = await checkIfStudentIdExist(req.body);
    const studentAlreadyReservedBook = await checkIfStudentAlreadyReservedBook(req.body);
    const studentAlreadyBorrowedBook = await checkIfStudentAlreadyBorrowedTheBook(req.body);

    if (studentAlreadyBorrowedBook) {
      return res.json({ success: false, message: `STUDENT HAS ALREADY BORROWED THIS BOOK` });
    }

    if (studentAlreadyReservedBook) {
      return res.json({ success: false, message: `STUDENT HAS ALREADY RESERVED THIS BOOK` });
    }

    if (!studentExist) {
      return res.json({ success: false, message: `STUDENT ID DOES NOT EXIST` });
    }

    await recordReservation(req.body);
    return res.json({ success: true, message: `RESERVATION SUCCESSFUL` });

  } catch (error) {
    console.log(`TRANSACTION CONTROLLER, RESERVE_BOOK()`);
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// ----------------------------------
// RESERVATION: CANCEL, FULFILL, REMOVE
// ----------------------------------
async function cancelReservation(req, res) {
  try {
    const result = await cancelReservationService(req.params.id);

    return res.json({
      success: true,
      message: result?.message || "Reservation cancelled successfully.",
    });
  } catch (error) {
    console.log("cancelReservation ERROR:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function fulfillReservation(req, res) {
  try {
    await fulfillReservationService(req.params.id);

    return res.json({
      success: true,
      message: "Fulfill request received",
    });
  } catch (error) {
    console.log(`TRANSACTION CONTROLLER, FULFILL RESERVATION: ERROR`);
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

async function removeReservation(req, res) {
  try {
    const result = await removeReservationService(req.params.id);
    return res.json({
      success: true,
      message: result?.message || "Reservation removed successfully.",
    });
  } catch (error) {
    console.log("removeReservation ERROR:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function markCopyAsLost(req, res) {
  try {
    const { bookCopyId } = req.body;
    const result = await markBookCopyAsLostServiceFunction(bookCopyId);
    res.json(result);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

async function markCopyAsDamaged(req, res) {
  try {
    const { bookCopyId } = req.body;
    const result = await markBookCopyAsDamagedServiceFunction(bookCopyId);
    res.json(result);
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

module.exports = {
  sendBorrowPage,
  borrowBook,
  viewBorrowRecords,
  returnBook,
  sendReservationPage,
  reserveBook,
  cancelReservation,
  fulfillReservation,
  removeReservation,
  markCopyAsDamaged,
  markCopyAsLost,
  settlePaymentController,
};