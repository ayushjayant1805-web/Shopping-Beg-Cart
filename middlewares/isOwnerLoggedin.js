const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    if (!req.cookies.ownerToken) {
        req.flash?.("error", "You need to login as owner first");
        return res.redirect("/owners/login");
    }

    try {
        const secret = process.env.JWT_KEY || "shopping-bag-secret-key";
        const decoded = jwt.verify(req.cookies.ownerToken, secret);

        if (!decoded.isOwner) {
            req.flash?.("error", "Access denied");
            return res.redirect("/owners/login");
        }

        const owner = await ownerModel.findById(decoded.id).select("-password");
        if (!owner) {
            req.flash?.("error", "Owner not found");
            return res.redirect("/owners/login");
        }

        req.owner = owner;
        return next();
    } catch (err) {
        req.flash?.("error", "Session expired. Please login again");
        res.clearCookie("ownerToken");
        return res.redirect("/owners/login");
    }
};
