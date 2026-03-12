//
//
//
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  //
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  //
  filename: (req, file, cb) => {
    //
    const ext = path.extname(file.originalname);
    const safeName = crypto.randomUUID();
    cb(null, `${safeName}${ext}`);
  },
});

//dapat ni naa size limit and file type

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG and GIF allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload; // <-- DEFAULT EXPORT, NOT { upload }
