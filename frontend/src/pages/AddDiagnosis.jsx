
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "./AddDiagnosis.css";

function AddDiagnosis() {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        diagnosisName: "",
        description: "",
        status: "",
        severity: "",
        additionalNotes: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await API.post(
                `/patients/${patientId}/diagnoses`,
                formData
            );

            setSuccess(
                response.data.message || "Diagnosis saved successfully."
            );
        } catch (err) {
            console.error("Diagnosis submission error:", err);

            const statusCode = err.response?.status;
            const message =
                err.response?.data?.message ||
                "Unable to save diagnosis. Please try again.";

            if (statusCode === 401) {
                setError("Your session has expired. Please log in again.");
            } else if (statusCode === 403) {
                setError(
                    "You are not authorized or valid patient consent is missing."
                );
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="diagnosis-page">
                <div className="diagnosis-topbar">
                    <div>
                        <button
                            type="button"
                            className="diagnosis-back-btn"
                            onClick={() => navigate(`/patients/${patientId}`)}
                        >
                            <span aria-hidden="true">←</span> Back to patient
                        </button>

                        <p className="diagnosis-eyebrow">
                            PATIENT RECORDS / DIAGNOSIS
                        </p>

                        <h1>Add diagnosis</h1>

                        <p className="diagnosis-subtitle">
                            Record a clinical diagnosis in the patient's
                            medical history.
                        </p>
                    </div>

                    <div className="diagnosis-patient-card">
                        <span className="patient-card-label">PATIENT ID</span>
                        <strong>{patientId}</strong>
                    </div>
                </div>

                <form
                    className="diagnosis-form"
                    onSubmit={handleSubmit}
                >
                    <div className="diagnosis-form-heading">
                        <div>
                            <h2>Diagnosis information</h2>
                            <p>
                                Enter the clinical details below.
                                Fields marked with * are required.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="diagnosis-alert error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="diagnosis-alert success"
                            role="status"
                        >
                            {success}
                        </div>
                    )}

                    <div className="diagnosis-fields">
                        <div className="diagnosis-field full-width">
                            <label htmlFor="diagnosisName">
                                Diagnosis name <span>*</span>
                            </label>

                            <input
                                id="diagnosisName"
                                type="text"
                                name="diagnosisName"
                                placeholder="e.g. Type 2 Diabetes"
                                value={formData.diagnosisName}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="diagnosis-field full-width">
                            <label htmlFor="description">
                                Clinical description <span>*</span>
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe the diagnosis and relevant clinical observations..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                maxLength={2000}
                                required
                            />
                        </div>

                        <div className="diagnosis-field">
                            <label htmlFor="status">
                                Diagnosis status <span>*</span>
                            </label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select status
                                </option>
                                <option value="confirmed">Confirmed</option>
                                <option value="provisional">Provisional</option>
                                <option value="suspected">Suspected</option>
                            </select>
                        </div>

                        <div className="diagnosis-field">
                            <label htmlFor="severity">
                                Severity <span>*</span>
                            </label>

                            <select
                                id="severity"
                                name="severity"
                                value={formData.severity}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select severity
                                </option>
                                <option value="mild">Mild</option>
                                <option value="moderate">Moderate</option>
                                <option value="severe">Severe</option>
                            </select>
                        </div>

                        <div className="diagnosis-field full-width">
                            <label htmlFor="additionalNotes">
                                Additional notes
                                <span className="optional-label">
                                    Optional
                                </span>
                            </label>

                            <textarea
                                id="additionalNotes"
                                name="additionalNotes"
                                placeholder="Add any other relevant clinical notes..."
                                value={formData.additionalNotes}
                                onChange={handleChange}
                                rows={3}
                                maxLength={2000}
                            />
                        </div>
                    </div>

                    <div className="diagnosis-form-footer">
                        <button
                            type="button"
                            className="diagnosis-cancel-btn"
                            onClick={() => navigate(`/patients/${patientId}`)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="diagnosis-save-btn"
                            disabled={loading || Boolean(success)}
                        >
                            {loading ? "Saving..." : "Save diagnosis"}
                        </button>
                    </div>

                    {success && (
                        <button
                            type="button"
                            className="diagnosis-view-btn"
                            onClick={() => navigate(`/patients/${patientId}`)}
                        >
                            View updated patient history →
                        </button>
                    )}
                </form>

                <p className="diagnosis-security-note">
                    <span aria-hidden="true">🔒</span>
                    Patient information is handled through the existing
                    authentication and consent checks.
                </p>
            </main>
        </div>
    );
}

export default AddDiagnosis;
