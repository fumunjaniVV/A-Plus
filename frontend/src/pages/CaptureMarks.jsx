import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getStudents,
    getSubjects,
    getTerms,
    getAcademicYears,
    getMyTeacherProfile,
    createReport,
    createMark,
} from "../services/api";

function calculateOverallGrade(average) {
    if (average >= 80) return "A";
    if (average >= 70) return "B";
    if (average >= 60) return "C";
    if (average >= 50) return "D";
    if (average >= 40) return "E";
    return "F";
}

const emptyMarkRow = { subject_id: "", mark: "", grade: "" };

function CaptureMarks() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [terms, setTerms] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [myTeacherId, setMyTeacherId] = useState(null);

    const [loadingData, setLoadingData] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [studentId, setStudentId] = useState("");
    const [termId, setTermId] = useState("");
    const [academicYearId, setAcademicYearId] = useState("");
    const [teacherComment, setTeacherComment] = useState("");
    const [markRows, setMarkRows] = useState([{ ...emptyMarkRow }]);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {

        Promise.all([
            getStudents(),
            getSubjects(),
            getTerms(),
            getAcademicYears(),
            getMyTeacherProfile(),
        ])
            .then(([studentsData, subjectsData, termsData, yearsData, teacherProfile]) => {
                setStudents(studentsData);
                setSubjects(subjectsData);
                setTerms(termsData);
                setAcademicYears(yearsData);
                setMyTeacherId(teacherProfile.teacher_id);
            })
            .catch((error) => setLoadError(error.message))
            .finally(() => setLoadingData(false));

    }, []);

    const handleMarkRowChange = (index, field, value) => {
        const updated = [...markRows];
        updated[index] = { ...updated[index], [field]: value };
        setMarkRows(updated);
    };

    const addMarkRow = () => {
        setMarkRows([...markRows, { ...emptyMarkRow }]);
    };

    const removeMarkRow = (index) => {
        setMarkRows(markRows.filter((_, i) => i !== index));
    };

    const validMarks = markRows
        .map((row) => parseFloat(row.mark))
        .filter((mark) => !isNaN(mark));

    const overallAverage = validMarks.length > 0
        ? validMarks.reduce((sum, mark) => sum + mark, 0) / validMarks.length
        : 0;

    const overallGrade = calculateOverallGrade(overallAverage);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");
        setSuccessMessage("");

        if (!studentId || !termId || !academicYearId) {
            setSubmitError("Please select a student, term, and academic year.");
            return;
        }

        const completeRows = markRows.filter(
            (row) => row.subject_id && row.mark !== "" && row.grade
        );

        if (completeRows.length === 0) {
            setSubmitError("Please add at least one complete subject, mark, and grade.");
            return;
        }

        setSubmitting(true);

        try {

            const report = await createReport({
                student_id: Number(studentId),
                term_id: Number(termId),
                academic_year_id: Number(academicYearId),
                teacher_comment: teacherComment,
                principal_comment: "",
                overall_average: Math.round(overallAverage * 10) / 10,
                overall_grade: overallGrade,
                report_status: "Draft",
            });

            for (const row of completeRows) {
                await createMark({
                    report_id: report.report_id,
                    subject_id: Number(row.subject_id),
                    teacher_id: myTeacherId,
                    mark: Number(row.mark),
                    grade: row.grade,
                });
            }

            setSuccessMessage("Report and marks saved successfully.");
            setStudentId("");
            setTermId("");
            setAcademicYearId("");
            setTeacherComment("");
            setMarkRows([{ ...emptyMarkRow }]);

        } catch (error) {

            setSubmitError(error.message);

        } finally {

            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="page-container">
                <div className="state-message">Loading form...</div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="page-container">
                <div className="error-message">{loadError}</div>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Capture Marks</h1>
                    <p>Record subject marks and generate a report</p>
                </div>
                <button className="back-button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {submitError && <div className="error-message">{submitError}</div>}

            <form onSubmit={handleSubmit}>

                <div className="capture-header-fields">

                    <div className="capture-field">
                        <label>Student</label>
                        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
                            <option value="">Select student</option>
                            {students.map((student) => (
                                <option key={student.student_id} value={student.student_id}>
                                    {student.first_name} {student.last_name} ({student.admission_number})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="capture-field">
                        <label>Term</label>
                        <select value={termId} onChange={(e) => setTermId(e.target.value)} required>
                            <option value="">Select term</option>
                            {terms.map((term) => (
                                <option key={term.term_id} value={term.term_id}>
                                    {term.term_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="capture-field">
                        <label>Academic Year</label>
                        <select value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)} required>
                            <option value="">Select year</option>
                            {academicYears.map((year) => (
                                <option key={year.academic_year_id} value={year.academic_year_id}>
                                    {year.year_name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="table-card" style={{ padding: "20px" }}>

                    <h3 style={{ marginTop: 0 }}>Subject Marks</h3>

                    {markRows.map((row, index) => (
                        <div className="mark-row" key={index}>

                            <div>
                                <label>Subject</label>
                                <select
                                    value={row.subject_id}
                                    onChange={(e) => handleMarkRowChange(index, "subject_id", e.target.value)}
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.subject_id} value={subject.subject_id}>
                                            {subject.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label>Mark (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={row.mark}
                                    onChange={(e) => handleMarkRowChange(index, "mark", e.target.value)}
                                />
                            </div>

                            <div>
                                <label>Grade</label>
                                <input
                                    type="text"
                                    placeholder="e.g. A"
                                    value={row.grade}
                                    onChange={(e) => handleMarkRowChange(index, "grade", e.target.value)}
                                />
                            </div>

                            <button
                                type="button"
                                className="remove-row-button"
                                onClick={() => removeMarkRow(index)}
                                disabled={markRows.length === 1}
                            >
                                Remove
                            </button>

                        </div>
                    ))}

                    <button type="button" className="add-row-button" onClick={addMarkRow}>
                        + Add Subject
                    </button>

                    <div className="summary-box">
                        <span>Overall Average: <strong>{overallAverage.toFixed(1)}%</strong></span>
                        <span>Overall Grade: <strong>{overallGrade}</strong></span>
                    </div>

                </div>

                <div className="capture-field" style={{ marginTop: "20px" }}>
                    <label>Teacher Comment</label>
                    <textarea
                        value={teacherComment}
                        onChange={(e) => setTeacherComment(e.target.value)}
                        placeholder="Write a comment about this student's performance..."
                    />
                </div>

                <button
                    type="submit"
                    className="page-action-button"
                    style={{ marginTop: "16px" }}
                    disabled={submitting}
                >
                    {submitting ? "Saving..." : "Save Report and Marks"}
                </button>

            </form>

        </div>
    );
}

export default CaptureMarks;