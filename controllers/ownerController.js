const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");
const { generateOwnerToken } = require("../utils/genrateToken");

module.exports.loginOwner = async function (req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            req.flash?.("error", "Please provide email and password");
            return res.redirect("/owners/login");
        }

        const owner = await ownerModel.findOne({ email: email.toLowerCase() });
        if (!owner) {
            req.flash?.("error", "Email or password incorrect");
            return res.redirect("/owners/login");
        }

        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            req.flash?.("error", "Email or password incorrect");
            return res.redirect("/owners/login");
        }

        const token = generateOwnerToken(owner);
        res.cookie("ownerToken", token, { httpOnly: true });
        return res.redirect("/owners/admin");
    } catch (err) {
        console.error(err.message);
        req.flash?.("error", "Something went wrong");
        return res.redirect("/owners/login");
    }
};

module.exports.logoutOwner = function (req, res) {
    res.clearCookie("ownerToken");
    return res.redirect("/owners/login");
};
