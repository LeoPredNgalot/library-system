//
//
//
const { z } = require("zod");

// REMEMBER THE PROPERTY NAMES HERE
// ARE EQUAL SA FORMDATA PROPERTY NAME
const borrowForm = z.object({
  //

  studentId: z
    .string()
    .trim()
    .min(2, `Student ID must contain at least 2 cahracters`),

  bookCopyId: z
    .string()
    .trim()
    .min(4, `Book Copy ID must contain at least 2 cahracters`),
});

module.exports = { borrowForm };
