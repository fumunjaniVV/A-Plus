const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function createTestUser() {
    try {
        const password = 'TestPassword123!';

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (username, password_hash, full_name, email, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, username, full_name, email, role`,
            [
                'testuser',
                passwordHash,
                'Test User',
                'testuser@aplus.com',
                'Administrator'
            ]
        );

        console.log('Test user created successfully:');

        console.log(result.rows[0]);

    } catch (error) {

        console.error('Error creating test user:', error.message);

    } finally {

        await pool.end();

    }
}

createTestUser();