import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents } from "../services/api";

function Students() {

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        getStudents()
            .then((data) => setStudents(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Students</h1>
                    <p>{students.length} student{students.length !== 1 ? "s" : ""} on record</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-card">

                {loading ? (

                    <div className="state-message">Loading students...</div>

                ) : students.length === 0 ? (

                    <div className="state-message">No students found.</div>

                ) : (

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Admission #</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.student_id}>
                                    <td>{student.admission_number}</td>
                                    <td>{student.first_name}</td>
                                    <td>{student.last_name}</td>
                                    <td>
                                        <span
                                            className={`status-badge ${
                                                student.status === "Active"
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }`}
                                        >
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                )}

            </div>

        </div>
    );
}

export default Students;