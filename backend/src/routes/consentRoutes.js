const express = require("express");

const {
    authenticate
} = require("../middleware/authMiddleware");

const {
    createConsent,
    getConsent,
    revokeConsent,
    grantConsent
} = require("../controllers/consentController");

const router = express.Router();

router.post("/", authenticate, createConsent);

router.post("/grant", authenticate, grantConsent);

router.get("/:patientId", authenticate, getConsent);

router.patch(
    "/revoke/:consentId",
    authenticate,
    revokeConsent
);

module.exports = router;