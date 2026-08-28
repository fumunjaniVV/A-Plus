// backend/scripts/createStudentAccounts.js

const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function createStudentAccounts() {
    try {
        // Only students that don't already have a linked account.
        const studentsResult = await pool.query(
            `SELECT student_id, admission_number, first_name, last_name
             FROM students
             WHERE user_id IS NULL`
        );

        if (studentsResult.rows.length === 0) {
            console.log('No students are missing a user account. Nothing to do.');
            return;
        }

        const defaultPassword = 'Student123';
        const password_hash = await bcrypt.hash(defaultPassword, 10);

        for (const student of studentsResult.rows) {

            const username = student.admission_number;
            const full_name = `${student.first_name} ${student.last_name}`;
            const email = `${username}@aplus.com`.toLowerCase();

            try {
                // Create the user account.
                const userResult = await pool.query(
                    `INSERT INTO users
                    (
                        username,
                        password_hash,
                        full_name,
                        email,
                        role
                    )
                    VALUES ($1, $2, $3, $4, 'Student')
                    RETURNING user_id`,
                    [
                        username,
                        password_hash,
                        full_name,
                        email
                    ]
                );

                const newUserId = userResult.rows[0].user_id;

                // Link it back to the student record.
                await pool.query(
                    `UPDATE students
                     SET user_id = $1
                     WHERE student_id = $2`,
                    [newUserId, student.student_id]
                );

                console.log(`Created account for ${full_name} (username: ${username})`);

            } catch (innerError) {
                console.error(`Failed to create account for ${student.admission_number}:`, innerError.message);
            }
        }

        console.log(`Done. All accounts use the temporary password: ${defaultPassword}`);

    } catch (error) {
        console.error('Migration error:', error.message);

    } finally {
        await pool.end();
    }
}

createStudentAccounts();