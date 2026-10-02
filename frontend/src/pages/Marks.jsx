import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, getReports, getFullReport } from "../services/api";

function Marks() {

    const [students, setStudents] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentReports, setStudentReports] = useState([]);
    const [loadingMarks, setLoadingMarks] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        Promise.all([getStudents(), getReports()])
            .then(([studentsData, reportsData]) => {
                setStudents(studentsData);
                setReports(reportsData);
            })
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    const openStudent = async (student) => {

        setSelectedStudent(student);
        setStudentReports([]);
        setError("");
        setLoadingMarks(true);

        try {

            const theirReports = reports.filter(
                (report) => report.student_id === student.student_id
            );

            const fullReports = await Promise.all(
                theirReports.map((report) => getFullReport(report.report_id))
            );

            setStudentReports(fullReports);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoadingMarks(false);
        }
    };

    const closeStudent = () => {
        setSelectedStudent(null);
        setStudentReports([]);
        setError("");
    };

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    {selectedStudent ? (
                        <>
                            <h1>{selectedStudent.first_name} {selectedStudent.last_name}</h1>
                            <p>Admission No. {selectedStudent.admission_number}</p>
                        </>
                    ) : (
                        <>
                            <h1>Marks</h1>
                            <p>Select a student to view their marks</p>
                        </>
                    )}
                </div>

                {selectedStudent ? (
                    <button className="back-button" onClick={closeStudent}>
                        Back to Students
                    </button>
                ) : (
                    <button className="back-button" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </button>
                )}

            </div>

            {error && <div className="error-message">{error}</div>}

            {!selectedStudent && (
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
                                    <th>Reports</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr
                                        key={student.student_id}
                                        onClick={() => openStudent(student)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{student.admission_number}</td>
                                        <td>{student.first_name}</td>
                                        <td>{student.last_name}</td>
                                        <td>
                                            {reports.filter((r) => r.student_id === student.student_id).length}
                                        </td>
                                        <td>
                                            <button className="row-action-button">View Marks</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </div>
            )}

            {selectedStudent && (
                <>
                    {loadingMarks && <div className="state-message">Loading marks...</div>}

                    {!loadingMarks && !error && studentReports.length === 0 && (
                        <div className="state-message">No marks recorded for this student yet.</div>
                    )}

                    {studentReports.map((report) => (
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
                                    {report.marks.map((mark, index) => (
                                        <tr key={`${mark.subject_name}-${index}`}>
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
                </>
            )}

        </div>
    );
}

export default Marks;