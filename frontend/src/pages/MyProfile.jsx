import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, getClasses } from "../services/api";

function MyProfile() {

    const [student, setStudent] = useState(null);
    const [className, setClassName] = useState("-");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        Promise.all([getStudents(), getClasses()])
            .then(([students, classes]) => {

                const me = students[0] || null;
                setStudent(me);

                const myClass = classes.find((c) => c.class_id === me?.class_id);
                if (myClass) {
                    setClassName(myClass.class_name);
                }
            })
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    const rows = student
        ? [
            ["Admission Number", student.admission_number],
            ["First Name", student.first_name],
            ["Last Name", student.last_name],
            ["Gender", student.gender],
            ["Date of Birth", student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : "-"],
            ["Class", className],
            ["Status", student.status],
        ]
        : [];

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>My Profile</h1>
                    <p>Your personal information</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading profile...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : !student ? (
                    <div className="state-message">No student record is linked to this account.</div>
                ) : (
                    <table className="data-table">
                        <tbody>
                            {rows.map(([label, value]) => (
                                <tr key={label}>
                                    <td><strong>{label}</strong></td>
                                    <td>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}

export default MyProfile;