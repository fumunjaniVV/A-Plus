// backend/scripts/fixPlaintextPasswords.js

const bcrypt = require('bcrypt');
const pool = require('./config/db');

// Only the accounts confirmed to have plaintext passwords.
const usersToFix = [
    { username: 'admin1', plainPassword: 'password123' },
    { username: 'teacher1', plainPassword: 'password123' },
    { username: 'principal1', plainPassword: 'password123' }
];

async function fixPasswords() {
    try {
        for (const user of usersToFix) {

            const password_hash = await bcrypt.hash(user.plainPassword, 10);

            const result = await pool.query(
                `UPDATE users
                 SET password_hash = $1
                 WHERE username = $2
                 RETURNING user_id, username`,
                [password_hash, user.username]
            );

            if (result.rows.length === 0) {
                console.log(`No user found with username: ${user.username}`);
            } else {
                console.log(`Updated password_hash for: ${result.rows[0].username} (user_id ${result.rows[0].user_id})`);
            }
        }

        console.log('Done. All three accounts now have properly hashed passwords.');

    } catch (error) {
        console.error('Error fixing passwords:', error.message);

    } finally {
        await pool.end();
    }
}

fixPasswords();