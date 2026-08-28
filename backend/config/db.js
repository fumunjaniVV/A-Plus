const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

pool.connect()
    .then(async (client) => {
        console.log('Successfully connected to PostgreSQL!');

        const result = await client.query(`
            SELECT
                current_database(),
                current_user,
                inet_server_addr(),
                inet_server_port()
        `);

        console.log(result.rows[0]);

        client.release();
    })
    .catch((error) => {
        console.error('PostgreSQL connection failed:', error.message);
    });

module.exports = pool;