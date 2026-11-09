const jwt = require("jsonwebtoken");

const AuditLog = require("../models/AuditLog");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {
            return res.status(401).json({
                message: "Invalid authorization format."
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expired. Please log in again."
            });
        }

        return res.status(401).json({
            message: "Invalid authentication token."
        });
    }
};



const authorize = (...roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!roles.includes(req.user.role)) {
            const patientId = req.params.patientId;

            if (patientId) {
                try {
                    const userId = req.user.id || req.user._id;

                    if (!userId) {
                        console.error(
                            "Cannot log ACCESS_DENIED: user ID missing."
                        );
                    } else {
                        const log = await AuditLog.create({
                            userId,
                            patientId,
                            action: "ACCESS_DENIED",
                            ipAddress: req.ip
                        });

                        console.log(
                            "ACCESS_DENIED audit log saved:",
                            log._id
                        );
                    }
                } catch (error) {
                    console.error(
                        "Failed to save ACCESS_DENIED audit log:",
                        error
                    );
                }
            }

            return res.status(403).json({
                message:
                    "You do not have permission to perform this action."
            });
        }




        next();
    };
};


module.exports = {
    authenticate,
    authorize
};