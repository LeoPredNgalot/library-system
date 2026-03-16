
//
//
// //
// function requireLogin(req, res, next) {
//   if (!req.session.user) {
//     return res.status(401).send("Please log in");
//   }
//   next();
// }

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect("/librarian/login");
  }

  next();
}

module.exports = { requireLogin };