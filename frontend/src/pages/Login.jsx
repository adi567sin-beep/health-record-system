import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

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
                password
            });

            // Store authentication information
            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            // Go to dashboard
            navigate("/dashboard");

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
        
            {/* Background medical decorations */}
            <div className="medical-icon stethoscope">
                ♡
            </div>

            <div className="medical-icon network">
                ✣
            </div>

            <div className="medical-icon heart">
                ♡
            </div>

            <div className="medical-icon caduceus">
                ⚕
            </div>

            <div className="medical-icon network network-two">
                ✣
            </div>

            <div className="medical-icon caduceus caduceus-two">
                ⚕
            </div>

            <div className="sparkle">
                ✦
            </div>


            {/* Header */}

            <header className="login-header">

                <div
                    className="brand"
                    onClick={() => navigate("/")}
                >
                    HealthRecord AI
                </div>

                <nav className="login-nav">
                    <a href="#about">About</a>
                    <a href="#security">Security</a>
                    <a href="#support">Support</a>
                </nav>

            </header>


            {/* Main content */}

            <main className="login-main">

                <section className="login-hero">

                    <h1>
                        HealthRecord AI
                    </h1>

                    <p>
                        Secure Cross-Hospital Medical Record System
                    </p>

                </section>


                {/* Login Card */}

                <div className="login-card">

                    <div className="login-card-header">

                        <h2>
                            Doctor Login
                        </h2>

                        <p>
                            Sign in to securely access authorized
                            patient records.
                        </p>

                    </div>


                    <form onSubmit={handleLogin}>

                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    autoComplete="email"
                                />

                                <span className="input-icon">
                                    ✉
                                </span>

                            </div>

                        </div>


                        {/* Password */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                />

                                <span className="input-icon">
                                    🔒
                                </span>

                            </div>

                        </div>


                        {/* Error */}

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}


                        {/* Sign In */}

                        <button
                            type="submit"
                            className="sign-in-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing In..."
                                : "Sign In"}
                        </button>

                    </form>


                    {/* OR */}

                    <div className="or-divider">

                        <span></span>

                        <p>OR</p>

                        <span></span>

                    </div>


                    {/* Other options */}

                    <div className="login-options">

                        <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                                alert("Password recovery coming soon.")
                            }
                        >
                            Forgot Password?
                        </button>


                        <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create Account
                            <span>
                                (Healthcare Personnel Only)
                            </span>
                        </button>


                        <button
                            type="button"
                            className="mfa-button"
                            onClick={() =>
                                alert("MFA/SSO options coming soon.")
                            }
                        >
                            MFA/SSO Options
                        </button>

                    </div>


                    {/* Security notice */}

                    <div className="security-notice">

                        <span className="security-lock">
                            🔒
                        </span>

                        <span>
                            Authorized healthcare personnel only.
                            Access is monitored.
                        </span>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Login;