const jwt = require("jsonwebtoken");

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

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        if (!roles.includes(req.user.role)) {
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