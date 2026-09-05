const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");


/*
 * Register a new doctor
 */
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
 * Login doctor
 */
const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // Only doctors should access doctor dashboard
        if (user.role !== "doctor") {

            return res.status(403).json({
                message:
                    "Only authorized doctors can access this system."
            });
        }

        const token =
            generateToken(user);

        return res.json({

            message:
                "Login successful",

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
            "Login error:",
            error
        );

        return res.status(500).json({
            message:
                "Login failed"
        });
    }
};


module.exports = {
    register,
    login
};