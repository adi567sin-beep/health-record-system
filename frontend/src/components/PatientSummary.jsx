function PatientSummary({ patient }) {

    if (!patient) {
        return null;
    }

    const formattedDate = patient.dateOfBirth
        ? new Date(
            patient.dateOfBirth
        ).toLocaleDateString()
        : "Not available";

    return (
        <section className="patient-summary">

            <h2>Patient Information</h2>

            <div className="patient-details">

                <div>
                    <strong>Name</strong>
                    <p>{patient.name}</p>
                </div>

                <div>
                    <strong>Patient ID</strong>
                    <p>{patient.patientId}</p>
                </div>

                <div>
                    <strong>Date of Birth</strong>
                    <p>{formattedDate}</p>
                </div>

                <div>
                    <strong>Gender</strong>
                    <p>
                        {patient.gender || "Not available"}
                    </p>
                </div>

                <div>
                    <strong>Phone</strong>
                    <p>
                        {patient.phone || "Not available"}
                    </p>
                </div>

                <div>
                    <strong>Email</strong>
                    <p>
                        {patient.email || "Not available"}
                    </p>
                </div>

            </div>

        </section>
    );
}

export default PatientSummary;