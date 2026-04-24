const Crypto = require('../models/Crypto');

// --- 1. Get ALL Cryptocurrencies ---
exports.getAllCrypto = async (req, res) => {
    try {
        const cryptos = await Crypto.find();
        res.status(200).json({
            status: 'success',
            results: cryptos.length,
            data: { cryptos }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

// --- 2. Get Top Gainers (Highest % increase first) ---
exports.getTopGainers = async (req, res) => {
    try {
        // Sort by change24h in descending order (-1)
        const cryptos = await Crypto.find().sort({ change24h: -1 });
        res.status(200).json({
            status: 'success',
            data: { cryptos }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

// --- 3. Get New Listings (Newest first) ---
exports.getNewListings = async (req, res) => {
    try {
        // Sort by createdAt in descending order (-1)
        const cryptos = await Crypto.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            data: { cryptos }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};

// --- 4. Add New Cryptocurrency ---
exports.createCrypto = async (req, res) => {
    try {
        const newCrypto = await Crypto.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { crypto: newCrypto }
        });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
};
