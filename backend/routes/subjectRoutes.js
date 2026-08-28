const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM subjects ORDER BY subject_id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving subjects:', error.message);
        res.status(500).json({ error: 'Failed to retrieve subjects' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM subjects WHERE subject_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving subject:', error.message);
        res.status(500).json({ error: 'Failed to retrieve subject' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { subject_code, subject_name } = req.body;
        const result = await pool.query(
            `INSERT INTO subjects (subject_code, subject_name) VALUES ($1, $2) RETURNING *`,
            [subject_code, subject_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subject:', error.message);
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { subject_code, subject_name } = req.body;
        const result = await pool.query(
            `UPDATE subjects SET subject_code = $1, subject_name = $2 WHERE subject_id = $3 RETURNING *`,
            [subject_code, subject_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating subject:', error.message);
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM subjects WHERE subject_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.status(200).json({
            message: 'Subject deleted successfully',
            subject: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting subject:', error.message);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

module.exports = router;