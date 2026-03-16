const { z } = require("zod");

const studentUpdateSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  studentFirstName: z.string().min(1, "First name is required"),
  studentLastName: z.string().min(1, "Last name is required"),
  studentGrade: z.string().min(1, "Grade is required"),
  studentSection: z.string().min(1, "Section is required"),
  studentEmail: z.string().email("Invalid email format"),
  studentContactNumber: z.string().optional(),
});

module.exports = { studentUpdateSchema };