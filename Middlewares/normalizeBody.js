// THE USE OF THIS FILE IS TO CONVERT THE EMPTY FIELDS
// INTO `UNDEFINED`, BECAUSE WHEN THE USER JUST LEAVE
// OUT A FIELD WITHOUT INPUTTING ANYTHING IT AUTOMATICALLY
// GETS CONVERTED INTO ---> '', WHICH DOES NOT MEAN `NO VALUE`
//
// ALSO HANDLES:
// - Title Case formatting for name/text fields
// - Numeric-only enforcement for ID and ISBN fields

// ── Helpers ──────────────────────────────────────────────
function toTitleCase(str) {
  if (typeof str !== "string") return str;
  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toNumericOnly(str) {
  if (typeof str !== "string") return str;
  return str.replace(/\D/g, ""); // strip all non-digit characters
}

// Fields that should be Title Cased
const TITLE_CASE_FIELDS = new Set([
  // Books
  "bookTitle",
  "bookAuthor",
  "bookPublisher",
  "bookLocation",

  // Students
  "studentFirstName",
  "studentLastName",
  "studentSection",

  // Librarians
  "librarianFirstName",
  "librarianLastName",
]);

// Fields that should be numeric only
const NUMERIC_ONLY_FIELDS = new Set([
  "bookIsbn",
  "studentId",
]);

// ── Middleware ────────────────────────────────────────────
function normalizeBody(req, res, next) {
  if (!req.body || typeof req.body !== "object") {
    return next();
  }

  for (const key in req.body) {
    const value = req.body[key];

    // Skip arrays and non-strings
    if (Array.isArray(value) || typeof value !== "string") continue;

    // Convert empty strings to undefined
    if (value.trim() === "") {
      req.body[key] = undefined;
      continue;
    }

    // Apply Title Case
    if (TITLE_CASE_FIELDS.has(key)) {
      req.body[key] = toTitleCase(value);
      continue;
    }

    // Apply numeric-only stripping
    if (NUMERIC_ONLY_FIELDS.has(key)) {
      req.body[key] = toNumericOnly(value);
      continue;
    }
  }

  next();
}

module.exports = { normalizeBody };
