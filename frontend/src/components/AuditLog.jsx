import { useEffect, useState } from "react";
import API from "../services/api";

function AuditLog({ patientId }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(`/audit/${patientId}`);

                setLogs(response.data.logs || []);
            } catch (error) {
                console.error("Audit log loading error:", error);

                setError("Unable to load access history.");
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            loadLogs();
        }
    }, [patientId]);

    const formatDate = (timestamp) => {
        if (!timestamp) {
            return "Date unavailable";
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatAction = (action) => {
        if (!action) {
            return "UNKNOWN ACTION";
        }

        return action.replaceAll("_", " ");
    };

    if (loading) {
        return (
            <div className="audit-card">
                <div className="audit-header">
                    <div>
                        <h2>Access History</h2>
                        <p>
                            Records of actions performed on this patient's
                            medical information.
                        </p>
                    </div>
                </div>

                <p className="audit-message">
                    Loading access history...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="audit-card">
                <div className="audit-header">
                    <div>
                        <h2>Access History</h2>
                        <p>
                            Records of actions performed on this patient's
                            medical information.
                        </p>
                    </div>
                </div>

                <p className="audit-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="audit-card">
            <div className="audit-header">
                <div>
                    <h2>Access History</h2>

                    <p>
                        Records of actions performed on this patient's
                        medical information.
                    </p>
                </div>

                <span className="audit-count">
                    {logs.length} {logs.length === 1 ? "Event" : "Events"}
                </span>
            </div>

            {logs.length === 0 ? (
                <div className="audit-empty">
                    <div className="audit-empty-icon">🔐</div>

                    <h3>No Access History</h3>

                    <p>
                        No activity has been recorded for this patient yet.
                    </p>
                </div>
            ) : (
                <div className="audit-list">
                    {logs.map((log) => (
                        <div className="audit-item" key={log._id}>
                            <div className="audit-icon">
                                {log.action === "CREATE_CONSENT"
                                    ? "🔓"
                                    : log.action === "REVOKE_CONSENT"
                                    ? "🔒"
                                    : "👁️"}
                            </div>

                            <div className="audit-content">
                                <div className="audit-action">
                                    {formatAction(log.action)}
                                </div>

                                <div className="audit-user">
                                    <strong>User:</strong>{" "}
                                    {log.userId?.name || "Unknown User"}
                                </div>

                                <div className="audit-role">
                                    <strong>Role:</strong>{" "}
                                    {log.userId?.role || "Unknown"}
                                </div>

                                <div className="audit-time">
                                    {formatDate(log.timestamp)}
                                </div>

                                {log.ipAddress && (
                                    <div className="audit-ip">
                                        <strong>IP Address:</strong>{" "}
                                        {log.ipAddress}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AuditLog;