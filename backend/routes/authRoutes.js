const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {

    try {

        // Get username and password from the request body.
        const { username, password } = req.body;

        // Check that both username and password were provided.
        if (!username || !password) {

            return res.status(400).json({
                error: 'Username and password are required'
            });

        }

        // Find the user in the database using the username.
        const result = await pool.query(
            `SELECT user_id, username, password_hash, full_name, email, role
             FROM users
             WHERE username = $1`,
            [username]
        );

        // Check whether the user exists.
        if (result.rows.length === 0) {

            return res.status(401).json({
                error: 'Invalid username or password'
            });

        }

        // Store the user record.
        const user = result.rows[0];

        // Compare the password entered by the user
        // with the hashed password stored in PostgreSQL.
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        // If the passwords do not match, reject the login.
        if (!passwordMatch) {

            return res.status(401).json({
                error: 'Invalid username or password'
            });

        }

        // Generate a JWT token.
        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        // Return a successful login response.
        res.status(200).json({

            message: 'Login successful',

            token: token,

            user: {
                user_id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        console.error('Login error:', error.message);

        res.status(500).json({
            error: 'Internal server error'
        });

    }

});

module.exports = router;