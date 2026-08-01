const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { genrateToken } = require("../utils/genrateToken");

module.exports.registerUser = async function (req, res) {
  try {
    const { email, fullname, password } = req.body || {};

    if (!email || !fullname || !password) {
      req.flash?.("error", "Please provide email, fullname, and password");
      return res.redirect("/");
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      req.flash?.("error", "Already have an account. Please login");
      return res.redirect("/");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      email: normalizedEmail,
      password: hash,
      fullname,
    });

    const token = genrateToken(user);
    res.cookie("token", token);
    return res.redirect("/shop");
  } catch (err) {
    console.log(err.message);
    req.flash?.("error", "Something went wrong");
    return res.redirect("/");
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      req.flash?.("error", "Please provide email and password");
      return res.redirect("/");
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash?.("error", "Email or password incorrect");
      return res.redirect("/");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash?.("error", "Email or password incorrect");
      return res.redirect("/");
    }

    const token = genrateToken(user);
    res.cookie("token", token);
    return res.redirect("/shop");
  } catch (err) {
    console.log(err.message);
    req.flash?.("error", "Something went wrong");
    return res.redirect("/");
  }
};

module.exports.logoutUser = function (req, res) {
  res.clearCookie("token");
  return res.redirect("/");
};