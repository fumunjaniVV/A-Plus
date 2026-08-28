const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM classes ORDER BY class_id`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving classes:', error.message);
        res.status(500).json({ error: 'Failed to retrieve classes' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`SELECT * FROM classes WHERE class_id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving class:', error.message);
        res.status(500).json({ error: 'Failed to retrieve class' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { class_name, grade, academic_year_id } = req.body;
        const result = await pool.query(
            `INSERT INTO classes (class_name, grade, academic_year_id) VALUES ($1, $2, $3) RETURNING *`,
            [class_name, grade, academic_year_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating class:', error.message);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { class_name, grade, academic_year_id } = req.body;
        const result = await pool.query(
            `UPDATE classes SET class_name = $1, grade = $2, academic_year_id = $3 WHERE class_id = $4 RETURNING *`,
            [class_name, grade, academic_year_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class:', error.message);
        res.status(500).json({ error: 'Failed to update class' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM classes WHERE class_id = $1 RETURNING *`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.status(200).json({
            message: 'Class deleted successfully',
            class: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting class:', error.message);
        res.status(500).json({ error: 'Failed to delete class' });
    }
});

module.exports = router;