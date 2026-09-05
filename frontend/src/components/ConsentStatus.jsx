import { useEffect, useState } from "react";
import API from "../services/api";

function ConsentStatus({ patientId }) {

    const [consent, setConsent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revoking, setRevoking] = useState(false);
    const [granting, setGranting] = useState(false);


    // ==========================================
    // LOAD CONSENT
    // ==========================================
    const loadConsent = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await API.get(
                `/consent/${patientId}`
            );

            setConsent(response.data.consent);

        } catch (error) {

            if (error.response?.status === 404) {

                setConsent(null);

                setError(
                    "No active consent found."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Unable to retrieve consent."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadConsent();

    }, [patientId]);


    // ==========================================
    // GRANT CONSENT
    // ==========================================
    const handleGrant = async () => {

        try {

            setGranting(true);
            setError("");

            // Consent will be valid for 1 year
            const expiryDate = new Date();

            expiryDate.setFullYear(
                expiryDate.getFullYear() + 1
            );


            const response = await API.post(
                "/consent/grant",
                {
                    patientId,

                    expiresAt:
                        expiryDate.toISOString(),

                    permissions: {

                        medicalHistory: true,

                        medications: true,

                        laboratoryResults: true,

                        procedures: true,

                        allergies: true
                    }
                }
            );


            setConsent(
                response.data.consent
            );

            setError("");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to grant consent."
            );

        } finally {

            setGranting(false);
        }
    };


    // ==========================================
    // REVOKE CONSENT
    // ==========================================
    const handleRevoke = async () => {

        if (!consent?._id) {
            return;
        }


        const confirmed = window.confirm(
            "Are you sure you want to revoke this patient's consent?"
        );


        if (!confirmed) {
            return;
        }


        try {

            setRevoking(true);
            setError("");

            await API.patch(
                `/consent/revoke/${consent._id}`
            );


            setConsent(null);

            setError(
                "Consent has been revoked."
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to revoke consent."
            );

        } finally {

            setRevoking(false);
        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================
    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }


        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // ==========================================
    // LOADING
    // ==========================================
    if (loading) {

        return (
            <section className="consent-card">

                <h2>
                    Consent Status
                </h2>

                <p>
                    Checking consent...
                </p>

            </section>
        );
    }


    // ==========================================
    // NO ACTIVE CONSENT
    // ==========================================
    if (!consent) {

        return (
            <section className="consent-card consent-inactive">

                <div className="consent-header">

                    <div>

                        <h2>
                            Consent Status
                        </h2>

                        <p>
                            Patient authorization is required
                            before accessing medical records.
                        </p>

                    </div>


                    <span className="consent-badge inactive">
                        Inactive
                    </span>

                </div>


                <p className="consent-error">
                    {error}
                </p>


                <div className="consent-actions">

                    <button
                        type="button"
                        className="grant-button"
                        onClick={handleGrant}
                        disabled={granting}
                    >

                        {granting
                            ? "Granting..."
                            : "Grant Consent"}

                    </button>

                </div>

            </section>
        );
    }


    // ==========================================
    // ACTIVE CONSENT
    // ==========================================
    return (
        <section className="consent-card">

            <div className="consent-header">

                <div>

                    <h2>
                        Consent Status
                    </h2>

                    <p>
                        Patient has authorized access to
                        medical information.
                    </p>

                </div>


                <span className="consent-badge active">
                    Active
                </span>

            </div>


            {/* CONSENT DETAILS */}
            <div className="consent-details">

                <div>

                    <strong>
                        Status
                    </strong>

                    <p>
                        {consent.status}
                    </p>

                </div>


                <div>

                    <strong>
                        Granted On
                    </strong>

                    <p>
                        {formatDate(
                            consent.createdAt
                        )}
                    </p>

                </div>


                <div>

                    <strong>
                        Expires On
                    </strong>

                    <p>
                        {formatDate(
                            consent.expiresAt
                        )}
                    </p>

                </div>

            </div>


            {/* PERMISSIONS */}
            <div className="permissions">

                <h3>
                    Authorized Permissions
                </h3>


                <div className="permission-list">

                    <div>
                        {consent.permissions?.medicalHistory
                            ? "✓"
                            : "✕"}
                        {" "}
                        Medical History
                    </div>


                    <div>
                        {consent.permissions?.medications
                            ? "✓"
                            : "✕"}
                        {" "}
                        Medications
                    </div>


                    <div>
                        {consent.permissions?.laboratoryResults
                            ? "✓"
                            : "✕"}
                        {" "}
                        Laboratory Results
                    </div>


                    <div>
                        {consent.permissions?.procedures
                            ? "✓"
                            : "✕"}
                        {" "}
                        Procedures
                    </div>


                    <div>
                        {consent.permissions?.allergies
                            ? "✓"
                            : "✕"}
                        {" "}
                        Allergies
                    </div>

                </div>

            </div>


            {/* REVOKE BUTTON */}
            <div className="consent-actions">

                <button
                    type="button"
                    className="revoke-button"
                    onClick={handleRevoke}
                    disabled={revoking}
                >

                    {revoking
                        ? "Revoking..."
                        : "Revoke Consent"}

                </button>

            </div>

        </section>
    );
}

export default ConsentStatus;