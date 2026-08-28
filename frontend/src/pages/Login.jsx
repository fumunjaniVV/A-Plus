import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await loginUser(username, password);

            login(data);

            navigate("/dashboard");

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="login-page">

            <div className="login-left">

                <div className="branding">

                    <h1>A+</h1>

                    <h2>School Management System</h2>

                    <p>
                        A professional platform for managing
                        students, teachers, classes,
                        academic years and reports.
                    </p>

                </div>

            </div>

            <div className="login-right">

                <div className="login-card">

                    <h2>Welcome Back</h2>

                    <p>Sign in to continue</p>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <label>Username</label>

                        <div className="input-group">

                            <User size={20} />

                            <input
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                            />

                        </div>

                        <label>Password</label>

                        <div className="input-group">

                            <Lock size={20} />

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                            />

                            {showPassword ? (

                                <EyeOff
                                    size={20}
                                    className="eye-icon"
                                    onClick={() =>
                                        setShowPassword(false)
                                    }
                                />

                            ) : (

                                <Eye
                                    size={20}
                                    className="eye-icon"
                                    onClick={() =>
                                        setShowPassword(true)
                                    }
                                />

                            )}

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading ? "Signing in..." : "Sign In"}

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Login;