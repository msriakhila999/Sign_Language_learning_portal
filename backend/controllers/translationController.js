const db = require('../config/db');

// POST /api/translations
async function saveTranslation(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1; // Default to demo user if unauthenticated
        let { sign_id, detected_sign, confidence, translated_text } = req.body;

        if (!detected_sign || confidence === undefined) {
            return res.status(400).json({ error: 'Detected sign and confidence score are required.' });
        }

        let textToSave = translated_text || `Detected sign: ${detected_sign}`;
        let signIdToSave = sign_id || null;

        // Auto-resolve sign_id and official meaning from signs table if missing
        if (!signIdToSave && detected_sign) {
            const [signRows] = await db.query(
                `SELECT sign_id, meaning FROM signs WHERE LOWER(sign_name) = LOWER(?) OR LOWER(sign_name) LIKE LOWER(?) LIMIT 1`,
                [detected_sign, `%${detected_sign}%`]
            );
            if (signRows.length > 0) {
                signIdToSave = signRows[0].sign_id;
                if (!translated_text || translated_text.startsWith('Detected sign:')) {
                    textToSave = signRows[0].meaning;
                }
            }
        }

        const [result] = await db.query(
            `INSERT INTO translation_history (user_id, sign_id, detected_sign, confidence, translated_text) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, signIdToSave, detected_sign, confidence, textToSave]
        );

        // Update user_progress so dashboard and learning stats stay synchronized in real time
        if (signIdToSave) {
            await db.query(
                `INSERT INTO user_progress (user_id, sign_id, completed, accuracy, last_practiced)
                 VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
                 ON DUPLICATE KEY UPDATE 
                 completed = 1,
                 accuracy = GREATEST(accuracy, ?),
                 last_practiced = CURRENT_TIMESTAMP`,
                [userId, signIdToSave, confidence, confidence]
            );
        }

        return res.status(201).json({
            message: 'Translation saved successfully.',
            translation_id: result.insertId,
            translation: {
                translation_id: result.insertId,
                user_id: userId,
                sign_id: signIdToSave,
                detected_sign,
                confidence,
                translated_text: textToSave,
                created_at: new Date()
            }
        });
    } catch (error) {
        console.error('saveTranslation error:', error);
        return res.status(500).json({ error: 'Failed to save translation history.' });
    }
}

// GET /api/translations/history
async function getTranslationHistory(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        const { search, limit } = req.query;

        let query = `
            SELECT th.translation_id, th.user_id, th.sign_id, th.detected_sign, 
                   th.confidence, th.translated_text, th.created_at, s.meaning
            FROM translation_history th
            LEFT JOIN signs s ON th.sign_id = s.sign_id
            WHERE th.user_id = ?
        `;
        const queryParams = [userId];

        if (search) {
            query += ` AND (th.detected_sign LIKE ? OR th.translated_text LIKE ?)`;
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm);
        }

        query += ` ORDER BY th.created_at DESC`;

        if (limit) {
            query += ` LIMIT ?`;
            queryParams.push(parseInt(limit, 10));
        }

        const [history] = await db.query(query, queryParams);
        return res.json(history);
    } catch (error) {
        console.error('getTranslationHistory error:', error);
        return res.status(500).json({ error: 'Failed to fetch translation history.' });
    }
}

// DELETE /api/translations/history
async function clearTranslationHistory(req, res) {
    try {
        const userId = req.user ? req.user.userId : 1;
        await db.query('DELETE FROM translation_history WHERE user_id = ?', [userId]);
        return res.json({ message: 'Translation history cleared successfully.' });
    } catch (error) {
        console.error('clearTranslationHistory error:', error);
        return res.status(500).json({ error: 'Failed to clear translation history.' });
    }
}

module.exports = {
    saveTranslation,
    getTranslationHistory,
    clearTranslationHistory
};
