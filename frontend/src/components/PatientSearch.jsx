
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function PatientSearch() {
    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [candidates, setCandidates] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSearch = async (event) => {
        event.preventDefault();

        if (!name.trim() || !dateOfBirth) {
            setError("Please enter the patient's name and date of birth.");
            return;
        }

        setLoading(true);
        setError("");
        setCandidates([]);
        setSearched(false);

        try {
            const response = await API.post("/patients/match/search", {
                name: name.trim(),
                dateOfBirth,
                phone: phone.trim()
            });

            setCandidates(response.data.candidates || []);
            setSearched(true);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Your session has expired. Please log in again.");
            } else if (err.response?.status === 403) {
                setError("You are not authorized to search patient records.");
            } else {
                setError(
                    err.response?.data?.message ||
                    "Unable to search patients. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-search">
            <h2>Cross-Hospital Patient Matching</h2>

            <p>
                Enter the patient's details to find possible matches
                in the available patient database.
            </p>

            <form onSubmit={handleSearch}>
                <div>
                    <label htmlFor="patient-name">Patient Name *</label>
                    <input
                        id="patient-name"
                        type="text"
                        placeholder="Enter patient name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="patient-dob">Date of Birth *</label>
                    <input
                        id="patient-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(event) =>
                            setDateOfBirth(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="patient-phone">Phone Number (optional)</label>
                    <input
                        id="patient-phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Searching..." : "Find Patient Matches"}
                </button>
            </form>

            {error && (
                <p role="alert" style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {searched && candidates.length === 0 && (
                <p>No possible patient matches were found.</p>
            )}

            {candidates.length > 0 && (
                <div className="match-results">
                    <h3>Possible Matches ({candidates.length})</h3>

                    {candidates.map((candidate) => (
                        <div
                            className="match-card"
                            key={candidate.patientId}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "16px",
                                marginBottom: "12px"
                            }}
                        >
                            <h4>{candidate.name}</h4>

                            <p>
                                <strong>Patient ID:</strong>{" "}
                                {candidate.patientId}
                            </p>

                            <p>
                                <strong>Date of Birth:</strong>{" "}
                                {candidate.dateOfBirth}
                            </p>

                            <p>
                                <strong>Match Confidence:</strong>{" "}
                                {candidate.confidence}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {candidate.status}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/patients/${encodeURIComponent(
                                            candidate.patientId
                                        )}`
                                    )
                                }
                            >
                                Select Patient
                            </button>
                        </div>
                    ))}

                    <p>
                        A match score is only an indication of similarity,
                        not proof of identity. Patient history remains
                        protected by the backend consent checks.
                    </p>
                </div>
            )}
        </div>
    );
}

export default PatientSearch;
