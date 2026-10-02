import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, getFullReport } from "../services/api";

function MyMarks() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {

        getReports()
            .then((list) => Promise.all(list.map((r) => getFullReport(r.report_id))))
            .then((fullReports) => setReports(fullReports))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>My Marks</h1>
                    <p>Your marks, grouped by report</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            {loading && <div className="state-message">Loading marks...</div>}

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && reports.length === 0 && (
                <div className="state-message">No marks recorded yet.</div>
            )}

            {reports.map((report) => (
                <div
                    className="table-card"
                    key={report.report_id}
                    style={{ marginBottom: "20px" }}
                >

                    <div
                        style={{
                            padding: "16px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <strong>{report.term_name}, {report.year_name}</strong>
                        <span>
                            Average: {Number(report.overall_average).toFixed(1)}% · Grade:{" "}
                            {report.overall_grade || "-"}
                        </span>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Mark (%)</th>
                                <th>Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.marks.map((mark) => (
                                <tr key={mark.subject_name}>
                                    <td>{mark.subject_name}</td>
                                    <td>{mark.teacher_name || "-"}</td>
                                    <td>{Number(mark.mark)}</td>
                                    <td>{mark.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            ))}

        </div>
    );
}

export default MyMarks;