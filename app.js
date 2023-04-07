require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectDb = require("./config/config");
const logger = require("morgan");

connectDb.Db();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store");
  next();
});
// session created
app.use(
  session({
    secret: connectDb.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000, sameSite: false },
  })
);

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
app.use(userRoute);
app.use(adminRoute);

app.use((req, res, next) => {
  res.status(404).render("404");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
