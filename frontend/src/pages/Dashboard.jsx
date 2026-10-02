import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Users,
    GraduationCap,
    BookOpen,
    FileText,
    School,
    ClipboardList,
    UserRound,
    Settings
} from "lucide-react";

function Dashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = () => {

        setLoggingOut(true);

        logout();

        navigate("/login");
    };

    const dashboardOptions = {

        Administrator: [
            {
                title: "Students",
                description: "Manage all student records.",
                icon: <Users size={30} />,
                path: "/students"
            },
            {
                title: "Teachers",
                description: "Manage teachers and departments.",
                icon: <GraduationCap size={30} />,
                path: "/teachers"
            },
            {
                title: "Classes",
                description: "Manage classes and assignments.",
                icon: <School size={30} />,
                path: "/classes"
            },
            {
                title: "Reports",
                description: "View and manage academic reports.",
                icon: <FileText size={30} />,
                path: "/reports"
            },
            {
                title: "Subjects",
                description: "Manage school subjects.",
                icon: <BookOpen size={30} />,
                path: "/subjects"
            },
            {
                title: "Users",
                description: "Manage system user accounts.",
                icon: <Settings size={30} />,
                path: "/users"
            }
        ],

        Principal: [
            {
                title: "Students",
                description: "View student information.",
                icon: <Users size={30} />,
                path: "/students"
            },
            {
                title: "Teachers",
                description: "View teacher information.",
                icon: <GraduationCap size={30} />,
                path: "/teachers"
            },
            {
                title: "Reports",
                description: "Review academic reports.",
                icon: <FileText size={30} />,
                path: "/reports"
            },
            {
                title: "Academic Overview",
                description: "Monitor school performance.",
                icon: <ClipboardList size={30} />
            }
        ],

        Teacher: [
            {
                title: "My Students",
                description: "View assigned students.",
                icon: <Users size={30} />,
                path: "/students"
            },
            {
                title: "My Classes",
                description: "View teaching classes.",
                icon: <School size={30} />,
                path: "/classes"
            },
            {
                title: "Capture Marks",
                description: "Record marks and generate a report for a student.",
                icon: <ClipboardList size={30} />,
                path: "/marks/capture"
            },
            {
                title: "Marks",
                description: "View recorded marks.",
                icon: <ClipboardList size={30} />,
                path: "/marks"
            },
            {
                title: "Reports",
                description: "View student reports.",
                icon: <FileText size={30} />,
                path: "/reports"
            }
        ],

        Student: [
            {
                title: "My Profile",
                description: "View your personal information.",
                icon: <UserRound size={30} />,
                path: "/my/profile"
            },
            {
                title: "Subjects",
                description: "Browse the subjects offered at school.",
                icon: <BookOpen size={30} />,
                path: "/subjects"
            },
            {
                title: "My Marks",
                description: "View your academic marks.",
                icon: <ClipboardList size={30} />,
                path: "/my/marks"
            },
            {
                title: "My Reports",
                description: "View and download your school reports.",
                icon: <FileText size={30} />,
                path: "/reports"
            }
        ]
    };

    const cards = dashboardOptions[user?.role] || [];

    return (
        <div className="dashboard-page">

            <header className="dashboard-header">

                <div className="dashboard-brand">
                    <h1>A+</h1>
                    <span>School Management System</span>
                </div>

                <div className="dashboard-user">

                    <div>
                        <strong>{user?.full_name}</strong>
                        <span>{user?.role}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? "Signing out..." : "Sign Out"}
                    </button>

                </div>

            </header>

            <main className="dashboard-content">

                <div className="dashboard-welcome">

                    <h2>
                        Welcome back, {user?.full_name}!
                    </h2>

                    <p>
                        {user?.role} Dashboard
                    </p>

                </div>

                <div className="dashboard-grid">

                    {cards.map((card) => (

                        <div
                            className="dashboard-card"
                            key={card.title}
                            onClick={() => card.path && navigate(card.path)}
                            style={{ cursor: card.path ? "pointer" : "default" }}
                        >

                            <div className="dashboard-icon">
                                {card.icon}
                            </div>

                            <h3>{card.title}</h3>

                            <p>{card.description}</p>

                        </div>

                    ))}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;