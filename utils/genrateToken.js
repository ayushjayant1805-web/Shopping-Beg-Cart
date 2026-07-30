const jwt = require("jsonwebtoken");

const genrateToken = (user) => {
    const secret = process.env.JWT_KEY || "dev-secret-key";
    return jwt.sign({ email: user.email, id: user._id }, secret);
};

module.exports.genrateToken = genrateToken;