import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReports, getFullReport, updatePrincipalComment } from "../services/api";
import { generateReportPdf } from "../utils/generateReportPdf";
import { useAuth } from "../context/AuthContext";

function Reports() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloadingId, setDownloadingId] = useState(null);

    const [commentReport, setCommentReport] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [savingComment, setSavingComment] = useState(false);
    const [commentError, setCommentError] = useState("");

    const { user } = useAuth();
    const navigate = useNavigate();

    const canComment = user?.role === "Principal" || user?.role === "Administrator";

    useEffect(() => {

        getReports()
            .then((data) => setReports(data))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));

    }, []);

    const handleDownload = async (reportId) => {

        setDownloadingId(reportId);
        setError("");

        try {

            const fullReport = await getFullReport(reportId);

            generateReportPdf(fullReport);

        } catch (error) {

            setError(error.message);

        } finally {

            setDownloadingId(null);
        }
    };

    const openCommentModal = (report) => {
        setCommentReport(report);
        setCommentText(report.principal_comment || "");
        setCommentError("");
    };

    const closeCommentModal = () => {
        setCommentReport(null);
    };

    const handleSaveComment = async (event) => {
        event.preventDefault();
        setSavingComment(true);
        setCommentError("");

        try {

            const updated = await updatePrincipalComment(commentReport.report_id, commentText);

            setReports(
                reports.map((r) =>
                    r.report_id === updated.report_id
                        ? { ...r, principal_comment: updated.principal_comment }
                        : r
                )
            );

            setCommentReport(null);

        } catch (error) {

            setCommentError(error.message);

        } finally {

            setSavingComment(false);
        }
    };

    return (
        <div className="page-container">

            <div className="page-header">

                <div>
                    <h1>Reports</h1>
                    <p>{reports.length} report{reports.length !== 1 ? "s" : ""} on record</p>
                </div>

                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>

            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-card">

                {loading ? (
                    <div className="state-message">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="state-message">No reports found.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Admission #</th>
                                <th>Term</th>
                                <th>Year</th>
                                <th>Average</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.report_id}>
                                    <td>{report.first_name} {report.last_name}</td>
                                    <td>{report.admission_number}</td>
                                    <td>{report.term_name}</td>
                                    <td>{report.year_name}</td>
                                    <td>{Number(report.overall_average).toFixed(1)}%</td>
                                    <td>{report.overall_grade}</td>
                                    <td>
                                        <span className="status-badge status-active">
                                            {report.report_status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="row-actions">

                                            <button
                                                className="row-action-button"
                                                onClick={() => handleDownload(report.report_id)}
                                                disabled={downloadingId === report.report_id}
                                            >
                                                {downloadingId === report.report_id
                                                    ? "Preparing..."
                                                    : "Download PDF"}
                                            </button>

                                            {canComment && (
                                                <button
                                                    className="row-action-button"
                                                    onClick={() => openCommentModal(report)}
                                                >
                                                    {report.principal_comment
                                                        ? "Edit Comment"
                                                        : "Add Comment"}
                                                </button>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

            </div>

            {commentReport && (
                <div className="modal-overlay" onClick={closeCommentModal}>
                    <div className="modal-box" onClick={(event) => event.stopPropagation()}>

                        <h2>Principal's Comment</h2>

                        <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: "#6b7280" }}>
                            {commentReport.first_name} {commentReport.last_name} ·{" "}
                            {commentReport.term_name}, {commentReport.year_name}
                        </p>

                        {commentReport.teacher_comment && (
                            <p style={{ margin: "0 0 14px 0", fontSize: "13px" }}>
                                <strong>Teacher's comment:</strong> {commentReport.teacher_comment}
                            </p>
                        )}

                        {commentError && <div className="error-message">{commentError}</div>}

                        <form onSubmit={handleSaveComment}>

                            <div className="modal-field capture-field">
                                <label>Comment</label>
                                <textarea
                                    value={commentText}
                                    onChange={(event) => setCommentText(event.target.value)}
                                    placeholder="Write your comment on this student's report..."
                                    rows={5}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={closeCommentModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="page-action-button"
                                    disabled={savingComment}
                                >
                                    {savingComment ? "Saving..." : "Save Comment"}
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Reports;