const db = require('../config/db');

// POST /api/practice
async function recordPractice(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        let { sign_id, detected_sign, confidence, is_correct } = req.body;

        if (!detected_sign || confidence === undefined) {
            return res.status(400).json({ error: 'Detected sign and confidence score are required.' });
        }

        let signIdNum = sign_id ? parseInt(sign_id, 10) : null;
        let signMeaning = '';

        if (!signIdNum && detected_sign) {
            const [matched] = await db.query(
                `SELECT sign_id, meaning FROM signs WHERE LOWER(sign_name) = LOWER(?) OR LOWER(sign_name) LIKE LOWER(?) LIMIT 1`,
                [detected_sign, `%${detected_sign}%`]
            );
            if (matched.length > 0) {
                signIdNum = matched[0].sign_id;
                signMeaning = matched[0].meaning;
            }
        } else if (signIdNum) {
            const [matched] = await db.query(`SELECT meaning FROM signs WHERE sign_id = ?`, [signIdNum]);
            if (matched.length > 0) {
                signMeaning = matched[0].meaning;
            }
        }

        const isCorrectBool = is_correct ? 1 : 0;

        // Insert into practice_results
        const [result] = await db.query(
            `INSERT INTO practice_results (user_id, sign_id, detected_sign, confidence, is_correct)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, signIdNum || 1, detected_sign, confidence, isCorrectBool]
        );

        // Update or Insert into user_progress table
        if (signIdNum) {
            await db.query(
                `INSERT INTO user_progress (user_id, sign_id, completed, accuracy, last_practiced)
                 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE 
                 completed = IF(? = 1, 1, completed),
                 accuracy = GREATEST(accuracy, ?),
                 last_practiced = CURRENT_TIMESTAMP`,
                [userId, signIdNum, isCorrectBool, confidence, isCorrectBool, confidence]
            );
        }

        // When practice attempt is correct, also add to translation history archive
        if (isCorrectBool === 1) {
            await db.query(
                `INSERT INTO translation_history (user_id, sign_id, detected_sign, confidence, translated_text)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, signIdNum, detected_sign, confidence, signMeaning || `Verified sign: ${detected_sign}`]
            );
        }

        return res.status(201).json({
            message: 'Practice result recorded successfully.',
            practice_id: result.insertId,
            is_correct: !!isCorrectBool
        });
    } catch (error) {
        console.error('recordPractice error:', error);
        return res.status(500).json({ error: 'Failed to record practice result.' });
    }
}

// GET /api/practice/history
async function getPracticeHistory(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        const [history] = await db.query(
            `SELECT pr.practice_id, pr.sign_id, pr.detected_sign, pr.confidence, 
                    pr.is_correct, pr.created_at, s.sign_name, s.meaning
             FROM practice_results pr
             JOIN signs s ON pr.sign_id = s.sign_id
             WHERE pr.user_id = ?
             ORDER BY pr.created_at DESC`,
            [userId]
        );
        return res.json(history);
    } catch (error) {
        console.error('getPracticeHistory error:', error);
        return res.status(500).json({ error: 'Failed to fetch practice history.' });
    }
}

module.exports = {
    recordPractice,
    getPracticeHistory
};
