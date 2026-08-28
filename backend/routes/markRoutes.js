const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


// ============================================================
// GET ALL MARKS
// Staff see everyone's marks. A Student sees only marks
// belonging to their own reports.
// ============================================================

router.get('/', async (req, res) => {
    try {

        if (req.user.role === 'Student') {

            const result = await pool.query(
                `SELECT m.*
                 FROM marks m
                 JOIN reports r ON r.report_id = m.report_id
                 JOIN students s ON s.student_id = r.student_id
                 WHERE s.user_id = $1
                 ORDER BY m.mark_id`,
                [req.user.user_id]
            );

            return res.status(200).json(result.rows);
        }

        const result = await pool.query(
            'SELECT * FROM marks ORDER BY mark_id'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error retrieving marks:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve marks'
        });
    }
});


// ============================================================
// GET ONE MARK
// A Student can only view a mark tied to one of their own reports.
// ============================================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM marks WHERE mark_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Mark not found'
            });
        }

        const mark = result.rows[0];

        if (req.user.role === 'Student') {

            const ownerCheck = await pool.query(
                `SELECT s.user_id
                 FROM reports r
                 JOIN students s ON s.student_id = r.student_id
                 WHERE r.report_id = $1`,
                [mark.report_id]
            );

            const isOwner = ownerCheck.rows.length > 0
                && ownerCheck.rows[0].user_id === req.user.user_id;

            if (!isOwner) {
                return res.status(403).json({
                    error: 'You do not have permission to view this mark'
                });
            }
        }

        res.status(200).json(mark);

    } catch (error) {
        console.error('Error retrieving mark:', error.message);

        res.status(500).json({
            error: 'Failed to retrieve mark'
        });
    }
});


// ============================================================
// CREATE MARK
// Teacher or Administrator.
// ============================================================

router.post('/', verifyRole('Teacher', 'Administrator'), async (req, res) => {
    try {
        const {
            report_id,
            subject_id,
            teacher_id,
            mark,
            grade
        } = req.body;

        const result = await pool.query(
            `INSERT INTO marks
            (
                report_id,
                subject_id,
                teacher_id,
                mark,
                grade
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                report_id,
                subject_id,
                teacher_id,
                mark,
                grade
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error creating mark:', error.message);

        res.status(500).json({
            error: 'Failed to create mark'
        });
    }
});


// ============================================================
// UPDATE MARK
// Teacher or Administrator.
// ============================================================

router.put('/:id', verifyRole('Teacher', 'Administrator'), async (req, res) => {
    try {
        const { id } = req.params;

        const {
            report_id,
            subject_id,
            teacher_id,
            mark,
            grade
        } = req.body;

        const result = await pool.query(
            `UPDATE marks
             SET
                report_id = $1,
                subject_id = $2,
                teacher_id = $3,
                mark = $4,
                grade = $5
             WHERE mark_id = $6
             RETURNING *`,
            [
                report_id,
                subject_id,
                teacher_id,
                mark,
                grade,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Mark not found'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error updating mark:', error.message);

        res.status(500).json({
            error: 'Failed to update mark'
        });
    }
});


// ============================================================
// DELETE MARK
// Administrator only.
// ============================================================

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM marks WHERE mark_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Mark not found'
            });
        }

        res.status(200).json({
            message: 'Mark deleted successfully',
            mark: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting mark:', error.message);

        res.status(500).json({
            error: 'Failed to delete mark'
        });
    }
});

module.exports = router;