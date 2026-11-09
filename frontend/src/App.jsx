import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddDiagnosis from "./pages/AddDiagnosis";
import PatientDetails from "./pages/PatientDetails";
import PatientDashboard from "./pages/PatientDashboard";
import PatientLink from "./pages/PatientLink";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/doctor/login" element={<Login />} />
                <Route path="/patient-link" element={<PatientLink />} />
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/patients/:patientId"
                    element={<PatientDetails />}
                />

                <Route
                    path="/patient-dashboard"
                    element={<PatientDashboard />}
                />
                <Route
    path="/patients/:patientId/add-diagnosis"
    element={<AddDiagnosis />}
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
