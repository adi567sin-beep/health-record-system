const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["doctor", "hospital_admin", "patient"],
            required: true
        },

        hospitalId: {
            type: String,
            default: null
        },

        hospitalName: {
            type: String,
            default: null,
            trim: true
        },
        patientId: {
            type: String,
            default: null,
            index: true
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);