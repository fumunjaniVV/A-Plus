const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


// ============================================================
// GET ALL REPORTS
// Staff see everyone's reports. A Student sees only their own.
// ============================================================

router.get('/', async (req, res) => {
    try {

        if (req.user.role === 'Student') {

            const result = await pool.query(
                `SELECT r.*
                 FROM reports r
                 JOIN students s ON s.student_id = r.student_id
                 WHERE s.user_id = $1
                 ORDER BY r.report_id`,
                [req.user.user_id]
            );

            return res.status(200).json(result.rows);
        }

        const result = await pool.query(
            'SELECT * FROM reports ORDER BY report_id'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error retrieving reports:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve reports'
        });
    }
});


// ============================================================
// GET ONE REPORT
// A Student can only view a report that is actually theirs.
// ============================================================

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


// ============================================================
// CREATE REPORT
// Teacher or Administrator.
// ============================================================

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


// ============================================================
// UPDATE REPORT
// Teacher, Principal, or Administrator.
// ============================================================

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


// ============================================================
// DELETE REPORT
// Administrator only.
// ============================================================

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