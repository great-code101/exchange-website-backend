const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Trust the Render load balancer proxy so rate limiting works correctly
app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP. Please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const authRoutes = require('./routes/authRoutes');
const cryptoRoutes = require('./routes/cryptoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);

app.use((req, res, next) => {
    const err = new Error(`Route not found: ${req.originalUrl}`);
    err.statusCode = 404;
    err.status = 'error';
    next(err);
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.status || 'error',
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error('Database connection failed:', err.message));
