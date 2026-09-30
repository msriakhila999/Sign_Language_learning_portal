const db = require('../config/db');

// GET /api/signs
async function getSigns(req, res) {
    try {
        const { category_id, search } = req.query;
        let query = `
            SELECT s.sign_id, s.category_id, s.sign_name, s.meaning, s.description, 
                   s.instructions, s.image_url, s.video_url, c.category_name
            FROM signs s
            JOIN categories c ON s.category_id = c.category_id
            WHERE 1=1
        `;
        const queryParams = [];

        if (category_id) {
            query += ` AND s.category_id = ?`;
            queryParams.push(category_id);
        }

        if (search) {
            query += ` AND (s.sign_name LIKE ? OR s.meaning LIKE ? OR s.description LIKE ?)`;
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY s.sign_id ASC`;

        const [signs] = await db.query(query, queryParams);
        return res.json(signs);
    } catch (error) {
        console.error('getSigns error:', error);
        return res.status(500).json({ error: 'Failed to fetch signs.' });
    }
}

// GET /api/signs/:id
async function getSignById(req, res) {
    try {
        const { id } = req.params;
        const [signs] = await db.query(
            `SELECT s.*, c.category_name 
             FROM signs s
             JOIN categories c ON s.category_id = c.category_id
             WHERE s.sign_id = ?`,
            [id]
        );

        if (signs.length === 0) {
            return res.status(404).json({ error: 'Sign not found.' });
        }

        return res.json(signs[0]);
    } catch (error) {
        console.error('getSignById error:', error);
        return res.status(500).json({ error: 'Failed to fetch sign details.' });
    }
}

module.exports = {
    getSigns,
    getSignById
};
