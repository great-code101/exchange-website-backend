const express = require('express');
const cryptoController = require('../controllers/cryptoController');

const router = express.Router();

router.get('/', cryptoController.getAllCrypto);
router.get('/gainers', cryptoController.getTopGainers);
router.get('/new', cryptoController.getNewListings);
router.post('/', cryptoController.createCrypto);

module.exports = router;
