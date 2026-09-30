const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Akhila999*',
    database: process.env.DB_NAME || 'signbridge_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection on startup
pool.getConnection()
    .then((conn) => {
        console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'signbridge_db');
        conn.release();
    })
    .catch((err) => {
        console.error('❌ Database connection failure:', err.message);
    });

module.exports = pool;
