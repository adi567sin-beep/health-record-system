import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";
import MedicalTimeline from "../components/MedicalTimeline";
import ConsentStatus from "../components/ConsentStatus";
import Navbar from "../components/Navbar";
import PatientSummary from "../components/PatientSummary";
import MedicalRecords from "../components/MedicalRecords";
import AuditLog from "../components/AuditLog";
import AISummary from "../components/AISummary";
import AIChat from "../components/AIChat";

function PatientDetails() {

    const { patientId } = useParams();

    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [timeline, setTimeline] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [accessDenied, setAccessDenied] = useState(false);
    const [hasConsent, setHasConsent] = useState(true);

    // ==========================================
    // LOAD PATIENT
    // ==========================================
    useEffect(() => {

        const loadPatient = async () => {

            try {

                setLoading(true);
                setError("");
                setAccessDenied(false);

                const response = await API.get(
                    `/patients/${patientId}`
                );

                setPatient(
                    response.data.patient
                );

                setRecords(
                    response.data.records || []
                );

                setTimeline(
                    response.data.timeline || []
                );

            } catch (error) {

                console.error(
                    "Patient loading error:",
                    error
                );

                const statusCode =
                    error.response?.status;

                const message =
                    error.response?.data?.message ||
                    "Unable to load patient information.";


                // ==================================
                // NO CONSENT
                // ==================================
                if (statusCode === 403) {

                    setAccessDenied(true);

                    setError(
                        "Valid patient consent is required to view this medical history."
                    );

                }

                // ==================================
                // PATIENT NOT FOUND
                // ==================================
                else if (statusCode === 404) {

                    setError(
                        "Patient not found."
                    );

                }

                // ==================================
                // UNAUTHORIZED
                // ==================================
                else if (statusCode === 401) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                }

                // ==================================
                // OTHER ERROR
                // ==================================
                else {

                    setError(message);
                }

            } finally {

                setLoading(false);
            }
        };


        loadPatient();

    }, [patientId]);


    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {

        return (
            <div className="dashboard-page">

                <Navbar />

                <main className="dashboard-container">

                    <div className="loading-container">

                        <h2>
                            Loading patient information...
                        </h2>

                        <p>
                            Please wait while we securely
                            retrieve the authorized records.
                        </p>

                    </div>

                </main>

            </div>
        );
    }


    // ==========================================
    // ACCESS DENIED
    // ==========================================
    if (accessDenied) {

        return (
            <div className="dashboard-page">

                <Navbar />

                <main className="dashboard-container">

                    <section className="dashboard-header">

                        <div>

                            <h1>
                                Patient Medical History
                            </h1>

                            <p>
                                Patient ID: {patientId}
                            </p>

                        </div>

                    </section>


                    {/* CONSENT STATUS */}

                    <ConsentStatus
                        patientId={patientId}
                        onConsentChange={(active) => {
                            setHasConsent(active);
                            if (active) {
                                window.location.reload();
                            }
                        }}
                    />


                    {/* ACCESS DENIED MESSAGE */}

                    <div className="error-container">

                        <div className="error-icon">
                            🔐
                        </div>

                        <h2>
                            Medical History Restricted
                        </h2>

                        <p>
                            {error}
                        </p>

                        <p>
                            Grant valid patient consent to
                            access the medical history.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // ==========================================
    // OTHER ERRORS
    // ==========================================
    if (error) {

        return (
            <div className="dashboard-page">

                <Navbar />

                <main className="dashboard-container">

                    <div className="error-container">

                        <div className="error-icon">
                            ⚠️
                        </div>

                        <h2>
                            Unable to Access Patient
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/dashboard")
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // ==========================================
    // PATIENT DATA AVAILABLE
    // ==========================================
    return (

        <div className="dashboard-page">

            <Navbar />

            <main className="dashboard-container">


               
{/* PAGE HEADER */}

<section className="dashboard-header">

    <div>

        <h1>
            Patient Medical History
        </h1>

        <p>
            Unified medical information
            from authorized healthcare providers.
        </p>

    </div>

    <div className="patient-header-actions">

        <button
            className="add-diagnosis-btn"
            onClick={() =>
                navigate(`/patients/${patientId}/add-diagnosis`)
            }
        >
            + Add Diagnosis
        </button>

        <div className="consent-badge">

            <span className="status-dot"></span>

            Authorized Access

        </div>

    </div>

</section>
               


                {/* PATIENT INFORMATION */}

                <PatientSummary
                    patient={patient}
                />


                {/* CONSENT */}

                <ConsentStatus
                    patientId={patientId}
                    onConsentChange={(active) => {
                        setHasConsent(active);

                        if (!active) {
                            setPatient(null);
                            setRecords([]);
                            setTimeline([]);
                            setAccessDenied(true);
                            setError(
                                "Valid patient consent is required to view this medical history."
                            );
                        }
                    }}
                />

                <AISummary patientId={patientId} />

                <AIChat patientId={patientId} />

                {/* MEDICAL RECORDS */}

                <MedicalRecords
                    records={records}
                />


                {/* MEDICAL TIMELINE */}

                <MedicalTimeline
                    timeline={timeline}
                />

                <AuditLog patientId={patientId} />



            </main>

        </div>
    );
}


export default PatientDetails;