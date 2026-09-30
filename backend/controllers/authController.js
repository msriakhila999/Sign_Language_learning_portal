const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if email already exists
        const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user into DB
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, password_hash]
        );

        const userId = result.insertId;

        // Generate JWT token
        const token = jwt.sign(
            { userId, email, name },
            process.env.JWT_SECRET || 'signbridge_secret_jwt_key_2026_sdg10',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Registration successful.',
            token,
            user: { user_id: userId, name, email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find user
        const [users] = await db.query(
            'SELECT user_id, name, email, password_hash FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = users[0];

        // Verify password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'signbridge_secret_jwt_key_2026_sdg10',
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login successful.',
            token,
            user: { user_id: user.user_id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
}

// GET /api/auth/me
async function getMe(req, res) {
    try {
        const userId = req.user.userId;
        const [users] = await db.query(
            'SELECT user_id, name, email, created_at FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.json({ user: users[0] });
    } catch (error) {
        console.error('getMe error:', error);
        return res.status(500).json({ error: 'Failed to fetch user data.' });
    }
}

module.exports = {
    register,
    login,
    getMe
};
