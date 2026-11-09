const AuditLog = require("../models/AuditLog");


const getAuditLogs = async (req, res) => {
    try {
        const { patientId } = req.params;

        const logs = await AuditLog.find({ patientId })
            .populate("userId", "name email role")
            .sort({ timestamp: -1 });

        res.json({ logs });
    } catch (error) {
        console.error("Audit log error:", error);

        res.status(500).json({
            message: "Unable to retrieve audit logs."
        });
    }
};

module.exports = {
    getAuditLogs
};