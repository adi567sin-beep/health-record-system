const Consent = require("../models/Consent");
const AuditLog = require("../models/AuditLog");


// ==========================================
// CREATE / GRANT CONSENT
// ==========================================
const createConsent = async (req, res) => {

    try {

        const {
            patientId,
            permissions,
            expiresAt
        } = req.body;

        // Validate required fields
        if (!patientId || !expiresAt) {

            return res.status(400).json({
                message:
                    "Patient ID and expiry date are required."
            });
        }

        // Create consent
        // Doctor ID comes from authenticated JWT
        // instead of trusting the frontend
        const consent = await Consent.create({

            patientId,

            doctorId: req.user.id,

            permissions: {

                medicalHistory:
                    permissions?.medicalHistory ?? true,

                medications:
                    permissions?.medications ?? true,

                laboratoryResults:
                    permissions?.laboratoryResults ?? true,

                procedures:
                    permissions?.procedures ?? true,

                allergies:
                    permissions?.allergies ?? true
            },

            status: "active",

            expiresAt
        });


        // Create audit log
        await AuditLog.create({

            userId: req.user.id,

            patientId,

            action: "CREATE_CONSENT",

            ipAddress: req.ip
        });


        // Send response
        res.status(201).json({

            message:
                "Consent created successfully",

            consent
        });


    } catch (error) {

        console.error(
            "Consent creation error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to create consent."
        });
    }
};



// ==========================================
// GET ACTIVE CONSENT
// ==========================================
const getConsent = async (req, res) => {

    try {

        const {
            patientId
        } = req.params;


        // Find active and non-expired consent
        // belonging to the logged-in doctor
        const consent = await Consent.findOne({

            patientId,

            doctorId: req.user.id,

            status: "active",

            expiresAt: {
                $gt: new Date()
            }

        }).sort({

            createdAt: -1
        });


        // No valid consent
        if (!consent) {

            return res.status(404).json({

                message:
                    "No active consent found."
            });
        }


        // Return consent
        res.json({

            consent
        });


    } catch (error) {

        console.error(
            "Get consent error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to retrieve consent."
        });
    }
};



// ==========================================
// REVOKE CONSENT
// ==========================================
const revokeConsent = async (req, res) => {

    try {

        const {
            consentId
        } = req.params;


        // Find consent AND make sure it belongs
        // to the currently logged-in doctor
        const consent = await Consent.findOne({

            _id: consentId,

            doctorId: req.user.id
        });


        // Consent doesn't exist or doctor
        // doesn't own the consent
        if (!consent) {

            return res.status(404).json({

                message:
                    "Consent not found or you are not authorized to revoke it."
            });
        }


        // Change status
        consent.status = "revoked";


        // Save changes
        await consent.save();


        // Create audit log
        await AuditLog.create({

            userId: req.user.id,

            patientId: consent.patientId,

            action: "REVOKE_CONSENT",

            ipAddress: req.ip
        });


        // Send response
        res.json({

            message:
                "Consent revoked successfully."
        });


    } catch (error) {

        console.error(
            "Revoke consent error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to revoke consent."
        });
    }
};


const grantConsent = async (req, res) => {
    try {
        const {
            patientId,
            permissions,
            expiresAt
        } = req.body;

        if (!patientId || !expiresAt) {
            return res.status(400).json({
                message: "Patient ID and expiry date are required."
            });
        }

        const consent = await Consent.create({
            patientId,
            doctorId: req.user.id,
            permissions: {
                medicalHistory: permissions?.medicalHistory ?? true,
                medications: permissions?.medications ?? true,
                laboratoryResults: permissions?.laboratoryResults ?? true,
                procedures: permissions?.procedures ?? true,
                allergies: permissions?.allergies ?? true
            },
            status: "active",
            expiresAt
        });

        await AuditLog.create({
            userId: req.user.id,
            patientId,
            action: "CREATE_CONSENT",
            ipAddress: req.ip
        });

        res.status(201).json({
            message: "Consent granted successfully.",
            consent
        });

    } catch (error) {
        console.error("Grant consent error:", error);

        res.status(500).json({
            message: "Unable to grant consent."
        });
    }
};


module.exports = {

    createConsent,

    getConsent,

    revokeConsent,

    grantConsent
};