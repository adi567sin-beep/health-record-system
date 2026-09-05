import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientDetails
    from "./pages/PatientDetails";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                  <Route
                    path="/doctor/login"
                    element={<Login />}
                />
                
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
 
              

                <Route
                    path="/patients/:patientId"
                    element={<PatientDetails />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;