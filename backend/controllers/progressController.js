const db = require('../config/db');

// GET /api/dashboard/stats
async function getDashboardStats(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;

        // 1. Signs Learned (completed in user_progress)
        const [[{ signsLearned }]] = await db.query(
            `SELECT COUNT(DISTINCT sign_id) as signsLearned FROM user_progress WHERE user_id = ? AND completed = 1`,
            [userId]
        );

        // 2. Total Practice Sessions
        const [[{ practiceSessions }]] = await db.query(
            `SELECT COUNT(*) as practiceSessions FROM practice_results WHERE user_id = ?`,
            [userId]
        );

        // 3. Total Translations
        const [[{ totalTranslations }]] = await db.query(
            `SELECT COUNT(*) as totalTranslations FROM translation_history WHERE user_id = ?`,
            [userId]
        );

        // 4. Average Accuracy
        const [[{ avgAccuracy }]] = await db.query(
            `SELECT COALESCE(AVG(confidence), 0) as avgAccuracy FROM practice_results WHERE user_id = ? AND is_correct = 1`,
            [userId]
        );

        // 5. Recent Translations
        const [recentTranslations] = await db.query(
            `SELECT translation_id, detected_sign, confidence, translated_text, created_at 
             FROM translation_history 
             WHERE user_id = ? 
             ORDER BY created_at DESC LIMIT 5`,
            [userId]
        );

        // 6. Category Progress Breakdown
        const [categoryProgress] = await db.query(
            `SELECT c.category_id, c.category_name, 
                    COUNT(s.sign_id) as total_signs,
                    COUNT(up.sign_id) as learned_signs
             FROM categories c
             LEFT JOIN signs s ON c.category_id = s.category_id
             LEFT JOIN user_progress up ON s.sign_id = up.sign_id AND up.user_id = ? AND up.completed = 1
             GROUP BY c.category_id, c.category_name`,
            [userId]
        );

        return res.json({
            stats: {
                signsLearned: signsLearned || 0,
                practiceSessions: practiceSessions || 0,
                totalTranslations: totalTranslations || 0,
                averageAccuracy: parseFloat(Number(avgAccuracy || 0).toFixed(1))
            },
            recentTranslations,
            categoryProgress
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
    }
}

// GET /api/progress
async function getProgress(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        const [userProgress] = await db.query(
            `SELECT s.sign_id, s.sign_name, c.category_name, 
                    COALESCE(up.completed, 0) as completed, 
                    COALESCE(up.accuracy, 0) as accuracy,
                    up.last_practiced
             FROM signs s
             JOIN categories c ON s.category_id = c.category_id
             LEFT JOIN user_progress up ON s.sign_id = up.sign_id AND up.user_id = ?
             ORDER BY c.category_id, s.sign_id`,
            [userId]
        );
        return res.json(userProgress);
    } catch (error) {
        console.error('getProgress error:', error);
        return res.status(500).json({ error: 'Failed to fetch progress details.' });
    }
}

module.exports = {
    getDashboardStats,
    getProgress
};
