const express = require("express");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");



const {
    getPatient,
    matchPatient,
    searchPatientMatches,
    getMyRecords,
    addDiagnosis
} = require("../controllers/patientController");

const router = express.Router();

/*
 * GET /api/patients/:patientId
 *
 * Retrieves an authorized patient's
 * medical history and timeline.
 */
router.get(
    "/my-records",
    authenticate,
    authorize("patient"),
    getMyRecords
);

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

router.post(
    "/match/search",
    authenticate,
    authorize("doctor"),
    searchPatientMatches
);

router.post(
    "/:patientId/diagnoses",
    authenticate,
    authorize("doctor"),
    addDiagnosis
);

module.exports = router;