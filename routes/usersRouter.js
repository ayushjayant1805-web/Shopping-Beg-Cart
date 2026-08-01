const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const userModel = require("../models/user-model");
const productModel = require("../models/product-model");
const isLoggedin = require("../middlewares/isLoggedin");

// GET user base route
router.get("/", (req, res) => {
    res.send("User routes are working");
});

// POST register
router.post("/register", registerUser);

// POST login
router.post("/login", loginUser);

// POST logout
router.post("/logout", logoutUser);

// GET user profile (JSON)
router.get("/profile", isLoggedin, async (req, res) => {
    res.json({ user: req.user });
});

// POST add to cart
router.post("/cart/add", isLoggedin, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: "Product ID is required" });

        const user = await userModel.findById(req.user._id);
        const alreadyAdded = user.cart.some((item) => item.toString() === productId);

        if (!alreadyAdded) {
            user.cart.push(productId);
            await user.save();
        }

        res.json({ success: true, cartCount: user.cart.length });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Could not add item to cart" });
    }
});

// POST remove from cart
router.post("/cart/remove", isLoggedin, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: "Product ID is required" });

        const user = await userModel.findById(req.user._id);
        user.cart = user.cart.filter((item) => item.toString() !== productId);
        await user.save();

        res.json({ success: true, cartCount: user.cart.length });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Could not remove item from cart" });
    }
});

// GET cart page — renders cart.ejs with real data
router.get("/cart", isLoggedin, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).populate("cart");
        const cartItems = user.cart;

        // Calculate totals
        const totalMRP = cartItems.reduce((sum, item) => sum + item.price, 0);
        const totalDiscount = cartItems.reduce((sum, item) => {
            return sum + Math.round((item.price * item.discount) / 100);
        }, 0);
        const platformFee = cartItems.length > 0 ? 20 : 0;
        const totalAmount = totalMRP - totalDiscount + platformFee;

        res.render("cart", {
            user: req.user,
            cartItems,
            totalMRP,
            totalDiscount,
            platformFee,
            totalAmount,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Could not load cart");
    }
});

module.exports = router;