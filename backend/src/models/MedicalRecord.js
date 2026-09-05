const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true,
            index: true
        },

        hospitalId: {
            type: String,
            required: true
        },

        hospitalName: {
            type: String,
            required: true
        },

        resourceType: {
            type: String,
            required: true
        },

        recordDate: {
            type: Date,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        fhirResource: {
            type: Object,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);