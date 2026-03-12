require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8000;

const { startReservationExpirationChecker } = require(
  "./Services/reservationServiceFolder/reservation.expirationChecker"
);

startReservationExpirationChecker();

const userRouter = require("./Routers/userRouter");
const bookRouter = require("./Routers/bookRouter");
const librarianRouter = require("./Routers/librarianRouter");
const transactionRouter = require("./Routers/transactionRouter");
const dashboardRouter = require("./Routers/dashboardRouter"); // ← ADDED
const reportRouter = require('./Routers/reportRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const session = require("express-session");

app.use(
  session({
    name: "library-session",
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/book", bookRouter);
app.use("/api", bookRouter);
app.use("/user", userRouter);
app.use("/librarian", librarianRouter);
app.use("/transaction", transactionRouter);

app.use("/api/dashboard", dashboardRouter); // ← ADDED
app.use("/api/students", userRouter);
app.use('/reports', reportRouter);
app.get("/", (req, res) => {
  res.redirect("/librarian/login");
});

app.listen(port, () => {
  console.log(`SERVER IS RUNNING: http://localhost:${port}/librarian/login`);
});
