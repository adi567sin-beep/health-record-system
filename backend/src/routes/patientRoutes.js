const express = require("express");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const {
    getPatient,
    matchPatient
} = require("../controllers/patientController");

const router = express.Router();

/*
 * GET /api/patients/:patientId
 *
 * Retrieves an authorized patient's
 * medical history and timeline.
 */
router.get(
    "/:patientId",
    authenticate,
    authorize("doctor"),
    getPatient
);

router.post(
    "/match",
    authenticate,
    authorize("doctor"),
    matchPatient
);

module.exports = router;