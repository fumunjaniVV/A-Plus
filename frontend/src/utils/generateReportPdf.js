import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function generateReportPdf(report) {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(31, 56, 100);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("A+ School Management System", 14, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Student Progress Report", 14, 21);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);

    let y = 40;

    const detailRow = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), 55, y);
        y += 7;
    };

    detailRow("Student:", `${report.first_name} ${report.last_name}`);
    detailRow("Admission No.:", report.admission_number);
    detailRow("Term / Year:", `${report.term_name}, ${report.year_name}`);
    detailRow("Status:", report.report_status);

    autoTable(doc, {
        startY: y + 4,
        head: [["Subject", "Teacher", "Mark (%)", "Grade"]],
        body: report.marks.map((m) => [
            m.subject_name,
            m.teacher_name || "-",
            Number(m.mark),
            m.grade,
        ]),
        headStyles: { fillColor: [31, 56, 100] },
        styles: { fontSize: 10 },
    });

    let cursorY = doc.lastAutoTable.finalY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Overall Average: ${Number(report.overall_average).toFixed(1)}%`, 14, cursorY);
    doc.text(`Overall Grade: ${report.overall_grade}`, 110, cursorY);
    cursorY += 14;

    const commentBlock = (title, text) => {

        if (cursorY > 255) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, 14, cursorY);

        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(text || "No comment provided.", pageWidth - 28);
        doc.text(lines, 14, cursorY + 6);

        cursorY += 6 + lines.length * 5 + 8;
    };

    commentBlock("Teacher's Comment", report.teacher_comment);
    commentBlock("Principal's Comment", report.principal_comment);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        14,
        doc.internal.pageSize.getHeight() - 10
    );

    const safeTerm = report.term_name.replace(/\s+/g, "");
    doc.save(`Report_${report.admission_number}_${safeTerm}_${report.year_name}.pdf`);
}