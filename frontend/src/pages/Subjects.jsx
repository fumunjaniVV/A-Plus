import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSubjects } from "../services/api";

function Subjects() {

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        getSubjects()
            .then((data) => setSubjects(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Subjects</h1>
                    <p>{subjects.length} subject{subjects.length !== 1 ? "s" : ""} on record</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading subjects...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : subjects.length === 0 ? (
                    <div className="state-message">No subjects found.</div>
                ) : (
                    // Subjects table only has two real fields, so this table is intentionally simple
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Subject Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject) => (
                                <tr key={subject.subject_id}>
                                    <td>{subject.subject_code}</td>
                                    <td>{subject.subject_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}

export default Subjects;