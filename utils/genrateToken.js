const jwt = require("jsonwebtoken");

const genrateToken = (user) => {
    const secret = process.env.JWT_KEY || "shopping-bag-secret-key";
    return jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: "7d" });
};

const generateOwnerToken = (owner) => {
    const secret = process.env.JWT_KEY || "shopping-bag-secret-key";
    return jwt.sign({ email: owner.email, id: owner._id, isOwner: true }, secret, { expiresIn: "7d" });
};

module.exports = { genrateToken, generateOwnerToken };