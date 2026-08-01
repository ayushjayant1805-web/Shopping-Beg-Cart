const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const multer = require("multer");
const isLoggedin = require("../middlewares/isLoggedin");
const isOwnerLoggedin = require("../middlewares/isOwnerLoggedin");

const upload = multer({ storage: multer.memoryStorage() });

// GET all products — redirects to shop (main product view is at /shop)
router.get("/", async (req, res) => {
    try {
        const products = await productModel.find().sort({ _id: -1 });
        res.render("shop", { products, user: req.user || null });
    } catch (error) {
        res.status(500).send("Could not load products");
    }
});

// GET create product form — owner only
router.get("/create", isOwnerLoggedin, (req, res) => {
    const success = req.flash?.("success") || [];
    const error = req.flash?.("error") || [];
    res.render("createproduct", { success, error });
});

// POST create product — owner only
router.post("/create", isOwnerLoggedin, upload.single("image"), async (req, res) => {
    try {
        const { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        if (!name || !price) {
            req.flash?.("error", "Product name and price are required");
            return res.redirect("/products/create");
        }

        const productData = {
            name,
            price: Number(price),
            discount: Number(discount || 0),
            bgcolor: bgcolor || "#ffffff",
            panelcolor: panelcolor || "#f0f0f0",
            textcolor: textcolor || "#000000",
        };

        if (req.file) {
            productData.image = req.file.buffer;
            productData.contentType = req.file.mimetype;
        }

        await productModel.create(productData);

        req.flash?.("success", "Product created successfully!");
        res.redirect("/owners/admin");
    } catch (error) {
        console.error(error.message);
        req.flash?.("error", "Could not create product");
        res.redirect("/products/create");
    }
});

// GET delete product — owner only
router.get("/delete/:id", isOwnerLoggedin, async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        req.flash?.("success", "Product deleted successfully");
        res.redirect("/owners/admin");
    } catch (error) {
        console.error(error.message);
        req.flash?.("error", "Could not delete product");
        res.redirect("/owners/admin");
    }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) return res.status(404).send("Product not found");
        res.json(product);
    } catch (error) {
        res.status(500).send("Could not load product");
    }
});

module.exports = router;