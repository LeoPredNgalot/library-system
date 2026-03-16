//
//
//
const { z } = require("zod");

// REMEMBER THE PROPERTY NAMES HERE
// ARE EQUAL SA FORMDATA PROPERTY NAME
const librarianSchema = z.object({
  //

  librarianFirstName: z
    .string()
    .trim()
    .min(2, `First name must contain at least 2 cahracters`),

  librarianLastName: z
    .string()
    .trim()
    .min(2, `First name must contain at least 2 cahracters`),

  librarianUserName: z
    .string()
    .trim()
    .min(2, `Username must contain at least 2 cahracters`),

  librarianPassword: z
    .string()
    .trim()
    .min(8, `Password must contain at least 8 characters`),

  librarianEmail: z
    .string()
    .trim()
    .min(4, `Librarian email must contain at least 4 cahracters`),

  librarianContactNumber: z
    .string()
    .trim()
    .min(4, `Librarian contact number must contain at least 4 cahracters`)
    .optional(),
});

const updateLibrarianSchema = z
  .object({
    librarianFirstName: z.string().trim().min(2).optional(),
    librarianLastName: z.string().trim().min(2).optional(),
    librarianUserName: z.string().trim().min(2).optional(),
    librarianEmail: z.string().trim().min(4).optional(),
    librarianContactNumber: z.string().trim().min(4).optional(),
  })
  .passthrough();
// .refine((data) => Object.values(data).some((v) => v !== undefined), {
//   message: "At least one field must be provided for update.",
// });

module.exports = { librarianSchema, updateLibrarianSchema };
