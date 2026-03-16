function validateBook(req, res, next) {
  const result = bookSchema.safeParse(req.body);

  if (!result.success) {
    const formatted = result.error.format();
    return res.status(400).json({ errors: formatted });
  }
  req.body = result.data;
  next();
}

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log("❌ VALIDATION FAILED:");
      console.log("BODY RECEIVED:", req.body);        // see what was sent
      console.log("ERRORS:", result.error.format());  // see what failed
      return res.status(400).json({ message: result.error.format() });
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validateBook, validate }; 