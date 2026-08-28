import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

    const { token } = useAuth();

    return (
        <Routes>

            <Route
                path="/login"
                element={token ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/students"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Principal", "Teacher"]}>
                        <Students />
                    </ProtectedRoute>
                }
            />

            <Route
                path="*"
                element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
            />

        </Routes>
    );
}

export default App;