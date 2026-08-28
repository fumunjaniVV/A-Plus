const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM academic_years ORDER BY academic_year_id'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving academic years:', error.message);
        res.status(500).json({ error: 'Failed to retrieve academic years' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM academic_years WHERE academic_year_id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Academic year not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving academic year:', error.message);
        res.status(500).json({ error: 'Failed to retrieve academic year' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { year_name } = req.body;
        const result = await pool.query(
            `INSERT INTO academic_years (year_name) VALUES ($1) RETURNING *`,
            [year_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating academic year:', error.message);
        res.status(500).json({ error: 'Failed to create academic year' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { year_name } = req.body;
        const result = await pool.query(
            `UPDATE academic_years SET year_name = $1 WHERE academic_year_id = $2 RETURNING *`,
            [year_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Academic year not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating academic year:', error.message);
        res.status(500).json({ error: 'Failed to update academic year' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM academic_years WHERE academic_year_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Academic year not found' });
        }
        res.status(200).json({
            message: 'Academic year deleted successfully',
            academic_year: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting academic year:', error.message);
        res.status(500).json({ error: 'Failed to delete academic year' });
    }
});

module.exports = router;