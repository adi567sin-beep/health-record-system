const Patient = require("../models/Patient");
const User = require("../models/User");
const MedicalRecord = require("../models/MedicalRecord");
const Consent = require("../models/Consent");
const AuditLog = require("../models/AuditLog");
const { matchPatients } = require("../services/patientMatchingService");

const {
    createTimeline
} = require("../services/timelineService");

const getPatient = async (req, res) => {
    try {
        const { patientId } = req.params;       
        const consent = await Consent.findOne({
            patientId,
            doctorId: req.user.id,
            status: "active",
            expiresAt: {
                $gt: new Date()
            }
        });

        if (!consent) {
            return res.status(403).json({
                message:
                    "Valid patient consent is required"
            });
        }

        const patient = await Patient.findOne({
            patientId
        });

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const records = await MedicalRecord.find({
            patientId
        });

        const timeline = createTimeline(records);

        await AuditLog.create({
            userId: req.user.id,
            patientId,
            action: "VIEW_PATIENT_HISTORY",
            ipAddress: req.ip
        });

        res.json({
            patient,
            timeline,
            records
        });
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve patient history"
        });
    }
};

const matchPatient = async (req, res) => {
    try {
        const { patientId, name, dateOfBirth, phone } = req.body;

        if (!patientId || !name || !dateOfBirth) {
            return res.status(400).json({
                message: "patientId, name and dateOfBirth are required."
            });
        }

        const existingPatient = await Patient.findOne({ patientId });

        if (!existingPatient) {
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        const result = matchPatients(
            existingPatient,
            {
                name,
                dateOfBirth,
                phone
            }
        );

        return res.json({
            patientId,
            result
        });

    } catch (error) {
        console.error("Patient matching error:", error);

        return res.status(500).json({
            message: "Unable to match patient."
        });
    }
};


const searchPatientMatches = async (req, res) => {
    try {
        const { name, dateOfBirth, phone } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            !dateOfBirth ||
            Number.isNaN(Date.parse(dateOfBirth))
        ) {
            return res.status(400).json({
                message: "Valid name and dateOfBirth are required."
            });
        }

        const normalizedName = name.trim();
        const dob = new Date(dateOfBirth);

        // Search the complete calendar day in UTC.
        const startOfDay = new Date(
            `${dateOfBirth.slice(0, 10)}T00:00:00.000Z`
        );

        if (Number.isNaN(startOfDay.getTime())) {
            return res.status(400).json({
                message: "Invalid dateOfBirth."
            });
        }

        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        // Escape special characters before constructing a regex.
        const escapeRegex = (value) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Use the first name token to find possible candidates.
        const firstName = normalizedName.split(/\s+/)[0];
        const namePattern = new RegExp(
            `^${escapeRegex(firstName)}`,
            "i"
        );

        // Search by name OR date of birth, then score candidates.
        const candidates = await Patient.find({
            $or: [
                { name: namePattern },
                {
                    dateOfBirth: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            ]
        })
            .limit(500)
            .lean();

        const inputPatient = {
            name: normalizedName,
            dateOfBirth: startOfDay.toISOString().slice(0, 10),
            phone: typeof phone === "string" ? phone : ""
        };

        const results = candidates.map((candidate) => {
            const candidateDob = candidate.dateOfBirth
                ? new Date(candidate.dateOfBirth)
                    .toISOString()
                    .slice(0, 10)
                : "";

            // Normalize Date values before using the existing matcher.
            const comparableCandidate = {
                ...candidate,
                dateOfBirth: candidateDob
            };

            const result = matchPatients(
                comparableCandidate,
                inputPatient
            );

            return {
                patientId: candidate.patientId,
                name: candidate.name,
                dateOfBirth: candidateDob,
                status: result.status,
                score: result.score,
                confidence: result.confidence,
                details: result.details
            };
        });

        results.sort((a, b) => b.score - a.score);

        return res.json({
            count: results.length,
            candidates: results.slice(0, 10)
        });
    } catch (error) {
        console.error("Patient candidate search error:", error);

        return res.status(500).json({
            message: "Unable to search patient matches."
        });
    }
};


/*
 * GET /api/patients/my-records
 * Returns records belonging to the authenticated patient account only.
 */
const getMyRecords = async (req, res) => {
    console.log("getMyRecords controller reached");
    try {
        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patients can access this endpoint."
            });
        }

        // Read the current account and its link from the database.
        const user = await User.findById(req.user.id || req.user._id);

        if (!user || user.role !== "patient") {
            return res.status(401).json({
                message: "Patient account not found. Please log in again."
            });
        }
        console.log("Logged-in user patientId:", user.patientId);
        if (!user.patientId) {
            return res.status(403).json({
                message: "Your account is not linked to a patient record yet."
            });
        }

        // Fetch only records associated with this account's linked patient ID.
        const records = await MedicalRecord.find({
            patientId: user.patientId
        })
            .select("-__v")
            .sort({ recordDate: -1 });

        // Record access in the audit log.
        await AuditLog.create({
            userId: user._id,
            patientId: user.patientId,
            action: "VIEW_OWN_RECORDS",
            ipAddress: req.ip
        });

        return res.status(200).json({
            patient: {
                patientId: user.patientId,
                name: user.name
            },
            records
        });
    } catch (error) {
        console.error("Get own medical records error:", error);

        return res.status(500).json({
            message: "Unable to retrieve your medical records."
        });
    }
};

const addDiagnosis = async (req, res) => {
    try {
        const { patientId } = req.params;

        const {
            diagnosisName,
            description,
            status,
            severity,
            additionalNotes
        } = req.body;

        // 1. Validate required fields
        if (!diagnosisName || !description || !status || !severity) {
            return res.status(400).json({
                message: "Please provide all required diagnosis details."
            });
        }

        const allowedStatuses = [
            "confirmed",
            "provisional",
            "suspected"
        ];

        const allowedSeverities = [
            "mild",
            "moderate",
            "severe"
        ];

        if (
            !allowedStatuses.includes(status) ||
            !allowedSeverities.includes(severity)
        ) {
            return res.status(400).json({
                message: "Invalid diagnosis status or severity."
            });
        }

        // 2. Verify patient consent
        const consent = await Consent.findOne({
            patientId,
            doctorId: req.user.id,
            status: "active",
            expiresAt: { $gt: new Date() }
        });

        if (!consent) {
            return res.status(403).json({
                message: "Valid patient consent is required."
            });
        }

        // 3. Verify patient exists
        const patient = await Patient.findOne({ patientId });

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found."
            });
        }

        // 4. Get authenticated doctor's hospital details
        const doctor = await User.findById(req.user.id);

        if (!doctor || doctor.role !== "doctor") {
            return res.status(403).json({
                message: "Valid doctor account required."
            });
        }

        if (!doctor.hospitalId || !doctor.hospitalName) {
            return res.status(400).json({
                message: "Please update your hospital details before adding a diagnosis."
            });
        }

        // 5. Map diagnosis status to FHIR verification status
        const verificationStatus = {
            confirmed: "confirmed",
            provisional: "provisional",
            suspected: "unconfirmed"
        }[status];

        // 6. Save diagnosis as a MedicalRecord
        const diagnosis = await MedicalRecord.create({
            patientId,
            hospitalId: doctor.hospitalId,
            hospitalName: doctor.hospitalName,
            resourceType: "Condition",
            recordDate: new Date(),
            title: diagnosisName,
            description,
            fhirResource: {
                resourceType: "Condition",

                clinicalStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            code: "active"
                        }
                    ]
                },

                verificationStatus: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                            code: verificationStatus
                        }
                    ]
                },

                code: {
                    text: diagnosisName
                },

                subject: {
                    reference: `Patient/${patientId}`
                },

                recordedDate: new Date().toISOString(),

                severity: {
                    text: severity
                },

                note: additionalNotes
                    ? [{ text: additionalNotes }]
                    : []
            }
        });

        // 7. Create audit log
        await AuditLog.create({
            userId: req.user.id,
            patientId,
            action: "ADD_DIAGNOSIS",
            ipAddress: req.ip
        });

        return res.status(201).json({
            message: "Diagnosis added successfully.",
            diagnosis
        });

    } catch (error) {
        console.error("Add diagnosis error:", error);

        return res.status(500).json({
            message: "Unable to save diagnosis."
        });
    }
};


module.exports = {
    getPatient,
    matchPatient,
    searchPatientMatches,
    getMyRecords,
    addDiagnosis
};