const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation failed:', errors.array());
        return res.status(400).json({ 
            status: 'error', 
            message: 'Validation failed', 
            errors: errors.array() 
        });
    }
    next();
};

// 1. PUBLIC ROUTES
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], validate, authController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/forgotPassword', [
    body('email').isEmail().withMessage('Please provide a valid email')
], validate, authController.forgotPassword);

router.patch('/resetPassword/:token', [
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], validate, authController.resetPassword);

// 2. PROTECTED ROUTES
router.get('/profile', protect, authController.getProfile);

module.exports = router;
