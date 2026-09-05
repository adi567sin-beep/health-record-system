const express = require("express");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const {
    askAI,
    generateSummary
} = require("../controllers/aiController");

const router = express.Router();


router.post(
    "/ask",
    authenticate,
    authorize("doctor"),
    askAI
);


router.get(
    "/summary/:patientId",
    authenticate,
    authorize("doctor"),
    generateSummary
);


module.exports = router;