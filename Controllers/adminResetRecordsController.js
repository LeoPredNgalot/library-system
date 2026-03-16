//
//
//
//
const bcrypt = require("bcrypt");
const {
  getLibrarianById,
} = require("../Services/librarian.service.Folder/librarian.service.read");

const {
  resetAllReservationsService,
  resetAllBorrowRecordsService,
  resetAllStudentsService,          // ✅ added
} = require("../Services/adminResetRecordsFolder/adminResetRecordsService");

async function adminDeleteAction(req, res) {
  console.log("ADMIN DELETE ACTION REQUEST:");
  console.log(req.body);

  try {
    const { action, password } = req.body;
    const adminId = req.session?.user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const admin = await getLibrarianById({ id: adminId });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: admin access only" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    console.log("ADMIN PASSWORD VERIFIED");
    console.log("ADMIN ROLE VERIFIED");
    console.log("ACTION:", action);

    switch (action) {
      case "reservations": {
        const result = await resetAllReservationsService();
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      case "borrows": {
        const result = await resetAllBorrowRecordsService();
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      case "students": {
        const result = await resetAllStudentsService();  // ✅ now implemented
        if (!result.success) return res.status(400).json(result);
        return res.status(200).json(result);
      }

      case "book-copies":
        console.log("Delete all book copies");
        break;

      case "books":
        console.log("Delete all book records");
        break;

      default:
        return res.status(400).json({ success: false, message: "Unknown delete action" });
    }

    return res.status(200).json({
      success: true,
      message: "Password verified. Admin request accepted.",
    });

  } catch (error) {
    console.log("ADMIN DELETE ACTION ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { adminDeleteAction };