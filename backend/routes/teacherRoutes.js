const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM teachers ORDER BY teacher_id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving teachers:', error.message);
        res.status(500).json({ error: 'Failed to retrieve teachers' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM teachers WHERE teacher_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving teacher:', error.message);
        res.status(500).json({ error: 'Failed to retrieve teacher' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { user_id, department, phone_number } = req.body;
        const result = await pool.query(
            `INSERT INTO teachers (user_id, department, phone_number) VALUES ($1, $2, $3) RETURNING *`,
            [user_id, department, phone_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, department, phone_number } = req.body;
        const result = await pool.query(
            `UPDATE teachers SET user_id = $1, department = $2, phone_number = $3 WHERE teacher_id = $4 RETURNING *`,
            [user_id, department, phone_number, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating teacher:', error.message);
        res.status(500).json({ error: 'Failed to update teacher' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM teachers WHERE teacher_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json({
            message: 'Teacher deleted successfully',
            teacher: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;