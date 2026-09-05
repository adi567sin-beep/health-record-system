require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");


const connectDatabase =
    require("./config/database");

const authRoutes =
    require("./routes/authRoutes");

const patientRoutes =
    require("./routes/patientRoutes");

const consentRoutes =
    require("./routes/consentRoutes");

const auditRoutes = require("./routes/auditRoutes");

const aiRoutes =
    require("./routes/aiRoutes");

const {
    notFound,
    errorHandler
} = require("./middleware/errorMiddleware");

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many login attempts. Please try again later."
    }
});




const app = express();

// Security headers
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

connectDatabase();


app.use(helmet());

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

app.use(morgan("dev"));


app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "OK",
            service: "Health Record API"
        });

    }
);


app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/patients",
    patientRoutes
);

app.use(
    "/api/consent",
    consentRoutes
);

app.use("/api/audit", auditRoutes);

app.use(
    "/api/ai",
    aiRoutes
);

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(notFound);

app.use(errorHandler);

app.use(generalLimiter);

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Health Record API running on port ${PORT}`
        );

    }
);