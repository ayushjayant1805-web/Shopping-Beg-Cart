const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedin");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// GET home / login-register page
router.get("/", (req, res) => {
    const error = req.flash?.("error") || [];
    const success = req.flash?.("success") || [];
    res.render("index", { error, success });
});

// GET shop page — protected
router.get("/shop", isLoggedin, async (req, res) => {
    try {
        const products = await productModel.find().sort({ _id: -1 });
        const user = await userModel.findById(req.user._id);
        const cartCount = user ? user.cart.length : 0;
        const error = req.flash?.("error") || [];
        const success = req.flash?.("success") || [];
        res.render("shop", { products, user: req.user, cartCount, error, success });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Could not load products");
    }
});

module.exports = router;