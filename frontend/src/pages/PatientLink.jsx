
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function PatientLink() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/link-patient", {
        patientId,
        dateOfBirth,
        email,
      });

      setMessage("Patient record linked successfully!");
      setTimeout(() => navigate("/patient-dashboard"), 1000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to link patient record. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "50px auto", padding: 24 }}>
      <h2>Link Patient Record</h2>
      <p>Enter the details that match your existing patient record.</p>

      <form onSubmit={handleSubmit}>
        <label>Patient ID</label>
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }}
        />

        <label>Date of Birth</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }}
        />

        <label>Email on Patient Record</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Linking..." : "Link Patient Record"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <button
        type="button"
        onClick={() => navigate("/patient-dashboard")}
        style={{ marginTop: 16 }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
