const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

const router = express.Router();

router.get(
    "/:patientId",
    authenticate,
    authorize("doctor"),
    getAuditLogs
);

module.exports = router;