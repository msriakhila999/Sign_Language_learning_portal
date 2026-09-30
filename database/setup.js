const path = require('path');

// Ensure node can locate backend modules if run from root or database folder
const backendModules = path.join(__dirname, '../backend/node_modules');
module.paths.push(backendModules);

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const mysql = require('mysql2/promise');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    console.log('🚀 Starting Database Setup for SignBridge...');
    
    // Connection parameters without database to ensure creation
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Akhila999*',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server successfully.');

        // 1. Read schema and seed files
        const schemaPath = path.join(__dirname, 'schema.sql');
        const seedPath = path.join(__dirname, 'seed.sql');

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        // 2. Execute Schema SQL
        console.log('📦 Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('✅ Database signbridge_db and tables created.');

        // 3. Execute Seed SQL
        console.log('🌱 Executing seed.sql...');
        await connection.query(seedSql);
        console.log('✅ Seed data inserted successfully.');

        // 4. Create default demo user if not exists
        const demoEmail = 'demo@signbridge.org';
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        
        await connection.query(`USE signbridge_db;`);
        const [existing] = await connection.query(`SELECT user_id FROM users WHERE email = ?`, [demoEmail]);
        
        if (existing.length === 0) {
            const [userResult] = await connection.query(
                `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`,
                ['Demo Student', demoEmail, hashedPassword]
            );
            const userId = userResult.insertId;
            console.log(`👤 Created default demo user (ID: ${userId}): ${demoEmail} / Password123!`);

            // Seed initial translation history and practice results for demo user
            await connection.query(`
                INSERT INTO translation_history (user_id, sign_id, detected_sign, confidence, translated_text) VALUES
                (?, 1, 'Hello', 95.50, 'A common greeting.'),
                (?, 2, 'Thank You', 92.00, 'An expression of gratitude and appreciation.'),
                (?, 5, 'Yes', 88.50, 'An affirmative response or agreement.'),
                (?, 11, 'Help', 94.00, 'Requesting or offering assistance.');
            `, [userId, userId, userId, userId]);

            await connection.query(`
                INSERT INTO practice_results (user_id, sign_id, detected_sign, confidence, is_correct) VALUES
                (?, 1, 'Hello', 96.00, 1),
                (?, 2, 'Thank You', 91.50, 1),
                (?, 5, 'Yes', 89.00, 1),
                (?, 6, 'No', 75.00, 0);
            `, [userId, userId, userId, userId]);

            await connection.query(`
                INSERT INTO user_progress (user_id, sign_id, completed, accuracy) VALUES
                (?, 1, 1, 96.00),
                (?, 2, 1, 91.50),
                (?, 5, 1, 89.00),
                (?, 6, 0, 75.00);
            `, [userId, userId, userId, userId]);

            console.log('📊 Inserted initial demo stats and translation history.');
        } else {
            console.log('👤 Demo user already exists.');
        }

        console.log('🎉 SignBridge Database Setup Completed Successfully!');
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

setupDatabase();
