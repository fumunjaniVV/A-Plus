import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Reports from "./pages/Reports";
import Marks from "./pages/Marks";
import CaptureMarks from "./pages/CaptureMarks";
import Users from "./pages/Users";
import MyProfile from "./pages/MyProfile";
import MyMarks from "./pages/MyMarks";
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
                path="/teachers"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Principal"]}>
                        <Teachers />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/classes"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Principal", "Teacher"]}>
                        <Classes />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/subjects"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Teacher", "Principal", "Student"]}>
                        <Subjects />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Principal", "Teacher", "Student"]}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/marks"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Teacher"]}>
                        <Marks />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/marks/capture"
                element={
                    <ProtectedRoute allowedRoles={["Administrator", "Teacher"]}>
                        <CaptureMarks />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={["Administrator"]}>
                        <Users />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my/profile"
                element={
                    <ProtectedRoute allowedRoles={["Student"]}>
                        <MyProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my/marks"
                element={
                    <ProtectedRoute allowedRoles={["Student"]}>
                        <MyMarks />
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