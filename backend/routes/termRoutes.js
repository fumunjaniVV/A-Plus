const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM terms ORDER BY term_id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving terms:', error.message);
        res.status(500).json({ error: 'Failed to retrieve terms' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM terms WHERE term_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Term not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving term:', error.message);
        res.status(500).json({ error: 'Failed to retrieve term' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { term_name } = req.body;
        const result = await pool.query(
            `INSERT INTO terms (term_name) VALUES ($1) RETURNING *`,
            [term_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating term:', error.message);
        res.status(500).json({ error: 'Failed to create term' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { term_name } = req.body;
        const result = await pool.query(
            `UPDATE terms SET term_name = $1 WHERE term_id = $2 RETURNING *`,
            [term_name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Term not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating term:', error.message);
        res.status(500).json({ error: 'Failed to update term' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM terms WHERE term_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Term not found' });
        }
        res.status(200).json({
            message: 'Term deleted successfully',
            term: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting term:', error.message);
        res.status(500).json({ error: 'Failed to delete term' });
    }
});

module.exports = router;