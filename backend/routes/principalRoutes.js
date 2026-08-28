const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM principals ORDER BY principal_id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving principals:', error.message);
        res.status(500).json({ error: 'Failed to retrieve principals' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM principals WHERE principal_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Principal not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving principal:', error.message);
        res.status(500).json({ error: 'Failed to retrieve principal' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { user_id, office_number } = req.body;
        const result = await pool.query(
            `INSERT INTO principals (user_id, office_number) VALUES ($1, $2) RETURNING *`,
            [user_id, office_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating principal:', error.message);
        res.status(500).json({ error: 'Failed to create principal' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, office_number } = req.body;
        const result = await pool.query(
            `UPDATE principals SET user_id = $1, office_number = $2 WHERE principal_id = $3 RETURNING *`,
            [user_id, office_number, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Principal not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating principal:', error.message);
        res.status(500).json({ error: 'Failed to update principal' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM principals WHERE principal_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Principal not found' });
        }
        res.status(200).json({
            message: 'Principal deleted successfully',
            principal: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting principal:', error.message);
        res.status(500).json({ error: 'Failed to delete principal' });
    }
});

module.exports = router;