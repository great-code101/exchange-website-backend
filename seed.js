/**
 * Seed Script - Run this ONCE to populate your MongoDB with crypto data
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Crypto = require('./models/Crypto');

const cryptoData = [
    { name: 'Bitcoin', symbol: 'BTC', price: 62450.32, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', change24h: 2.5 },
    { name: 'Ethereum', symbol: 'ETH', price: 3120.18, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', change24h: 1.8 },
    { name: 'Solana', symbol: 'SOL', price: 142.76, image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', change24h: 5.3 },
    { name: 'BNB', symbol: 'BNB', price: 578.40, image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png', change24h: -1.2 },
    { name: 'XRP', symbol: 'XRP', price: 0.5821, image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', change24h: 3.7 },
    { name: 'Cardano', symbol: 'ADA', price: 0.4521, image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png', change24h: -0.8 },
    { name: 'Dogecoin', symbol: 'DOGE', price: 0.1523, image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', change24h: 7.2 },
    { name: 'Avalanche', symbol: 'AVAX', price: 34.72, image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png', change24h: 4.1 },
    { name: 'Polkadot', symbol: 'DOT', price: 7.83, image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png', change24h: -2.3 },
    { name: 'Chainlink', symbol: 'LINK', price: 14.92, image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png', change24h: 6.5 },
    { name: 'Litecoin', symbol: 'LTC', price: 87.34, image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png', change24h: 1.1 },
    { name: 'Shiba Inu', symbol: 'SHIB', price: 0.0000245, image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png', change24h: 9.4 },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas...');

        await Crypto.deleteMany({});
        console.log('Cleared existing crypto data...');

        await Crypto.insertMany(cryptoData);
        console.log(`Successfully seeded ${cryptoData.length} cryptocurrencies!`);

        mongoose.connection.close();
        console.log('Done! Database connection closed.');
    } catch (err) {
        console.error('Seeding Error:', err.message);
        mongoose.connection.close();
    }
};

seedDB();
