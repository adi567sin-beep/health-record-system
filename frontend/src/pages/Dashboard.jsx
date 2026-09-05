import { useEffect, useState } from "react";

import API from "../services/api";
import Navbar from "../components/Navbar";
import PatientSearch from "../components/PatientSearch";

function Dashboard() {

    const [status, setStatus] = useState("Checking...");

    useEffect(() => {

        const checkBackend = async () => {

            try {

                const response = await API.get("/health");

                setStatus(
                    response.data.service +
                    " is running"
                );

            } catch (error) {

                console.error(
                    "Backend connection error:",
                    error
                );

                setStatus(
                    "Backend connection failed"
                );
            }
        };

        checkBackend();

    }, []);

    return (
        <div className="dashboard-page">

            <Navbar />

            <main className="dashboard-container">

                {/* Dashboard Header */}

                <section className="dashboard-header">

                    <div>

                        <h1>
                            Doctor Dashboard
                        </h1>

                        <p>
                            Secure access to authorized
                            patient medical histories.
                        </p>

                    </div>

                    <div className="backend-status">

                        <span className="status-dot"></span>

                        Backend:

                        <strong>
                            {status}
                        </strong>

                    </div>

                </section>


                {/* Patient Search */}

                <section className="search-section">

                    <PatientSearch />

                </section>


                {/* Dashboard Features */}

                <section className="dashboard-grid">

                    {/* Cross-Hospital Records */}

                    <div className="dashboard-card">

                        <div className="card-icon">
                            🏥
                        </div>

                        <h3>
                            Cross-Hospital Records
                        </h3>

                        <p>
                            Access authorized medical
                            records from multiple hospitals
                            through a unified interface.
                        </p>

                    </div>


                    {/* AI Medical Assistant */}

                    <div className="dashboard-card">

                        <div className="card-icon">
                            🤖
                        </div>

                        <h3>
                            AI Medical Assistant
                        </h3>

                        <p>
                            Ask questions about a patient's
                            medical history and receive
                            source-grounded answers.
                        </p>

                    </div>


                    {/* Secure Access */}

                    <div className="dashboard-card">

                        <div className="card-icon">
                            🔐
                        </div>

                        <h3>
                            Secure Access
                        </h3>

                        <p>
                            Patient consent and authorization
                            are required before medical
                            information is accessed.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;