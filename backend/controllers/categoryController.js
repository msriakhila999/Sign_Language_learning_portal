const db = require('../config/db');

// GET /api/categories
async function getCategories(req, res) {
    try {
        const [categories] = await db.query(
            `SELECT c.category_id, c.category_name, c.description, COUNT(s.sign_id) as sign_count
             FROM categories c
             LEFT JOIN signs s ON c.category_id = s.category_id
             GROUP BY c.category_id
             ORDER BY c.category_id ASC`
        );
        return res.json(categories);
    } catch (error) {
        console.error('getCategories error:', error);
        return res.status(500).json({ error: 'Failed to fetch categories.' });
    }
}

module.exports = {
    getCategories
};
