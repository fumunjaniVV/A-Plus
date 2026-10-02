const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {

        const baseQuery =
            `SELECT r.*, s.first_name, s.last_name, s.admission_number,
                    t.term_name, ay.year_name
             FROM reports r
             JOIN students s ON s.student_id = r.student_id
             JOIN terms t ON t.term_id = r.term_id
             JOIN academic_years ay ON ay.academic_year_id = r.academic_year_id`;

        if (req.user.role === 'Student') {

            const result = await pool.query(
                `${baseQuery} WHERE s.user_id = $1 ORDER BY r.report_id`,
                [req.user.user_id]
            );

            return res.status(200).json(result.rows);
        }

        const result = await pool.query(`${baseQuery} ORDER BY r.report_id`);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error retrieving reports:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve reports'
        });
    }
});


router.get('/:id/full', async (req, res) => {
    try {
        const { id } = req.params;

        const reportResult = await pool.query(
            `SELECT r.report_id, r.overall_average, r.overall_grade,
                    r.teacher_comment, r.principal_comment, r.report_status,
                    s.first_name, s.last_name, s.admission_number,
                    s.user_id AS student_user_id,
                    t.term_name, ay.year_name
             FROM reports r
             JOIN students s ON s.student_id = r.student_id
             JOIN terms t ON t.term_id = r.term_id
             JOIN academic_years ay ON ay.academic_year_id = r.academic_year_id
             WHERE r.report_id = $1`,
            [id]
        );

        if (reportResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        const report = reportResult.rows[0];

        if (req.user.role === 'Student' && report.student_user_id !== req.user.user_id) {
            return res.status(403).json({
                error: 'You do not have permission to view this report'
            });
        }

        delete report.student_user_id;

        const marksResult = await pool.query(
            `SELECT sub.subject_name, m.mark, m.grade, u.full_name AS teacher_name
             FROM marks m
             JOIN subjects sub ON sub.subject_id = m.subject_id
             LEFT JOIN teachers te ON te.teacher_id = m.teacher_id
             LEFT JOIN users u ON u.user_id = te.user_id
             WHERE m.report_id = $1
             ORDER BY sub.subject_name`,
            [id]
        );

        res.status(200).json({
            ...report,
            marks: marksResult.rows
        });

    } catch (error) {
        console.error('Error retrieving full report:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve full report'
        });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM reports WHERE report_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        const report = result.rows[0];

        if (req.user.role === 'Student') {

            const ownerCheck = await pool.query(
                'SELECT user_id FROM students WHERE student_id = $1',
                [report.student_id]
            );

            const isOwner = ownerCheck.rows.length > 0
                && ownerCheck.rows[0].user_id === req.user.user_id;

            if (!isOwner) {
                return res.status(403).json({
                    error: 'You do not have permission to view this report'
                });
            }
        }

        res.status(200).json(report);

    } catch (error) {
        console.error('Error retrieving report:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve report'
        });
    }
});


router.post('/', verifyRole('Teacher', 'Administrator'), async (req, res) => {
    try {
        const {
            student_id,
            term_id,
            academic_year_id,
            teacher_comment,
            principal_comment,
            overall_average,
            overall_grade,
            report_status
        } = req.body;

        const result = await pool.query(
            `INSERT INTO reports
            (
                student_id,
                term_id,
                academic_year_id,
                teacher_comment,
                principal_comment,
                overall_average,
                overall_grade,
                report_status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                student_id,
                term_id,
                academic_year_id,
                teacher_comment,
                principal_comment,
                overall_average,
                overall_grade,
                report_status
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating report:', error.message);

        res.status(500).json({
            error: 'Failed to create report'
        });
    }
});


router.put('/:id/principal-comment', verifyRole('Principal', 'Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { principal_comment } = req.body;

        if (typeof principal_comment !== 'string') {
            return res.status(400).json({
                error: 'principal_comment must be text'
            });
        }

        const result = await pool.query(
            `UPDATE reports
             SET principal_comment = $1
             WHERE report_id = $2
             RETURNING report_id, principal_comment`,
            [principal_comment.trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error saving principal comment:', error.message);

        res.status(500).json({
            error: 'Failed to save principal comment'
        });
    }
});


router.put('/:id', verifyRole('Teacher', 'Principal', 'Administrator'), async (req, res) => {
    try {
        const { id } = req.params;

        const {
            student_id,
            term_id,
            academic_year_id,
            teacher_comment,
            principal_comment,
            overall_average,
            overall_grade,
            report_status
        } = req.body;

        const result = await pool.query(
            `UPDATE reports
             SET
                student_id = $1,
                term_id = $2,
                academic_year_id = $3,
                teacher_comment = $4,
                principal_comment = $5,
                overall_average = $6,
                overall_grade = $7,
                report_status = $8
             WHERE report_id = $9
             RETURNING *`,
            [
                student_id,
                term_id,
                academic_year_id,
                teacher_comment,
                principal_comment,
                overall_average,
                overall_grade,
                report_status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error updating report:', error.message);

        res.status(500).json({
            error: 'Failed to update report'
        });
    }
});


router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM reports WHERE report_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        res.status(200).json({
            message: 'Report deleted successfully',
            report: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting report:', error.message);

        res.status(500).json({
            error: 'Failed to delete report'
        });
    }
});

module.exports = router;