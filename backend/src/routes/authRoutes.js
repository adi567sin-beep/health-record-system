
const express = require("express");


const {
    login,
    registerPatient,
    linkPatientAccount
} = require("../controllers/authController");

const {
    authenticate,
    authorize
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

const patientRegistrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many registration attempts. Please try again later."
    }
});

router.post(
    "/login",
    loginLimiter,
    login
);

router.post(
    "/register/patient",
    patientRegistrationLimiter,
    registerPatient
);

router.post(
    "/link-patient",
    authenticate,
    authorize("patient"),
    linkPatientAccount
);

module.exports = router;
