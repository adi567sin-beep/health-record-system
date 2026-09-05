const Patient = require("../models/Patient");
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

module.exports = {
    getPatient,
    matchPatient
};