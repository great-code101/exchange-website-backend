const mongoose = require('mongoose');

const cryptoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A cryptocurrency must have a name'],
        trim: true
    },
    symbol: {
        type: String,
        required: [true, 'A cryptocurrency must have a symbol'],
        uppercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'A cryptocurrency must have a price']
    },
    image: {
        type: String,
        required: [true, 'A cryptocurrency must have an image URL']
    },
    change24h: {
        type: Number,
        required: [true, 'A cryptocurrency must have a 24h change percentage'],
        default: 0
    }
}, { timestamps: true });

const Crypto = mongoose.model('Crypto', cryptoSchema);

module.exports = Crypto;
