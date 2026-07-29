if (!process.env.NODE_ENV || process.env.NODE_ENV === "developement" || process.env.NODE_ENV === "devlopement") {
  process.env.NODE_ENV = "development";
}

const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

const mongoUri = process.env.MONGODB_URI || (config.has("MONGODB_URI") ? config.get("MONGODB_URI") : "mongodb://127.0.0.1:27017/shoppingbag");

mongoose
  .connect(mongoUri)
  .then(function () {
    dbgr("Connected");
  })
  .catch(function (err) {
    dbgr(err);
  });

module.exports = mongoose.connection;