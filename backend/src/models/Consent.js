const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        permissions: {
            medicalHistory: Boolean,
            medications: Boolean,
            laboratoryResults: Boolean,
            procedures: Boolean,
            allergies: Boolean
        },

        status: {
            type: String,
            enum: ["active", "revoked", "expired"],
            default: "active"
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Consent", consentSchema);