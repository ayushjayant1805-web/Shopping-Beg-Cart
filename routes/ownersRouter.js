const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const bcrypt = require("bcrypt");
const { loginOwner, logoutOwner } = require("../controllers/ownerController");
const isOwnerLoggedin = require("../middlewares/isOwnerLoggedin");

const normalizedEnv = (process.env.NODE_ENV || "").toLowerCase();
const isLegacyDevEnv = ["development", "devlopement", "developement"].includes(normalizedEnv);

// GET owner base route
router.get("/", (req, res) => {
    res.redirect("/owners/login");
});

// Create owner — only allowed in development and only if no owner exists
router.post("/create", async function (req, res) {
    if (isLegacyDevEnv) {
        try {
            const owners = await ownerModel.find();
            if (owners.length > 0) {
                return res.status(503).send("You don't have permission to create a new owner");
            }
            const { fullname, email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const createdOwner = await ownerModel.create({
                fullname,
                email,
                password: hashedPassword,
            });
            return res.status(201).send(createdOwner);
        } catch (error) {
            return res.status(500).send("Server error: " + error.message);
        }
    }
    return res.status(403).send("Not allowed in production");
});

// GET owner login page
router.get("/login", (req, res) => {
    const error = req.flash?.("error") || [];
    const success = req.flash?.("success") || [];
    res.render("owner-login", { error, success });
});

// POST owner login
router.post("/login", loginOwner);

// POST owner logout
router.post("/logout", logoutOwner);

// GET admin dashboard — protected
router.get("/admin", isOwnerLoggedin, async (req, res) => {
    try {
        const products = await productModel.find().sort({ _id: -1 });
        const success = req.flash?.("success") || [];
        const error = req.flash?.("error") || [];
        res.render("admin", { products, owner: req.owner, success, error });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Could not load admin panel");
    }
});

module.exports = router;