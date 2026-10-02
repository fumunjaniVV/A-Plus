import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getClasses } from "../services/api";

function Classes() {

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        getClasses()
            .then((data) => setClasses(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Classes</h1>
                    <p>{classes.length} class{classes.length !== 1 ? "es" : ""} on record</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading classes...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : classes.length === 0 ? (
                    <div className="state-message">No classes found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Class Name</th>
                                <th>Grade</th>
                                {/* New column: shows "General" for 8A/9A, since
                                    their stream value is null */}
                                <th>Stream</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map((cls) => (
                                <tr key={cls.class_id}>
                                    <td>{cls.class_name}</td>
                                    <td>{cls.grade}</td>
                                    <td>{cls.stream || "General"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}

export default Classes;