import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import ReactMarkdown from "react-markdown";

function AISummary({ patientId }) {

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const requestedPatientRef = useRef(null);

    const generateSummary = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await API.get(
                    `/ai/summary/${patientId}`
                );

            setSummary(response.data);

        } catch (error) {

            console.error(
                "AI summary error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to generate AI summary."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
    if (!patientId) return;

    // Prevent duplicate request for the same patient
    if (requestedPatientRef.current === patientId) {
        return;
    }

    requestedPatientRef.current = patientId;

    generateSummary();

}, [patientId]);

    

    return (
        <div className="ai-summary-card">

            <div className="ai-summary-header">

                <div>
                    <h2>
                        🤖 AI Medical History Summary
                    </h2>

                    <p>
                        AI-assisted summary of the patient's
                        medical records.
                    </p>
                </div>

                <button
                    onClick={generateSummary}
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing..."
                        : "Regenerate"}
                </button>

            </div>


            {loading && (
                <div className="ai-loading">
                    Analyzing medical records...
                </div>
            )}


            {error && (
                <div className="ai-error">
                    {error}
                </div>
            )}


            {summary && !loading && (

                <div className="ai-summary-content">

                    {/* SUMMARY */}

                    <div className="ai-summary-text">

                        <h3>
                            AI Summary
                        </h3>

                        <div className="ai-summary-markdown">
                            <ReactMarkdown>
                                {summary.summary}
                            </ReactMarkdown>
                        </div>

                    </div>


                    {/* STATISTICS */}

                    <div className="ai-summary-stats">

                        <div>
                            <strong>
                                {summary.recordCount}
                            </strong>

                            <span>
                                Medical Records
                            </span>
                        </div>


                        <div>
                            <strong>
                                {summary.hospitals?.length || 0}
                            </strong>

                            <span>
                                Hospitals
                            </span>
                        </div>

                    </div>


                    {/* DIAGNOSES */}

                    {summary.diagnoses?.length > 0 && (

                        <div className="ai-section">

                            <h3>
                                Diagnoses
                            </h3>

                            <ul>

                                {summary.diagnoses.map(
                                    (item, index) => (

                                        <li key={index}>

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <span>
                                                {" "}— {item.hospital}
                                            </span>

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>
                    )}


                    {/* MEDICATIONS */}

                    {summary.medications?.length > 0 && (

                        <div className="ai-section">

                            <h3>
                                Medications
                            </h3>

                            <ul>

                                {summary.medications.map(
                                    (item, index) => (

                                        <li key={index}>

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <span>
                                                {" "}— {item.hospital}
                                            </span>

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>
                    )}


                    {/* LABORATORY */}

                    {summary.laboratoryTests?.length > 0 && (

                        <div className="ai-section">

                            <h3>
                                Laboratory Tests
                            </h3>

                            <ul>

                                {summary.laboratoryTests.map(
                                    (item, index) => (

                                        <li key={index}>

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <span>
                                                {" "}— {item.hospital}
                                            </span>

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>
                    )}


                    {/* PROCEDURES */}

                    {summary.procedures?.length > 0 && (

                        <div className="ai-section">

                            <h3>
                                Procedures
                            </h3>

                            <ul>

                                {summary.procedures.map(
                                    (item, index) => (

                                        <li key={index}>

                                            <strong>
                                                {item.title}
                                            </strong>

                                            <span>
                                                {" "}— {item.hospital}
                                            </span>

                                        </li>

                                    )
                                )}

                            </ul>

                        </div>
                    )}


                    {/* SOURCES */}

                    {summary.sources?.length > 0 && (

                        <div className="ai-sources">

                            <h3>
                                📚 Sources Used by AI
                            </h3>

                            <p className="source-description">
                                The summary was generated using
                                the following medical records.
                            </p>


                            <div className="source-list">

                                {summary.sources.map(
                                    (source) => (

                                        <div
                                            className="source-item"
                                            key={source.recordId}
                                        >

                                            <div className="source-number">
                                                {source.recordId}
                                            </div>

                                            <div className="source-content">

                                                <strong>
                                                    {source.title}
                                                </strong>

                                                <span>
                                                    {source.hospital}
                                                </span>

                                                <small>
                                                    {source.type}
                                                    {" • "}
                                                    {source.date
                                                        ? new Date(
                                                            source.date
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )
                                                        : "Date unavailable"}
                                                </small>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default AISummary;