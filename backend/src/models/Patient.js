const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"]
        },

        phone: String,

        email: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Patient", patientSchema);