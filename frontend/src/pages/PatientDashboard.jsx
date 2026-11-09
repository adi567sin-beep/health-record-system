
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./PatientDashboard.css";

function PatientDashboard() {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    useEffect(() => {
        if (!user || user.role !== "patient") {
            setLoading(false);
            return;
        }

        const fetchRecords = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Your session has expired. Please log in again.");
                    return;
                }

                const response = await API.get("/patients/my-records", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPatient(response.data.patient);
                setRecords(response.data.records || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load your medical records."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRecords();
    }, []);

    if (!user || user.role !== "patient") {
        return (
            <div className="patient-dashboard">
                <h2>Access Denied</h2>
                <p>Please log in with a patient account.</p>
                <button onClick={() => navigate("/login")}>
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="patient-dashboard">
            <header className="patient-dashboard-header">
                <div>
                    <h1>HealthRecord AI</h1>
                    <p>Patient Portal</p>
                </div>

                <button onClick={handleLogout}>Logout</button>
            </header>

            <main className="patient-dashboard-content">
                <section className="patient-welcome">
                    <h2>Welcome, {user.name}!</h2>
                    <p>
                        View your health information securely
                        through your patient portal.
                    </p>
                </section>

                <section className="patient-info-card">
                    <h3>My Account</h3>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Account type:</strong> Patient</p>

                    {patient && (
                        <p>
                            <strong>Patient ID:</strong>{" "}
                            {patient.patientId}
                        </p>
                    )}
                </section>

                <section className="patient-info-card">
                    <h3>My Medical Records</h3>

                    {loading ? (
                        <p>Loading your medical records...</p>
                    ) : error ? (
                        <>
                            <p role="alert">{error}</p>

                            {error.toLowerCase().includes("not linked") && (
                                <button
                                    onClick={() => navigate("/patient-link")}
                                >
                                    Link Patient Record
                                </button>
                            )}

                            {error.toLowerCase().includes("session") && (
                                <button onClick={handleLogout}>
                                    Log in again
                                </button>
                            )}
                        </>
                    ) : records.length === 0 ? (
                        <p>No medical records are available for your account yet.</p>
                    ) : (
                        <div className="patient-record-list">
                            {records.map((record) => (
                                <article
                                    className="patient-record"
                                    key={record._id}
                                >
                                    <h4>{record.title}</h4>

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {record.recordDate
                                            ? new Date(
                                                record.recordDate
                                            ).toLocaleDateString()
                                            : "Not available"}
                                    </p>

                                    <p>
                                        <strong>Hospital:</strong>{" "}
                                        {record.hospitalName}
                                    </p>

                                    <p>
                                        <strong>Record type:</strong>{" "}
                                        {record.resourceType}
                                    </p>

                                    {record.description && (
                                        <p>
                                            <strong>Description:</strong>{" "}
                                            {record.description}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="patient-info-card">
                    <h3>Privacy and Consent</h3>
                    <p>
                        Your medical records are retrieved using your
                        authenticated patient account. Sharing with
                        healthcare providers should follow your consent
                        and access permissions.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default PatientDashboard;
