const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const authenticateToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/verifyRole');

const router = express.Router();

router.use(authenticateToken);


router.get('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT user_id, username, full_name, email, role FROM users ORDER BY user_id`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
});

router.get('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT user_id, username, full_name, email, role FROM users WHERE user_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error retrieving user:', error.message);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
});

router.post('/', verifyRole('Administrator'), async (req, res) => {
    try {
        const { username, password, full_name, email, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password_hash, full_name, email, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING user_id, username, full_name, email, role`,
            [username, password_hash, full_name, email, role]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.put('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, email, role } = req.body;

        let result;

        if (password) {
            const password_hash = await bcrypt.hash(password, 10);
            result = await pool.query(
                `UPDATE users
                 SET username = $1, password_hash = $2, full_name = $3, email = $4, role = $5
                 WHERE user_id = $6
                 RETURNING user_id, username, full_name, email, role`,
                [username, password_hash, full_name, email, role, id]
            );
        } else {
            result = await pool.query(
                `UPDATE users
                 SET username = $1, full_name = $2, email = $3, role = $4
                 WHERE user_id = $5
                 RETURNING user_id, username, full_name, email, role`,
                [username, full_name, email, role, id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

router.delete('/:id', verifyRole('Administrator'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, full_name, email, role`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({
            message: 'User deleted successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;