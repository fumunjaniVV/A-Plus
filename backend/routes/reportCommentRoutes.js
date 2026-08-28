const express = require('express');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);
router.use(verifyRole('Administrator', 'Teacher', 'Principal'));


router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM report_comments ORDER BY comment_id');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving report comments:', error.message);
        res.status(500).json({ error: 'Failed to retrieve report comments' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM report_comments WHERE comment_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report comment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving report comment:', error.message);
        res.status(500).json({ error: 'Failed to retrieve report comment' });
    }
});

router.post('/', verifyRole('Teacher', 'Administrator'), async (req, res) => {
    try {
        const { comment_type, performance_level, comment_text } = req.body;
        const result = await pool.query(
            `INSERT INTO report_comments (comment_type, performance_level, comment_text)
             VALUES ($1, $2, $3) RETURNING *`,
            [comment_type, performance_level, comment_text]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating report comment:', error.message);
        res.status(500).json({ error: 'Failed to create report comment' });
    }
});

router.put('/:id', verifyRole('Teacher', 'Principal', 'Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { comment_type, performance_level, comment_text } = req.body;
        const result = await pool.query(
            `UPDATE report_comments
             SET comment_type = $1, performance_level = $2, comment_text = $3
             WHERE comment_id = $4 RETURNING *`,
            [comment_type, performance_level, comment_text, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report comment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating report comment:', error.message);
        res.status(500).json({ error: 'Failed to update report comment' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM report_comments WHERE comment_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report comment not found' });
        }
        res.status(200).json({
            message: 'Report comment deleted successfully',
            comment: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting report comment:', error.message);
        res.status(500).json({ error: 'Failed to delete report comment' });
    }
});

module.exports = router;