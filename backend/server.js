const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow requests from React frontend
    credentials: true
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const signRoutes = require('./routes/signRoutes');
const translationRoutes = require('./routes/translationRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const progressRoutes = require('./routes/progressRoutes');
const userRoutes = require('./routes/userRoutes');

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        app: 'SignBridge Backend API',
        sdg: 'SDG 10 - Reduced Inequalities',
        timestamp: new Date()
    });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/signs', signRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api', progressRoutes);
app.use('/api', userRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error occurred.' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🌐 SignBridge Express Backend running on http://localhost:${PORT}`);
});
