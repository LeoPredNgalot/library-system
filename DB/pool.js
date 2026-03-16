//
//
//
require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // replace with your DB password
    database: "library", // replace with your DB name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise(); // enable async/await

module.exports = { pool };
