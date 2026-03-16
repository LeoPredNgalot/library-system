//
//
//
const { z } = require("zod");

const studentSchema = z.object({

  studentId: z
    .string()
    .trim()
    .regex(/^\d{7}$/, "Student ID must be exactly 7 digits"),

  studentFirstName: z
    .string()
    .trim()
    .min(2, "First name must contain at least 2 characters"),

  studentLastName: z
    .string()
    .trim()
    .min(2, "Last name must contain at least 2 characters"),

  studentGrade: z.string().trim().min(1, "Student grade cannot be empty"),

  studentSection: z
    .string()
    .trim()
    .min(4, "Student section must contain at least 4 characters"),

  studentEmail: z
    .string()
    .trim()
    .min(4, "Student email must contain at least 4 characters"),

  studentContactNumber: z
    .string()
    .trim()
    .min(4, "Student contact number must contain at least 4 characters")
    .optional(),
});

module.exports = { studentSchema };
