  //
  // Shared formatting utilities
  //

  function toTitleCase(str) {
    if (!str || typeof str !== "string") return str;
    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function toNumericOnly(str) {
    if (!str || typeof str !== "string") return str;
    return str.replace(/\D/g, "");
  }

  module.exports = { toTitleCase, toNumericOnly };
