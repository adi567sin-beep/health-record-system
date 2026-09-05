const express = require("express");

const {
    login
} = require("../controllers/authController");

const {
    authenticate
} = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});

router.post(
    "/login",
    loginLimiter,
    login
);

module.exports = router;