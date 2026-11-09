import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [role, setRole] = useState("doctor");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.post("/auth/login", {
                email,
                password,
                role
            });

            // Verify that the returned role matches the selected role.
            if (response.data.user.role !== role) {
                setError("This account does not match the selected login type.");
                return;
            }

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate(
                role === "patient" ? "/patient-dashboard" : "/dashboard"
            );
        } catch (error) {
            console.error("Login error:", error);

            setError(
                error.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="medical-icon stethoscope">♡</div>
            <div className="medical-icon network">✣</div>
            <div className="medical-icon heart">♡</div>
            <div className="medical-icon caduceus">⚕</div>
            <div className="medical-icon network network-two">✣</div>
            <div className="medical-icon caduceus caduceus-two">⚕</div>
            <div className="sparkle">✦</div>

            <header className="login-header">
                <div className="brand" onClick={() => navigate("/")}>
                    HealthRecord AI
                </div>

                <nav className="login-nav">
                    <a href="#about">About</a>
                    <a href="#security">Security</a>
                    <a href="#support">Support</a>
                </nav>
            </header>

            <main className="login-main">
                <section className="login-hero">
                    <h1>HealthRecord AI</h1>
                    <p>Secure Cross-Hospital Medical Record System</p>
                </section>

                <div className="login-card">
                    <div className="login-card-header">
                        <h2>
                            {role === "doctor" ? "Doctor Login" : "Patient Login"}
                        </h2>
                        <p>
                            {role === "doctor"
                                ? "Sign in to securely access authorized patient records."
                                : "Sign in securely to access your own health records."}
                        </p>
                    </div>

                    <div className="login-role-switch">
                        <button
                            type="button"
                            className={role === "doctor" ? "active" : ""}
                            onClick={() => {
                                setRole("doctor");
                                setError("");
                            }}
                        >
                            Doctor
                        </button>

                        <button
                            type="button"
                            className={role === "patient" ? "active" : ""}
                            onClick={() => {
                                setRole("patient");
                                setError("");
                            }}
                        >
                            Patient
                        </button>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={
                                        role === "doctor"
                                            ? "doctor@example.com"
                                            : "patient@example.com"
                                    }
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                                <span className="input-icon">✉</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <span className="input-icon">🔒</span>
                            </div>
                        </div>

                        {error && (
                            <div className="login-error">{error}</div>
                        )}

                        <button
                            type="submit"
                            className="sign-in-button"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="or-divider">
                        <span></span>
                        <p>OR</p>
                        <span></span>
                    </div>

                    <div className="login-options">
                        <button
                            type="button"
                            className="text-button"
                            onClick={() => alert("Password recovery coming soon.")}
                        >
                            Forgot Password?
                        </button>

                        {role === "doctor" && (
                            <button
                                type="button"
                                className="text-button"
                                onClick={() => navigate("/register")}
                            >
                                Create Account
                                <span>(Healthcare Personnel Only)</span>
                            </button>
                        )}

                        {role === "patient" && (
                            <button
                                type="button"
                                className="text-button"
                                onClick={() => navigate("/patient-register")}
                            >
                                Create Patient Account
                            </button>
                        )}

                        <button
                            type="button"
                            className="mfa-button"
                            onClick={() => alert("MFA/SSO options coming soon.")}
                        >
                            MFA/SSO Options
                        </button>
                    </div>

                    <div className="security-notice">
                        <span className="security-lock">🔒</span>
                        <span>
                            {role === "doctor"
                                ? "Authorized healthcare personnel only. Access is monitored."
                                : "Your health information is protected. Access is monitored."}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Login;
