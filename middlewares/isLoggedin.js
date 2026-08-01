const jwt = require('jsonwebtoken');
const userModel = require('../models/user-model');

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash?.('error', 'you need to login first');
        return res.redirect('/');
    }

    try {
        const secret = process.env.JWT_KEY || 'shopping-bag-secret-key';
        const decoded = jwt.verify(req.cookies.token, secret);
        const user = await userModel.findOne({ email: decoded.email }).select('-password');

        if (!user) {
            req.flash?.('error', 'User not found');
            return res.redirect('/');
        }

        req.user = user;
        return next();
    } catch (err) {
        req.flash?.('error', 'something went wrong');
        return res.redirect('/');
    }
};