import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTeachers } from "../services/api";

function Teachers() {

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        getTeachers()
            .then((data) => setTeachers(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Teachers</h1>
                    <p>{teachers.length} teacher{teachers.length !== 1 ? "s" : ""} on record</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading teachers...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : teachers.length === 0 ? (
                    <div className="state-message">No teachers found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => (
                                <tr key={teacher.teacher_id}>
                                    <td>{teacher.full_name}</td>
                                    <td>{teacher.email}</td>
                                    <td>{teacher.department}</td>
                                    <td>{teacher.phone_number}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}

export default Teachers;