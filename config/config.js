require("dotenv").config();

const Db = () => {
  const mongoose = require("mongoose");

  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.dataurl);
};

const YOUR_KEY_ID = process.env.YOUR_KEY_ID;
const YOUR_KEY_SECRET = process.env.YOUR_KEY_SECRET;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const sessionSecret = "mysitesessionsecret";
const emailUser = process.env.emailUser;
const emailPassword = process.env.emailPassword;

module.exports = {
  Db,
  sessionSecret,
  emailUser,
  emailPassword,
  YOUR_KEY_ID,
  YOUR_KEY_SECRET,
};
