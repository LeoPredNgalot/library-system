//
//
//

const express = require("express");
const router = express.Router();

//****************
// REQUIRE LOGIN
//****************
const { requireLogin } = require("../Middlewares/requireLogin");
router.use(requireLogin);


const transactionController = require("../Controllers/transactionsController");

router.get(`/borrow`, transactionController.viewBorrowRecords);

router.post(`/borrow`, transactionController.borrowBook);

router.get(`/view-all-borrow-records`, transactionController.viewBorrowRecords);

router.post(`/return-book`, transactionController.returnBook);

//-----------------------
// RESERVATION
//-----------------------

router.get(`/reservation`, transactionController.sendReservationPage);

router.post(`/reservation`, transactionController.reserveBook);

router.post(`/reservation/cancel/:id`, transactionController.cancelReservation);

router.post(`/reservation/fulfill/:id`, transactionController.fulfillReservation);

// ✅ ADDED: Remove a fulfilled/expired/cancelled reservation record
router.delete(`/reservation/remove/:id`, transactionController.removeReservation);

router.post("/report-lost-book", transactionController.markCopyAsLost);

router.post("/report-damaged-book", transactionController.markCopyAsDamaged);

router.post("/settle-payment", transactionController.settlePaymentController);

module.exports = router;
