const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Patient = require("../models/Patient");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            hospitalId
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Name, email and password are required."
            });
        }

        // Basic password validation
        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Password must contain at least 6 characters."
            });
        }

        // Normalize email
        const normalizedEmail =
            email.trim().toLowerCase();

        // Check whether account already exists
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            return res.status(409).json({
                message:
                    "An account with this email already exists."
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 12);

        // Create doctor
        const user = await User.create({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: "doctor",

            hospitalId:
                hospitalId?.trim() || null
        });

        // Generate JWT
        const token =
            generateToken(user);

        return res.status(201).json({

            message:
                "Doctor registered successfully.",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId
            }
        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
            message:
                "Registration failed."
        });
    }
};



/*
 * Login doctor or patient
 */
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Accept only supported login roles
        if (role && !["doctor", "patient"].includes(role)) {
            return res.status(400).json({
                message: "Invalid login type."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Use a generic error for invalid credentials
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Verify the selected login type against the stored role
        if (role && user.role !== role) {
            return res.status(403).json({
                message: `This account is not registered as a ${role}. Please select the correct login type.`
            });
        }

        // Permit only doctor and patient accounts
        if (!["doctor", "patient"].includes(user.role)) {
            return res.status(403).json({
                message: "This account type is not permitted to log in."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hospitalId: user.hospitalId || null
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed."
        });
    }
};


/*
 * Register a patient account
 */
const registerPatient = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "patient",
            hospitalId: null
        });

        const token = generateToken(user);

        return res.status(201).json({
            message: "Patient registered successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Patient registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        return res.status(500).json({
            message: "Patient registration failed."
        });
    }
};

/*
 * Link an authenticated patient account to an existing patient record.
 */
const linkPatientAccount = async (req, res) => {
    try {
        const { patientId, dateOfBirth, email } = req.body;

        if (
            typeof patientId !== "string" ||
            !patientId.trim() ||
            !dateOfBirth ||
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res.status(400).json({
                message: "Patient ID, date of birth and registered patient email are required."
            });
        }

        if (req.user.role !== "patient") {
            return res.status(403).json({
                message: "Only patient accounts can be linked."
            });
        }

        // Load the account from the database rather than trusting JWT data.
        const user = await User.findById(req.user.id || req.user._id);

        if (!user || user.role !== "patient") {
            return res.status(401).json({
                message: "Patient account not found. Please log in again."
            });
        }

        if (user.patientId) {
            return res.status(409).json({
                message: "This account is already linked to a patient record."
            });
        }

        const normalizedPatientId = patientId.trim();
        const normalizedEmail = email.trim().toLowerCase();

        // Find the existing record; never create or modify a Patient record here.
        const patient = await Patient.findOne({
            patientId: normalizedPatientId
        });

        if (!patient) {
            return res.status(404).json({
                message: "Patient record not found. Check the patient ID."
            });
        }

        // Require DOB and email to match the existing record.
        const suppliedDate = new Date(dateOfBirth);
        const storedDate = new Date(patient.dateOfBirth);

        const validDate =
            !Number.isNaN(suppliedDate.getTime()) &&
            suppliedDate.getUTCFullYear() === storedDate.getUTCFullYear() &&
            suppliedDate.getUTCMonth() === storedDate.getUTCMonth() &&
            suppliedDate.getUTCDate() === storedDate.getUTCDate();

        const storedEmail =
            typeof patient.email === "string"
                ? patient.email.trim().toLowerCase()
                : "";

        if (
            !validDate ||
            !storedEmail ||
            storedEmail !== normalizedEmail
        ) {
            return res.status(403).json({
                message: "Verification failed. The details do not match the patient record."
            });
        }

        // Prevent the same patient record from being linked to another account.
        const alreadyLinked = await User.findOne({
            patientId: normalizedPatientId
        });

        if (alreadyLinked) {
            return res.status(409).json({
                message: "This patient record is already linked to an account."
            });
        }

        user.patientId = normalizedPatientId;
        await user.save();

        return res.status(200).json({
            message: "Patient account linked successfully.",
            patient: {
                patientId: patient.patientId,
                name: patient.name
            }
        });
    } catch (error) {
        console.error("Patient account linking error:", error);

        return res.status(500).json({
            message: "Unable to link patient account."
        });
    }
};

module.exports = {
    register,
    login,
    registerPatient,
     linkPatientAccount
};