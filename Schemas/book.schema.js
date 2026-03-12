//
//
const { z } = require("zod");

//---------------------------------------------
// DEFINE KUNG UNSAY MGA PROPERTIES ANG MANDATORY
// BUTGAG INPUT, AND WHAT ARE NOT
//---------------------------------------------

const bookSchema = z
  .object({
    //
    bookIsbn: z
      .string()
      .trim()
      .min(4, "ISBN must contain atleast 4 characters")
      .optional(),

    bookTitle: z
      .string()
      .trim()
      .min(4, "Book title is required, and must contain at least 4 characters"),

    bookAuthor: z
      .string()
      .trim()
      .min(4, "Author is required, and must contain at least 4 characters"),

    bookGenre: z.string().trim().optional(),

    bookPublisher: z
      .string()
      .trim()
      .min(4, "Book publisher must contain at least 4 characters")
      .optional(),

    bookPublisher: z
      .string()
      .trim()
      .min(4, "Book publisher must contain at least 4 characters")
      .optional(),

    bookCopyIds: z
      .array(
        z.string().trim().min(4, "Book id must contain at least 4 characters"),
      )
      .optional(),

    bookLocation: z
      .string()
      .trim()
      .min(4, `Book's location must contain at least 4 characters`)
      .optional(),

    bookYearPublished: z.coerce.number().int().min(1901).max(2155).optional(),
  })
  .passthrough();

const bookUpdateSchema = z
  .object({
    bookTitle: z
      .string()
      .trim()
      .min(4, "BookTitle is must contain at least 4 characters"),

    bookAuthor: z
      .string()
      .trim()
      .min(4, "Author must contain atleast 4 characters"),

    bookGenre: z.string().trim().optional(),
    bookIsbn: z
      .string()
      .trim()
      .min(4, "ISBN must contain at least4 characters")
      .optional(),
    bookPublisher: z.string().trim().optional(),

    // THESE ADDITIONALS NEED TO BE AN ARRAY. PERIOD
    //  newBookCopies, bookCopiesToDelete, bookCopiesToUpdate
    newBookCopies: z
      .array(
        z.string().min(4, `New book copy id must be at least 4 characters`),
      )
      .optional(),

    bookCopiesToRemove: z
      .array(
        z.string().min(4, `Book id to be remove must be at least 4 characters`),
      )
      .optional(),

    bookCopiesToBeMarkAsLost: z.array(z.string().min(4)).optional(),
    bookCopiesToBeMarkasDamage: z.array(z.string().min(4)).optional(),

    listOfCopyToBeFound: z.array(z.string().min(4)).optional(),
    listOfCopyToBeRepaired: z.array(z.string().min(4)).optional(),
  })
  .passthrough();
module.exports = { bookSchema, bookUpdateSchema };
