import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-container">

                <Link
                    to="/dashboard"
                    className="navbar-brand"
                >
                    HealthRecord AI
                </Link>

                <div className="navbar-links">

                    <Link
                        to="/dashboard"
                        className="navbar-link"
                    >
                        Dashboard
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;