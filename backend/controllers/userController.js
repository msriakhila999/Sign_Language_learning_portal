const db = require('../config/db');

// GET /api/profile
async function getProfile(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        const [users] = await db.query(
            `SELECT user_id, name, email, created_at FROM users WHERE user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const user = users[0];

        // Fetch user stats summary
        const [[{ signsLearned }]] = await db.query(
            `SELECT COUNT(DISTINCT sign_id) as signsLearned FROM user_progress WHERE user_id = ? AND completed = 1`,
            [userId]
        );

        const [[{ practiceSessions }]] = await db.query(
            `SELECT COUNT(*) as practiceSessions FROM practice_results WHERE user_id = ?`,
            [userId]
        );

        const [[{ translationCount }]] = await db.query(
            `SELECT COUNT(*) as translationCount FROM translation_history WHERE user_id = ?`,
            [userId]
        );

        const [[{ averageAccuracy }]] = await db.query(
            `SELECT COALESCE(AVG(confidence), 0) as averageAccuracy FROM practice_results WHERE user_id = ? AND is_correct = 1`,
            [userId]
        );

        return res.json({
            user,
            stats: {
                signsLearned: signsLearned || 0,
                practiceSessions: practiceSessions || 0,
                translationCount: translationCount || 0,
                averageAccuracy: parseFloat(Number(averageAccuracy || 0).toFixed(1))
            }
        });
    } catch (error) {
        console.error('getProfile error:', error);
        return res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
}

// PUT /api/profile
async function updateProfile(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required.' });
        }

        // Check if email taken by another user
        const [existing] = await db.query(
            `SELECT user_id FROM users WHERE email = ? AND user_id != ?`,
            [email, userId]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email is already in use by another account.' });
        }

        await db.query(
            `UPDATE users SET name = ?, email = ? WHERE user_id = ?`,
            [name, email, userId]
        );

        return res.json({
            message: 'Profile updated successfully.',
            user: { user_id: userId, name, email }
        });
    } catch (error) {
        console.error('updateProfile error:', error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
}

module.exports = {
    getProfile,
    updateProfile
};
