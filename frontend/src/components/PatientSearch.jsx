import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PatientSearch() {

    const [patientId, setPatientId] = useState("");

    const navigate = useNavigate();

    const handleSearch = (event) => {

        event.preventDefault();

        const trimmedPatientId =
            patientId.trim();

        if (!trimmedPatientId) {
            alert("Please enter a patient ID.");
            return;
        }

        navigate(
            `/patients/${trimmedPatientId}`
        );
    };

    return (
        <div className="patient-search">

            <h2>Search Patient</h2>

            <form onSubmit={handleSearch}>

                <input
                    type="text"
                    placeholder="Enter Patient ID"
                    value={patientId}
                    onChange={(event) =>
                        setPatientId(event.target.value)
                    }
                />

                <button type="submit">
                    Search
                </button>

            </form>

        </div>
    );
}

export default PatientSearch;