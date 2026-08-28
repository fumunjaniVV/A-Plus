const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM class_assignments ORDER BY assignment_id`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving class assignments:', error.message);
        res.status(500).json({ error: 'Failed to retrieve class assignments' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM class_assignments WHERE assignment_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class assignment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving class assignment:', error.message);
        res.status(500).json({ error: 'Failed to retrieve class assignment' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id, academic_year_id } = req.body;
        const result = await pool.query(
            `INSERT INTO class_assignments (teacher_id, class_id, subject_id, academic_year_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [teacher_id, class_id, subject_id, academic_year_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating class assignment:', error.message);
        res.status(500).json({ error: 'Failed to create class assignment' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { teacher_id, class_id, subject_id, academic_year_id } = req.body;
        const result = await pool.query(
            `UPDATE class_assignments
             SET teacher_id = $1, class_id = $2, subject_id = $3, academic_year_id = $4
             WHERE assignment_id = $5 RETURNING *`,
            [teacher_id, class_id, subject_id, academic_year_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class assignment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class assignment:', error.message);
        res.status(500).json({ error: 'Failed to update class assignment' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM class_assignments WHERE assignment_id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class assignment not found' });
        }
        res.status(200).json({
            message: 'Class assignment deleted successfully',
            class_assignment: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting class assignment:', error.message);
        res.status(500).json({ error: 'Failed to delete class assignment' });
    }
});

module.exports = router;